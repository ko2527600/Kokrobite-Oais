import express from "express"
import prisma from "../lib/prisma.js"
import driverAuth from "../middleware/driverAuth.js"
// Removed static socket import

const router = express.Router()

router.use(driverAuth)

// ─── GET AVAILABLE ORDERS ───
// Drivers can claim a delivery order from the moment it's confirmed
// (so they can plan ahead), through to when it's marked ready.
router.get("/available", async (req, res) => {
  try {
    const orders = await prisma.customerOrder.findMany({
      where: {
        status: { in: ["confirmed", "preparing", "ready"] },
        type: "delivery",
        delivery: null
      },
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── GET ACTIVE DELIVERY ───
router.get("/active", async (req, res) => {
  try {
    const active = await prisma.driverDelivery.findFirst({
      where: {
        driverId: req.driver.id,
        deliveredAt: null,
        cancelledAt: null
      },
      include: {
        order: {
          include: {
            items: true,
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true
              }
            }
          }
        }
      }
    })
    res.json(active)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── GET HISTORY ───
router.get("/history", async (req, res) => {
  try {
    const history = await prisma.driverDelivery.findMany({
      where: {
        driverId: req.driver.id,
        deliveredAt: { not: null }
      },
      include: {
        order: {
          include: { items: true }
        }
      },
      orderBy: { deliveredAt: "desc" },
      take: 50
    })
    res.json(history)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── ACCEPT ORDER ───
// Driver claims a delivery order. Does NOT advance kitchen `status` —
// that's admin's responsibility. Tracks driver state via deliveryStatus.
router.post("/:id/accept", async (req, res) => {
  try {
    const { id } = req.params

    const order = await prisma.customerOrder.findUnique({
      where: { id },
      include: { delivery: true }
    })

    if (
      !order ||
      order.type !== "delivery" ||
      order.delivery ||
      !["confirmed", "preparing", "ready"].includes(order.status)
    ) {
      return res.status(400).json({ message: "Order no longer available" })
    }

    const active = await prisma.driverDelivery.findFirst({
      where: {
        driverId: req.driver.id,
        deliveredAt: null,
        cancelledAt: null
      }
    })

    if (active) {
      return res.status(400).json({ message: "Complete your current delivery first" })
    }

    const delivery = await prisma.driverDelivery.create({
      data: {
        driverId: req.driver.id,
        orderId: id,
        acceptedAt: new Date(),
        deliveryFee: order.deliveryFee || 30,
        driverEarning: 20
      }
    })

    await prisma.customerOrder.update({
      where: { id },
      data: { deliveryStatus: "ACCEPTED" }
    })

    await prisma.driver.update({
      where: { id: req.driver.id },
      data: { status: "delivering" }
    })

    await prisma.notification.create({
      data: {
        customerId: order.customerId,
        type: "order_confirmed",
        title: "Driver Assigned! 🛵",
        message: `${req.driver.name} has accepted your order and will pick it up when ready.`,
        data: { orderId: id }
      }
    })

    const io = req.app.get("io")
    io.to(`order_${id}`).emit("order_update", {
      status: order.status,
      deliveryStatus: "ACCEPTED",
      driver: {
        name: req.driver.name,
        phone: req.driver.phone
      }
    })

    res.json({ message: "Order accepted", delivery })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── PICKUP ORDER ───
// Driver may only pickup when the kitchen has marked the order `ready`.
router.post("/:id/pickup", async (req, res) => {
  try {
    const { id } = req.params

    const delivery = await prisma.driverDelivery.findFirst({
      where: {
        orderId: id,
        driverId: req.driver.id
      },
      include: { order: true }
    })

    if (!delivery) return res.status(404).json({ message: "Delivery not found" })
    if (delivery.pickedUpAt) return res.status(400).json({ message: "Already picked up" })
    if (delivery.order.status !== "ready") {
      return res.status(409).json({
        message: "Order is not ready yet. Wait for the kitchen to mark it ready."
      })
    }

    await prisma.driverDelivery.update({
      where: { id: delivery.id },
      data: { pickedUpAt: new Date() }
    })

    const order = await prisma.customerOrder.update({
      where: { id },
      data: { deliveryStatus: "PICKED_UP" }
    })

    await prisma.notification.create({
      data: {
        customerId: order.customerId,
        type: "order_preparing",
        title: "Food Picked Up! 🍽️",
        message: "Your Kokrobite Oasis order has been picked up and is on the way!",
        data: { orderId: id }
      }
    })

    const io = req.app.get("io")
    io.to(`order_${id}`).emit("order_update", {
      status: order.status,
      deliveryStatus: "PICKED_UP"
    })

    res.json({ message: "Pickup confirmed" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── DELIVER ORDER ───
router.post("/:id/deliver", async (req, res) => {
  try {
    const { id } = req.params

    const delivery = await prisma.driverDelivery.findFirst({
      where: { 
        orderId: id, 
        driverId: req.driver.id 
      },
      include: { order: true }
    })

    if (!delivery) return res.status(404).json({ message: "Delivery not found" })
    if (delivery.deliveredAt) return res.status(400).json({ message: "Already delivered" })

    if (!delivery.pickedUpAt) {
      return res.status(409).json({
        message: "Confirm pickup before marking the order delivered"
      })
    }

    await prisma.driverDelivery.update({
      where: { id: delivery.id },
      data: { deliveredAt: new Date() }
    })

    await prisma.customerOrder.update({
      where: { id },
      data: { status: "delivered", deliveryStatus: "DELIVERED" }
    })

    await prisma.driver.update({
      where: { id: req.driver.id },
      data: {
        status: "online",
        totalDeliveries: { increment: 1 },
        totalEarnings: { increment: 20 },
        todayEarnings: { increment: 20 }
      }
    })

    await prisma.payout.create({
      data: {
        driverId: req.driver.id,
        amount: 20,
        type: "delivery_fee",
        description: `Delivery fee for order ${delivery.order.orderNumber}`
      }
    })

    await prisma.notification.create({
      data: {
        customerId: delivery.order.customerId,
        type: "order_delivered",
        title: "Order Delivered! 🎉",
        message: "Your Kokrobite Oasis order has been delivered. Enjoy your meal! Please rate your experience.",
        data: { orderId: id }
      }
    })

    const io = req.app.get("io")
    io.to(`order_${id}`).emit("order_update", { status: "delivered" })

    res.json({ message: "Delivery confirmed" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── CANCEL DELIVERY ───
router.post("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params
    const { cancelReason } = req.body

    const delivery = await prisma.driverDelivery.findFirst({
      where: { 
        orderId: id, 
        driverId: req.driver.id 
      }
    })

    if (!delivery) return res.status(404).json({ message: "Delivery not found" })
    if (delivery.pickedUpAt) return res.status(400).json({ message: "Cannot cancel after pickup" })

    await prisma.driverDelivery.update({
      where: { id: delivery.id },
      data: {
        cancelledAt: new Date(),
        cancelReason
      }
    })

    // Return the order to the available pool — preserve admin's kitchen
    // status, but reset deliveryStatus so another driver can claim it.
    await prisma.customerOrder.update({
      where: { id },
      data: { deliveryStatus: "PENDING" }
    })

    await prisma.driver.update({
      where: { id: req.driver.id },
      data: { status: "online" }
    })

    const io = req.app.get("io")
    io.to(`order_${id}`).emit("order_update", {
      deliveryStatus: "PENDING",
      driver: null
    })

    res.json({ message: "Delivery cancelled" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
