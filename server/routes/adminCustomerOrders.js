import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js"; // Admin auth middleware

router.use(auth);

// @route   GET /api/admin/customer-orders
// @desc    Get all customer orders
router.get("/", async (req, res) => {
  try {
    const { status, branch, type, startDate, endDate, search } = req.query;
    let where = {};
    
    if (status) where.status = status;
    if (branch) where.branch = branch;
    if (type) where.type = type;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { customer: { email: { contains: search, mode: "insensitive" } } }
      ];
    }

    const orders = await prisma.customerOrder.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true }
        },
        items: true,
        delivery: {
          include: {
            driver: {
              select: { id: true, name: true, phone: true, status: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/admin/customer-orders/:id/status
// @desc    Update kitchen status. Admin cannot set 'delivered' on delivery
//         orders (driver-owned) or write deliveryStatus / driver assignment.
const ADMIN_KITCHEN_STATUSES = new Set([
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "cancelled"
]);
const TERMINAL_STATUSES = new Set(["delivered", "cancelled"]);

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const order = await prisma.customerOrder.findUnique({
      where: { id: req.params.id },
      include: { delivery: true }
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (TERMINAL_STATUSES.has(order.status)) {
      return res.status(409).json({
        message: `Order is already ${order.status} and cannot be changed`
      });
    }

    const isPickup = order.type === "pickup";
    const allowed = isPickup
      ? new Set([...ADMIN_KITCHEN_STATUSES, "delivered"])
      : ADMIN_KITCHEN_STATUSES;

    if (!allowed.has(status)) {
      const reason = status === "delivered"
        ? "Only the driver can mark a delivery order delivered"
        : `Invalid status: ${status}`;
      return res.status(403).json({ message: reason });
    }

    // Block admin from moving a delivery order forward once the driver
    // has picked it up — the driver owns the rest of the flow.
    if (
      !isPickup &&
      order.delivery?.pickedUpAt &&
      status !== "cancelled"
    ) {
      return res.status(409).json({
        message: "Driver has picked up this order. Only cancel is allowed."
      });
    }

    const data = { status };
    if (status === "cancelled") {
      data.deliveryStatus = "CANCELLED";
      data.cancelReason = req.body.cancelReason || "Cancelled by admin";
    }

    const updatedOrder = await prisma.customerOrder.update({
      where: { id: req.params.id },
      data
    });

    // If a driver had accepted this order, release them when admin cancels.
    if (status === "cancelled" && order.delivery && !order.delivery.cancelledAt) {
      await prisma.driverDelivery.update({
        where: { id: order.delivery.id },
        data: {
          cancelledAt: new Date(),
          cancelReason: data.cancelReason
        }
      });
      await prisma.driver.update({
        where: { id: order.delivery.driverId },
        data: { status: "online" }
      });
    }

    // Customer notification
    const messages = {
      confirmed: "Your order has been confirmed! 👍",
      preparing: "Your order is being prepared! 👨‍🍳",
      ready: isPickup
        ? "Your order is ready for pickup! 🛍️"
        : "Your order is ready and waiting for a rider! 🛵",
      delivered: "Your order has been delivered! 🎉",
      cancelled: "Your order has been cancelled."
    };

    if (messages[status]) {
      await prisma.notification.create({
        data: {
          customerId: order.customerId,
          type: `order_${status}`,
          title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: messages[status],
          data: { orderId: order.id, orderNumber: order.orderNumber }
        }
      });
    }

    const io = req.app.get("io");
    io.to(`order_${order.id}`).emit("order_update", { status });

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
