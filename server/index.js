import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"
import prisma from "./lib/prisma.js"

// Routes
import healthRoutes from "./routes/health.js"
import authRoutes from "./routes/auth.js"
import menuRoutes from "./routes/menu.js"
import orderRoutes from "./routes/orders.js"
import galleryRoutes from "./routes/gallery.js"
import branchRoutes from "./routes/branches.js"
import reviewRoutes from "./routes/reviews.js"
import announcementRoutes from "./routes/announcements.js"
import analyticsRoutes from "./routes/analytics.js"
import configRoutes from "./routes/config.js"
import customerAuthRoutes from "./routes/customerAuth.js"
import customerOrderRoutes from "./routes/customerOrders.js"
import customerProfileRoutes from "./routes/customerProfile.js"
import customerReviewRoutes from "./routes/customerReviews.js"
import customerNotifRoutes from "./routes/customerNotifications.js"
import customerFeedbackRoutes from "./routes/customerFeedback.js"
import adminCustomerRoutes from "./routes/adminCustomers.js"
import adminCustomerOrderRoutes from "./routes/adminCustomerOrders.js"
import adminFeedbackRoutes from "./routes/adminFeedback.js"
import deliveryRoutes from "./routes/delivery.js"
import paymentRoutes from "./routes/payments.js"
import driverAuthRoutes from "./routes/driverAuth.js"
import driverOrderRoutes from "./routes/driverOrders.js"
import driverEarningsRoutes from "./routes/driverEarnings.js"
import adminDriverRoutes from "./routes/adminDrivers.js"
import chatRoutes from "./routes/chat.js"

import { createServer } from "http"
import { Server } from "socket.io"
import { globalLimiter } from "./middleware/security.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 5000

// ─── ALLOWED ORIGINS ───
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://kokrobite-oasis.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || allowedOrigins,
    credentials: true
  }
})

app.set("io", io)

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id)
  socket.on("join_order", (orderId) => {
    socket.join(`order_${orderId}`)
    console.log(`Joined room: order_${orderId}`)
  })
  socket.on("update_location", async (data) => {
    const { driverId, lat, lng } = data
    socket.broadcast.emit("driver_location_update", { driverId, lat, lng })
  })
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id)
  })
})

// ─── HEALTH CHECK (Exempt from limiter) ───
app.use("/api/health", healthRoutes)

// ─── MIDDLEWARE ───
app.use(globalLimiter)
app.use((req, res, next) => {
  res.setHeader(
    "Cross-Origin-Opener-Policy", 
    "unsafe-none"
  )
  res.setHeader(
    "Cross-Origin-Embedder-Policy",
    "unsafe-none"
  )
  next()
})

app.use(helmet({
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://accounts.google.com",
        "https://apis.google.com"
      ],
      frameSrc: [
        "'self'",
        "https://accounts.google.com"
      ],
      connectSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://oauth2.googleapis.com",
        process.env.CLIENT_URL,
        "https://kokrobite-oasis.vercel.app"
      ]
    }
  },
  crossOriginResourcePolicy: { 
    policy: "cross-origin" 
  }
}))

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.some(allowed => 
      origin === allowed || 
      origin.endsWith(".vercel.app")
    )) {
      return callback(null, true)
    }
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
  methods: ["GET","POST","PUT",
            "PATCH","DELETE","OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-app-version",
    "Cookie"
  ],
  exposedHeaders: ["Set-Cookie"]
}))

app.options("*", cors())

app.use(morgan(
  process.env.NODE_ENV === "production" ? "combined" : "dev"
))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// ─── STATIC FILES ───
app.use("/uploads", express.static(
  path.join(__dirname, "uploads")
))

// ─── API ROUTES ───
app.use("/api/auth", authRoutes)
app.use("/api/menu", menuRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/gallery", galleryRoutes)
app.use("/api/branches", branchRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/announcements", announcementRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/config", configRoutes)
app.use("/api/customers/auth", customerAuthRoutes)
app.use("/api/customers/orders", customerOrderRoutes)
app.use("/api/customers/profile", customerProfileRoutes)
app.use("/api/customers/reviews", customerReviewRoutes)
app.use("/api/customers/notifications", customerNotifRoutes)
app.use("/api/customers/feedback", customerFeedbackRoutes)
app.use("/api/admin/customers", adminCustomerRoutes)
app.use("/api/admin/customer-orders", adminCustomerOrderRoutes)
app.use("/api/admin/feedback", adminFeedbackRoutes)
app.use("/api/admin/drivers", adminDriverRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/chat", chatRoutes)

// Driver routes
app.use("/api/drivers/auth", driverAuthRoutes)
app.use("/api/drivers/orders", driverOrderRoutes)
app.use("/api/drivers/earnings", driverEarningsRoutes)
app.use("/api/drivers", deliveryRoutes)

// ─── ROOT ───
app.get("/", (req, res) => {
  res.json({ 
    message: "Kokrobite Oasis API is running 🍽️",
    version: "1.0.0",
    status: "ok"
  })
})

// ─── 404 HANDLER ───
app.use((req, res) => {
  res.status(404).json({ 
    message: `Route ${req.method} ${req.url} not found` 
  })
})

// ─── GLOBAL ERROR HANDLER ───
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message)
  
  if (err.message.includes("CORS")) {
    return res.status(403).json({ 
      message: "CORS error", error: err.message 
    })
  }
  
  return res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" 
      && { stack: err.stack })
  })
})

// ─── START SERVER ───
async function start() {
  try {
    await prisma.$connect()
    console.log("✅ Database connected via Prisma Accelerate")
    
    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`)
      console.log(`✅ Environment: ${process.env.NODE_ENV}`)
      console.log(`✅ Health check: http://localhost:${PORT}/api/health`)
    })
  } catch (err) {
    console.error("❌ Failed to start:", err.message)
    process.exit(1)
  }
}

process.on("SIGINT", async () => {
  await prisma.$disconnect()
  console.log("Server shut down gracefully")
  process.exit(0)
})

process.on("SIGTERM", async () => {
  await prisma.$disconnect()
  process.exit(0)
})

start()
