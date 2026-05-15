import express from "express"
import prisma from "../lib/prisma.js"
import auth from "../middleware/auth.js"
import driverAuth from "../middleware/driverAuth.js"
import { getIO } from "../lib/socket.js"

const router = express.Router()

// ─── GET AVAILABLE ORDERS ───
router.get("/available-orders", driverAuth, async (req, res) => {
  try {
    const orders = await prisma.customerOrder.findMany({
      where: {
        status: "ready",
        deliveryStatus: "PENDING",
        type: "delivery"
      },
      include: {
        customer: {
          select: { name: true, phone: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── ACCEPT ORDER ───
router.post("/accept-order/:orderId", driverAuth, async (req, res) => {
  try {
    const { orderId } = req.params
    const driverId = req.driver.id

    const order = await prisma.customerOrder.update({
      where: { id: orderId },
      data: {
        driverId: driverId,
        deliveryStatus: "ACCEPTED",
        status: "confirmed"
      }
    })

    const io = getIO()
    io.to(`order_${orderId}`).emit("order_status", { status: "ACCEPTED", driverId: driverId })

    await prisma.driver.update({ where: { id: driverId }, data: { status: "delivering" } })

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── PICKUP ORDER ───
router.post("/pickup-order/:orderId", driverAuth, async (req, res) => {
  try {
    const { orderId } = req.params
    const order = await prisma.customerOrder.update({
      where: { id: orderId },
      data: { deliveryStatus: "PICKED_UP" }
    })

    const io = getIO()
    io.to(`order_${orderId}`).emit("order_status", { status: "PICKED_UP" })

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── COMPLETE ORDER ───
router.post("/complete-order/:orderId", driverAuth, async (req, res) => {
  try {
    const { orderId } = req.params
    const order = await prisma.customerOrder.update({
      where: { id: orderId },
      data: { 
        deliveryStatus: "DELIVERED",
        status: "delivered",
        paymentStatus: "paid"
      }
    })

    // Update driver earnings
    await prisma.driver.update({
      where: { id: req.driver.id },
      data: { totalEarnings: { increment: order.deliveryFee || 20 } }
    })

    // Create payout record
    await prisma.payout.create({
      data: {
        driverId: req.driver.id,
        amount: order.deliveryFee || 20,
        type: "cash_collection",
        description: `Earnings for order ${order.orderNumber}`
      }
    })

    const io = getIO()
    io.to(`order_${orderId}`).emit("order_status", { status: "DELIVERED" })

    await prisma.driver.update({ where: { id: req.driver.id }, data: { status: "online" } })

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})


// ─── UPDATE DRIVER STATUS (Legacy route compatibility) ───
router.patch("/status", driverAuth, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ["online", "offline", "delivering"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" })
    }

    await prisma.driver.update({
      where: { id: req.driver.id },
      data: { status }
    })

    const io = getIO()
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
router.post("/update-location", driverAuth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body
    const driverId = req.driver.id

    await prisma.driver.update({
      where: { id: driverId },
      data: { currentLat: parseFloat(latitude), currentLng: parseFloat(longitude), lastLocationAt: new Date() }
    })

    const io = getIO()
    io.to(`driver_${driverId}`).emit("location_updated", { latitude, longitude })

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
