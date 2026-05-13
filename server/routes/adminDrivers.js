import express from "express"
import prisma from "../lib/prisma.js"
import auth from "../middleware/auth.js"

const router = express.Router()

router.use(auth)

// ─── LIST DRIVERS ───
router.get("/", async (req, res) => {
  try {
    const { status, type, isApproved, search } = req.query
    const where = {}

    if (status) where.status = status
    if (type) where.type = type
    if (isApproved !== undefined) where.isApproved = isApproved === "true"

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } }
      ]
    }

    const drivers = await prisma.driver.findMany({
      where,
      include: {
        _count: {
          select: {
            deliveries: true,
            ratings: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const safeDrivers = drivers.map(d => {
      const { password, ...rest } = d
      return rest
    })

    res.json(safeDrivers)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── DRIVER STATS ───
router.get("/stats", async (req, res) => {
  try {
    const [total, online, delivering, pending, approved] = await Promise.all([
      prisma.driver.count(),
      prisma.driver.count({ where: { status: "online" } }),
      prisma.driver.count({ where: { status: "delivering" } }),
      prisma.driver.count({ where: { isApproved: false } }),
      prisma.driver.count({ where: { isApproved: true } })
    ])

    res.json({
      total,
      online,
      delivering,
      pending,
      approved,
      offline: total - online - delivering
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── GET SINGLE DRIVER ───
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        deliveries: {
          include: {
            order: {
              include: { items: true }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 20
        },
        ratings: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        payouts: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        _count: {
          select: {
            deliveries: true,
            ratings: true,
            reports: true
          }
        },
        reports: {
          orderBy: { createdAt: "desc" },
          take: 50
        }
      }
    })

    if (!driver) return res.status(404).json({ message: "Driver not found" })

    const { password, ...safeDriver } = driver
    res.json(safeDriver)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── TOGGLE APPROVAL ───
router.patch("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params
    const driver = await prisma.driver.findUnique({ where: { id } })
    if (!driver) return res.status(404).json({ message: "Driver not found" })

    const updated = await prisma.driver.update({
      where: { id },
      data: { isApproved: !driver.isApproved }
    })

    const io = req.app.get("io")
    io.emit("driver_status_update", {
      driverId: id,
      name: updated.name,
      status: updated.status,
      isApproved: updated.isApproved
    })

    const { password, ...safeDriver } = updated
    res.json(safeDriver)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── TOGGLE SUSPEND ───
router.patch("/:id/suspend", async (req, res) => {
  try {
    const { id } = req.params
    const driver = await prisma.driver.findUnique({ where: { id } })
    if (!driver) return res.status(404).json({ message: "Driver not found" })

    const updated = await prisma.driver.update({
      where: { id },
      data: { isActive: !driver.isActive }
    })

    const io = req.app.get("io")
    io.emit("driver_status_update", {
      driverId: id,
      name: updated.name,
      status: updated.status,
      isActive: updated.isActive
    })

    const { password, ...safeDriver } = updated
    res.json(safeDriver)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── UPDATE DRIVER ───
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { name, vehicleType, vehicleNumber, licenseNumber, type } = req.body

    const updated = await prisma.driver.update({
      where: { id },
      data: {
        name,
        vehicleType,
        vehicleNumber,
        licenseNumber,
        type
      }
    })

    const { password, ...safeDriver } = updated
    res.json(safeDriver)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── DELETE DRIVER ───
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const count = await prisma.driverDelivery.count({
      where: { driverId: id }
    })

    if (count > 0) {
      return res.status(400).json({ 
        message: "Cannot delete driver with delivery history" 
      })
    }

    await prisma.driver.delete({
      where: { id }
    })

    res.json({ message: "Driver deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── RESET TODAY EARNINGS ───
router.patch("/:id/reset-earnings", async (req, res) => {
  try {
    const { id } = req.params
    await prisma.driver.update({
      where: { id },
      data: { todayEarnings: 0 }
    })
    res.json({ message: "Today earnings reset" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── ADD STRIKE ───
router.patch("/:id/add-strike", async (req, res) => {
  try {
    const { id } = req.params
    const driver = await prisma.driver.update({
      where: { id },
      data: { strikes: { increment: 1 } }
    })
    
    // Auto-suspend if strikes reach 3
    if (driver.strikes >= 3 && driver.isActive) {
      await prisma.driver.update({
        where: { id },
        data: { isActive: false }
      })
    }
    
    res.json({ message: "Strike added", strikes: driver.strikes, isActive: driver.isActive })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── RESET STRIKES ───
router.patch("/:id/reset-strikes", async (req, res) => {
  try {
    const { id } = req.params
    await prisma.driver.update({
      where: { id },
      data: { strikes: 0 }
    })
    res.json({ message: "Strikes reset" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── GET ALL REPORTS ───
router.get("/all/reports", async (req, res) => {
  try {
    const reports = await prisma.driverReport.findMany({
      include: {
        driver: { select: { name: true, phone: true } },
        order: { select: { orderNumber: true } }
      },
      orderBy: { createdAt: "desc" }
    })
    res.json(reports)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})


export default router
