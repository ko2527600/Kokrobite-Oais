import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../lib/prisma.js"
import driverAuth from "../middleware/driverAuth.js"

const router = express.Router()

// ─── REGISTER ───
router.post("/register", async (req, res) => {
  try {
    const { 
      name, phone, password, 
      vehicleType, vehicleNumber, 
      licenseNumber, type 
    } = req.body

    const existing = await prisma.driver.findUnique({
      where: { phone }
    })

    if (existing) {
      return res.status(400).json({ message: "Phone already registered" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const driver = await prisma.driver.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        vehicleType,
        vehicleNumber,
        licenseNumber,
        type: type || "freelance",
        isApproved: false,
        status: "offline"
      }
    })

    const { password: _, ...driverWithoutPassword } = driver

    res.status(201).json({
      message: "Registration successful. Await admin approval before login.",
      driver: driverWithoutPassword
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── LOGIN ───
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body

    const driver = await prisma.driver.findUnique({
      where: { phone }
    })

    if (!driver) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    if (!driver.isActive) {
      return res.status(403).json({ message: "Account suspended" })
    }

    if (!driver.isApproved) {
      return res.status(403).json({ 
        message: "Account pending approval. Contact Kokrobite Oasis management." 
      })
    }

    const isMatch = await bcrypt.compare(password, driver.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    await prisma.driver.update({
      where: { id: driver.id },
      data: { lastLoginAt: new Date() }
    })

    const token = jwt.sign(
      { id: driver.id, phone: driver.phone, role: "driver" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.cookie("ko_driver_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    const { password: _, ...driverWithoutPassword } = driver

    res.json({
      token,
      driver: driverWithoutPassword
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── ME ───
router.get("/me", driverAuth, async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: req.driver.id },
      include: {
        _count: {
          select: { deliveries: true }
        }
      }
    })

    const { password: _, ...driverWithoutPassword } = driver
    res.json(driverWithoutPassword)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── LOGOUT ───
router.post("/logout", (req, res) => {
  res.clearCookie("ko_driver_token")
  res.json({ message: "Logged out" })
})

// ─── UPDATE PROFILE ───
router.put("/profile", driverAuth, async (req, res) => {
  try {
    const { name, vehicleType, vehicleNumber, avatar, vehicleImage } = req.body

    const updatedDriver = await prisma.driver.update({
      where: { id: req.driver.id },
      data: { name, vehicleType, vehicleNumber, avatar, vehicleImage }
    })

    const { password: _, ...driverWithoutPassword } = updatedDriver
    res.json(driverWithoutPassword)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── CHANGE PASSWORD ───
router.post("/change-password", driverAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const driver = await prisma.driver.findUnique({
      where: { id: req.driver.id }
    })

    const isMatch = await bcrypt.compare(currentPassword, driver.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Current password incorrect" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.driver.update({
      where: { id: req.driver.id },
      data: { password: hashedPassword }
    })

    res.json({ message: "Password updated" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
