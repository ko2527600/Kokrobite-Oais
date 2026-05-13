import rateLimit from 'express-rate-limit';
import { z } from 'zod';

// ─── RATE LIMITERS ───
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 15, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again in an hour.' },
});

export const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Order limit reached, please try again later.' },
});

// ─── VALIDATION HELPER ───
export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.errors,
    });
  }
};

// ─── SCHEMAS ───
export const orderSchema = z.object({
  body: z.object({
    type: z.enum(['delivery', 'pickup']),
    branch: z.string().optional(),
    deliveryAddress: z.string().optional(),
    deliveryArea: z.string().optional(),
    deliveryLandmark: z.string().optional(),
    items: z.array(z.object({
      name: z.string(),
      price: z.union([z.number(), z.string()]),
      quantity: z.number().positive(),
    })).min(1),
    paymentMethod: z.string(),
    note: z.string().optional(),
    latitude: z.union([z.number(), z.null()]).optional(),
    longitude: z.union([z.number(), z.null()]).optional(),
  }).refine((data) => {
    if (data.type === 'delivery' && !data.deliveryAddress) return false;
    if (data.type === 'pickup' && !data.branch) return false;
    return true;
  }, {
    message: "Delivery address is required for delivery, and branch for pickup",
    path: ["type"]
  }),
});

