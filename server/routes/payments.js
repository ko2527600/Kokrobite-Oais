import express from "express"
import axios from "axios"
import crypto from "crypto"
import prisma from "../lib/prisma.js"
import auth from "../middleware/auth.js"
import { getIO } from "../lib/socket.js"

const router = express.Router()

// ─── HUBTEL AUTH HELPER ───
const getHubtelAuthHeader = () => {
  const auth = Buffer.from(
    `${process.env.HUBTEL_CLIENT_ID}:${process.env.HUBTEL_CLIENT_SECRET}`
  ).toString("base64")
  return `Basic ${auth}`
}

// ─── WEBHOOK SECURITY HELPERS (Using Database instead of Redis) ───
const secureWebhook = async (orderId, amount) => {
  const clientReference = crypto.randomBytes(10).toString("hex")
  await prisma.hubtelTransaction.create({
    data: {
      orderId,
      amount,
      clientReference,
      status: "pending"
    }
  })
  return clientReference
}

const verifyWebhook = async (clientReference) => {
  const transaction = await prisma.hubtelTransaction.findUnique({
    where: { clientReference }
  })
  
  if (!transaction || transaction.status !== "pending") {
    return { success: false }
  }

  return { success: true, orderId: transaction.orderId }
}

// ─── INITIATE HUBTEL CHECKOUT ───
router.post("/create-hubtel-checkout", auth, async (req, res) => {
  try {
    const { orderId, totalAmount, name, email, phone } = req.body

    // 1. Generate security reference
    const clientReference = await secureWebhook(orderId, parseFloat(totalAmount))

    // 2. Prepare Hubtel Payload
    const payload = {
      merchantAccountNumber: process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER,
      totalAmount: parseFloat(totalAmount),
      title: "Kokrobite Oasis Order",
      description: `Payment for Order #${orderId}`,
      callbackUrl: `${process.env.BACKEND_URL}/api/payments/hubtel-webhook`,
      returnUrl: `${process.env.FRONTEND_URL}/portal/order-success`,
      cancellationUrl: `${process.env.FRONTEND_URL}/portal/order-cancel`,
      payeeName: name || req.customer?.name,
      payeeEmail: email || req.customer?.email || "",
      payeeMobileNumber: phone || req.customer?.phone || "",
      clientReference: clientReference,
    }

    // 3. Call Hubtel API
    const response = await axios.post(
      process.env.HUBTEL_ONLINE_CHECKOUT_URL,
      payload,
      {
        headers: {
          Authorization: getHubtelAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    )

    if (response.data && response.data.responseCode === "0000") {
      return res.json({ checkoutUrl: response.data.data.checkoutUrl })
    }

    throw new Error(`Hubtel API error: ${JSON.stringify(response.data)}`)
  } catch (err) {
    console.error("Hubtel Checkout Error:", err.message)
    res.status(500).json({ message: "Failed to initiate payment via Hubtel" })
  }
})

// ─── HUBTEL WEBHOOK ───
router.post("/hubtel-webhook", async (req, res) => {
  try {
    const { ClientReference, Status, Amount, TransactionId, Description } = req.body

    // 1. Verify the webhook
    const verification = await verifyWebhook(ClientReference)
    if (!verification.success) {
      console.warn("Unauthorized or duplicate Hubtel webhook:", ClientReference)
      return res.status(401).json({ status: "error", message: "Invalid reference" })
    }

    const orderId = verification.orderId

    // 2. Update Transaction Record
    await prisma.hubtelTransaction.update({
      where: { clientReference: ClientReference },
      data: {
        status: Status,
        transactionId: TransactionId,
        description: Description
      }
    })

    // 3. Handle Success
    if (Status === "Success") {
      console.log(`✅ Hubtel Payment Success: Order ${orderId}`)
      
      await prisma.customerOrder.update({
        where: { id: orderId },
        data: { paymentStatus: "paid" }
      })

      // Notify via Socket.io
      const io = getIO()
      io.emit("payment_success", { orderId })
    } else {
      console.log(`❌ Hubtel Payment ${Status}: Order ${orderId}`)
    }

    return res.status(200).json({ status: "success" })
  } catch (err) {
    console.error("Hubtel Webhook Error:", err.message)
    return res.status(500).json({ status: "error" })
  }
})

export default router
