import express from "express"
import prisma from "../lib/prisma.js"
import { getIO } from "../lib/socket.js"
import adminAuth from "../middleware/auth.js"
import customerAuth from "../middleware/customerAuth.js"
import driverAuth from "../middleware/driverAuth.js"

const router = express.Router()

// Helper to determine role and ID from request
const getRequester = (req) => {
  if (req.user) return { role: "admin", id: req.user.id }
  if (req.customer) return { role: "customer", id: req.customer.id }
  if (req.driver) return { role: "driver", id: req.driver.id }
  return null
}

// Flexible middleware to allow any of the 3 roles
const anyAuth = async (req, res, next) => {
  // Try each auth check
  try { await new Promise((resolve) => adminAuth(req, res, resolve)) } catch (e) {}
  if (req.user) return next()

  try { await new Promise((resolve) => customerAuth(req, res, resolve)) } catch (e) {}
  if (req.customer) return next()

  try { await new Promise((resolve) => driverAuth(req, res, resolve)) } catch (e) {}
  if (req.driver) return next()

  return res.status(401).json({ message: "Unauthorized" })
}

// @route   GET /api/chat/:orderId
// @desc    Get chat history for an order
router.get("/:orderId", anyAuth, async (req, res) => {
  try {
    const { orderId } = req.params
    const requester = getRequester(req)

    // Verify order participation
    const order = await prisma.customerOrder.findUnique({
      where: { id: orderId },
      include: { delivery: true }
    })

    if (!order) return res.status(404).json({ message: "Order not found" })

    // Access Control
    if (requester.role === "customer" && order.customerId !== requester.id) {
      return res.status(403).json({ message: "Access denied" })
    }
    if (requester.role === "driver" && order.delivery?.driverId !== requester.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    const messages = await prisma.chatMessage.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" }
    })

    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// @route   POST /api/chat/:orderId
// @desc    Send a message
router.post("/:orderId", anyAuth, async (req, res) => {
  try {
    const { orderId } = req.params
    const { message } = req.body
    const requester = getRequester(req)

    if (!message) return res.status(400).json({ message: "Message cannot be empty" })

    // Verify order participation
    const order = await prisma.customerOrder.findUnique({
      where: { id: orderId },
      include: { delivery: true }
    })

    if (!order) return res.status(404).json({ message: "Order not found" })

    // Access Control
    if (requester.role === "customer" && order.customerId !== requester.id) {
      return res.status(403).json({ message: "Access denied" })
    }
    if (requester.role === "driver" && order.delivery?.driverId !== requester.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        orderId,
        message,
        senderId: requester.id,
        senderRole: requester.role
      }
    })

    // Emit via Socket.io
    const io = getIO()
    io.to(`order_${orderId}`).emit("new_chat_message", chatMessage)

    res.status(201).json(chatMessage)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
