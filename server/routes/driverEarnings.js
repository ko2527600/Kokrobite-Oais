import express from "express"
import prisma from "../lib/prisma.js"
import driverAuth from "../middleware/driverAuth.js"
import customerAuth from "../middleware/customerAuth.js"
// Removed static socket import

const router = express.Router()

// ─── EARNINGS SUMMARY ───
router.get("/earnings/summary", driverAuth, async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: req.driver.id },
      select: {
        totalEarnings: true,
        todayEarnings: true,
        totalDeliveries: true,
        rating: true,
        totalRatings: true
      }
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const monthAgo = new Date(today)
    monthAgo.setDate(monthAgo.getDate() - 30)

    const [
      todayDeliveries,
      weekDeliveries,
      weekEarnings,
      monthEarnings,
      recentPayouts
    ] = await Promise.all([
      prisma.driverDelivery.count({
        where: {
          driverId: req.driver.id,
          deliveredAt: { gte: today }
        }
      }),
      prisma.driverDelivery.count({
        where: {
          driverId: req.driver.id,
          deliveredAt: { gte: weekAgo }
        }
      }),
      prisma.payout.aggregate({
        where: {
          driverId: req.driver.id,
          createdAt: { gte: weekAgo }
        },
        _sum: { amount: true }
      }),
      prisma.payout.aggregate({
        where: {
          driverId: req.driver.id,
          createdAt: { gte: monthAgo }
        },
        _sum: { amount: true }
      }),
      prisma.payout.findMany({
        where: { driverId: req.driver.id },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ])

    res.json({
      totalEarnings: driver.totalEarnings,
      todayEarnings: driver.todayEarnings,
      todayDeliveries,
      weekDeliveries,
      weekEarnings: weekEarnings._sum.amount || 0,
      monthEarnings: monthEarnings._sum.amount || 0,
      totalDeliveries: driver.totalDeliveries,
      rating: driver.rating,
      totalRatings: driver.totalRatings,
      recentPayouts
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── EARNINGS HISTORY ───
router.get("/earnings/history", driverAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 20
    const skip = (page - 1) * limit

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where: { driverId: req.driver.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.payout.count({
        where: { driverId: req.driver.id }
      })
    ])

    res.json({
      payouts,
      total,
      page,
      pages: Math.ceil(total / limit)
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── UPDATE STATUS ───
router.patch("/status", driverAuth, async (req, res) => {
  try {
    const { status } = req.body
    
    // Validate status (prisma will also validate enum but better to catch here)
    const validStatuses = ["online", "offline", "delivering"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" })
    }

    await prisma.driver.update({
      where: { id: req.driver.id },
      data: { status }
    })

    const io = req.app.get("io")
    io.emit("driver_status_update", {
      driverId: req.driver.id,
      name: req.driver.name,
      status
    })

    res.json({ status })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── UPDATE LOCATION ───
router.patch("/location", driverAuth, async (req, res) => {
  try {
    const { lat, lng } = req.body

    await prisma.driver.update({
      where: { id: req.driver.id },
      data: {
        currentLat: parseFloat(lat),
        currentLng: parseFloat(lng),
        lastLocationAt: new Date()
      }
    })

    await prisma.deliverySession.create({
      data: {
        driverId: req.driver.id,
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      }
    })

    const active = await prisma.driverDelivery.findFirst({
      where: {
        driverId: req.driver.id,
        deliveredAt: null,
        cancelledAt: null
      }
    })

    if (active) {
      const io = req.app.get("io")
      io.to(`order_${active.orderId}`).emit("driver_location", { lat, lng })
    }

    res.json({ message: "Location updated" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── RATE DRIVER (Customer Auth) ───
router.post("/ratings", customerAuth, async (req, res) => {
  try {
    const { driverId, orderId, rating, comment } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" })
    }

    const order = await prisma.customerOrder.findFirst({
      where: {
        id: orderId,
        customerId: req.customer.id,
        status: "delivered"
      }
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found or not delivered" })
    }

    await prisma.driverRating.create({
      data: {
        driverId,
        customerId: req.customer.id,
        orderId,
        rating: parseInt(rating),
        comment
      }
    })

    // Recalculate average
    const stats = await prisma.driverRating.aggregate({
      where: { driverId },
      _avg: { rating: true },
      _count: { rating: true }
    })

    await prisma.driver.update({
      where: { id: driverId },
      data: {
        rating: stats._avg.rating || 0,
        totalRatings: stats._count.rating
      }
    })

    res.json({ message: "Rating submitted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
