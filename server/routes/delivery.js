import express from "express"
import prisma from "../lib/prisma.js"
import driverAuth from "../middleware/driverAuth.js"

const router = express.Router()

// ─── UPDATE DRIVER STATUS (online/offline/delivering) ───
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
router.post("/update-location", driverAuth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body
    const driverId = req.driver.id
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ message: "Invalid latitude/longitude" })
    }

    await prisma.driver.update({
      where: { id: driverId },
      data: { currentLat: lat, currentLng: lng, lastLocationAt: new Date() }
    })

    const io = req.app.get("io")
    const payload = { driverId, lat, lng, latitude: lat, longitude: lng }
    io.to(`driver_${driverId}`).emit("location_updated", payload)
    io.to(`driver_${driverId}`).emit("driver_location_update", payload)

    // Broadcast to any active order rooms for this driver so the customer can track
    const activeDeliveries = await prisma.driverDelivery.findMany({
      where: { driverId, deliveredAt: null, cancelledAt: null },
      select: { orderId: true }
    })
    for (const d of activeDeliveries) {
      io.to(`order_${d.orderId}`).emit("driver_location_update", payload)
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
