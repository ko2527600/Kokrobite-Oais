import express from "express"
import prisma from "../lib/prisma.js"
import auth from "../middleware/auth.js"
import { getIO } from "../lib/socket.js"

const router = express.Router()

// ─── GET AVAILABLE ORDERS ───
router.get("/available-orders", auth, async (req, res) => {
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
router.post("/accept-order/:orderId", auth, async (req, res) => {
  try {
    const { orderId } = req.params
    const driver = await prisma.driver.findUnique({
      where: { userId: req.user.id }
    })

    if (!driver) return res.status(403).json({ message: "Driver profile not found" })

    const order = await prisma.customerOrder.update({
      where: { id: orderId },
      data: {
        driverId: driver.id,
        deliveryStatus: "ACCEPTED"
      }
    })

    const io = getIO()
    io.to(`order_${orderId}`).emit("order_status", { status: "ACCEPTED", driverId: driver.id })

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── PICKUP ORDER ───
router.post("/pickup-order/:orderId", auth, async (req, res) => {
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
router.post("/complete-order/:orderId", auth, async (req, res) => {
  try {
    const { orderId } = req.params
    const order = await prisma.customerOrder.update({
      where: { id: orderId },
      data: { 
        deliveryStatus: "DELIVERED",
        status: "delivered",
        paymentStatus: "paid" // Assuming payment is confirmed on delivery
      }
    })

    // Update driver earnings
    await prisma.driver.update({
      where: { id: order.driverId },
      data: { totalEarnings: { increment: order.deliveryFee } }
    })

    // Create payout record
    await prisma.payout.create({
      data: {
        driverId: order.driverId,
        amount: order.deliveryFee,
        type: "cash_collection",
        description: `Earnings for order ${order.orderNumber}`
      }
    })

    const io = getIO()
    io.to(`order_${orderId}`).emit("order_status", { status: "DELIVERED" })

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── UPDATE LOCATION ───
router.post("/update-location", auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body
    const driver = await prisma.driver.findUnique({
      where: { userId: req.user.id }
    })

    if (!driver) return res.status(403).json({ message: "Driver profile not found" })

    await prisma.driver.update({
      where: { id: driver.id },
      data: { currentLatitude: latitude, currentLongitude: longitude }
    })

    await prisma.deliverySession.create({
      data: { driverId: driver.id, latitude, longitude }
    })

    const io = getIO()
    io.to(`driver_${driver.id}`).emit("location_updated", { latitude, longitude })

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
