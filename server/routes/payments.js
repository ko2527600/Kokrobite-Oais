import { Router } from "express"
import axios from "axios"
import prisma from "../lib/prisma.js"
import customerAuth from "../middleware/customerAuth.js"

const router = Router()

const HUBTEL_BASE = "https://api.hubtel.com/v1/merchantaccount"

function getHubtelHeaders() {
  const credentials = Buffer.from(
    `${process.env.HUBTEL_CLIENT_ID}:${process.env.HUBTEL_CLIENT_SECRET}`
  ).toString("base64")
  
  return {
    "Authorization": `Basic ${credentials}`,
    "Content-Type": "application/json"
  }
}

// ─── POST /api/payments/initiate (customerAuth) ───
router.post("/initiate", customerAuth, async (req, res) => {
  try {
    const { orderId, phoneNumber } = req.body

    if (!orderId || !phoneNumber) {
      return res.status(400).json({
        message: "Order ID and phone number are required"
      })
    }

    // Find the order
    const order = await prisma.customerOrder.findFirst({
      where: {
        id: orderId,
        customerId: req.customer.id
      },
      include: { items: true }
    })

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      })
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Order already paid"
      })
    }

    // Build Hubtel payment request
    const paymentData = {
      totalAmount: order.totalAmount,
      description: `Kokrobite Oasis Order ${order.orderNumber}`,
      callbackUrl: process.env.HUBTEL_CALLBACK_URL,
      returnUrl: `${process.env.CLIENT_URL}/portal/orders/${order.id}`,
      cancellationUrl: `${process.env.CLIENT_URL}/portal/orders/${order.id}`,
      merchantAccountNumber: process.env.HUBTEL_MERCHANT_ACCOUNT,
      clientReference: order.id,
      customerPhoneNumber: phoneNumber.replace("+", "").replace(/\s/g, ""),
      customerEmail: req.customer.email || "",
      customerName: req.customer.name,
    }

    // Call Hubtel API
    const response = await axios.post(
      `${HUBTEL_BASE}/receive-money`,
      paymentData,
      { headers: getHubtelHeaders() }
    )

    if (response.data?.status === "Success") {
      // Update order payment status
      await prisma.customerOrder.update({
        where: { id: orderId },
        data: { 
          paymentStatus: "pending",
          paymentMethod: "momo"
        }
      })

      return res.json({
        message: "Payment initiated",
        checkoutUrl: response.data.data?.checkoutDirectUrl,
        clientReference: order.id,
        data: response.data
      })
    } else {
      return res.status(400).json({
        message: "Payment initiation failed",
        error: response.data
      })
    }
  } catch (err) {
    console.error("Hubtel error:", err.message)
    return res.status(500).json({
      message: "Payment service error",
      error: err.message
    })
  }
})

// ─── POST /api/payments/callback (NO auth) ───
router.post("/callback", async (req, res) => {
  try {
    const { Data, ResponseCode, Status } = req.body

    console.log("Hubtel callback:", JSON.stringify(req.body, null, 2))

    if (ResponseCode === "0000" && Status === "Success") {
      const orderId = Data?.ClientReference

      if (orderId) {
        // Update order as paid
        const order = await prisma.customerOrder.update({
          where: { id: orderId },
          data: {
            paymentStatus: "paid",
            status: "confirmed"
          },
          include: { customer: true }
        })

        // Notify customer
        await prisma.notification.create({
          data: {
            customerId: order.customerId,
            type: "order_confirmed",
            title: "Payment Confirmed! ✅",
            message: `Your payment of GHC ${order.totalAmount} for order ${order.orderNumber} was successful. Your order is confirmed!`,
            data: { 
              orderId: order.id,
              orderNumber: order.orderNumber
            }
          }
        })

        // Emit socket event
        const io = req.app.get("io")
        if (io) {
          io.to(`order_${orderId}`).emit("payment_confirmed", {
            orderId,
            status: "confirmed"
          })
        }

        console.log(`✅ Payment confirmed for order: ${order.orderNumber}`)
      }
    } else {
      console.log("Payment failed:", req.body)
      
      const orderId = Data?.ClientReference
      if (orderId) {
        await prisma.customerOrder.update({
          where: { id: orderId },
          data: { paymentStatus: "failed" }
        })
      }
    }

    // Always return 200 to Hubtel
    return res.status(200).json({ message: "Callback received" })
  } catch (err) {
    console.error("Callback error:", err.message)
    return res.status(200).json({ message: "Callback received" })
  }
})

// ─── GET /api/payments/status/:orderId (customerAuth) ───
router.get("/status/:orderId", customerAuth, async (req, res) => {
  try {
    const order = await prisma.customerOrder.findFirst({
      where: {
        id: req.params.orderId,
        customerId: req.customer.id
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        paymentStatus: true,
        paymentMethod: true,
        status: true
      }
    })

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      })
    }

    return res.json(order)
  } catch (err) {
    return res.status(500).json({
      message: err.message
    })
  }
})

// ─── POST /api/payments/verify (customerAuth) ───
router.post("/verify", customerAuth, async (req, res) => {
  try {
    const { clientReference } = req.body

    const response = await axios.get(
      `${HUBTEL_BASE}/transactions/check-status?clientReference=${clientReference}&merchantAccountNumber=${process.env.HUBTEL_MERCHANT_ACCOUNT}`,
      { headers: getHubtelHeaders() }
    )

    return res.json(response.data)
  } catch (err) {
    return res.status(500).json({
      message: err.message
    })
  }
})

export default router
