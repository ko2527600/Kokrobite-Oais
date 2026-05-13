import jwt from "jsonwebtoken"
import prisma from "../lib/prisma.js"

export default async function driverAuth(req, res, next) {
  try {
    let token = req.cookies?.ko_driver_token
    
    if (!token) {
      const auth = req.headers.authorization
      if (auth?.startsWith("Bearer ")) {
        token = auth.split(" ")[1]
      }
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    if (decoded.role !== "driver") {
      return res.status(401).json({ message: "Invalid token role" })
    }

    const driver = await prisma.driver.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        phone: true,
        status: true,
        isApproved: true,
        isActive: true,
        rating: true,
        totalDeliveries: true,
        todayEarnings: true,
        totalEarnings: true
      }
    })

    if (!driver) {
      return res.status(401).json({ message: "Driver not found" })
    }

    if (!driver.isActive) {
      return res.status(403).json({ message: "Account suspended" })
    }

    req.driver = driver
    next()
  } catch (err) {
    res.clearCookie("ko_driver_token")
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}
