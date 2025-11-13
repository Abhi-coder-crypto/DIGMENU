import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCartItemSchema, insertCustomerSchema, insertWhatsAppSettingsSchema } from "@shared/schema";

declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
  }
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.warn("WARNING: ADMIN_PASSWORD environment variable is not set. Admin access will be disabled.");
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.isAdmin) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized - Admin access required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      if (!ADMIN_PASSWORD) {
        return res.status(503).json({ message: "Admin access is not configured" });
      }
      
      const { password } = req.body;
      if (password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.json({ success: true });
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", async (req, res) => {
    req.session.isAdmin = false;
    req.session.destroy((err: any) => {
      if (err) {
        res.status(500).json({ message: "Logout failed" });
      } else {
        res.json({ success: true });
      }
    });
  });

  app.get("/api/admin/check", async (req, res) => {
    res.json({ isAdmin: !!req.session?.isAdmin });
  });

  // Menu items routes
  app.get("/api/menu-items", async (req, res) => {
    try {
      const items = await storage.getMenuItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/menu-items/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const items = await storage.getMenuItemsByCategory(category);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items by category" });
    }
  });

  app.get("/api/menu-items/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const item = await storage.getMenuItem(id);
      if (!item) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const items = await storage.getCartItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addToCart(validatedData);
      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid cart item data" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await storage.removeFromCart(id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      await storage.clearCart();
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Customer routes
  app.get("/api/customers/phone/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const customer = await storage.getCustomerByPhone(phoneNumber);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.post("/api/customers/visit/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const customer = await storage.incrementCustomerVisits(phoneNumber);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to increment customer visits" });
    }
  });

  app.get("/api/customers", requireAdmin, async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  // WhatsApp settings routes
  app.get("/api/whatsapp-settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getWhatsAppSettings();
      if (!settings) {
        return res.status(404).json({ message: "WhatsApp settings not found" });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WhatsApp settings" });
    }
  });

  app.post("/api/whatsapp-settings", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertWhatsAppSettingsSchema.parse(req.body);
      const settings = await storage.saveWhatsAppSettings(validatedData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid WhatsApp settings data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
