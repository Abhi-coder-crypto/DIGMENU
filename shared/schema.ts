import { z } from "zod";
import { ObjectId } from "mongodb";

// MongoDB Schema Types
export interface MenuItem {
  _id: ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  image: string;
  restaurantId: ObjectId;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface CartItem {
  _id: ObjectId;
  menuItemId: ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: ObjectId;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  _id: ObjectId;
  name: string;
  phoneNumber: string;
  dateOfBirth?: string;
  visits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppSettings {
  _id: ObjectId;
  apiKey: string;
  phoneNumberId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Zod schemas for validation
export const insertMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  isVeg: z.boolean(),
  image: z.string().url(),
  restaurantId: z.string().optional(),
  isAvailable: z.boolean().default(true),
});

export const insertCartItemSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().positive().default(1),
});

export const insertUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const insertCustomerSchema = z.object({
  name: z.string().min(1),
  phoneNumber: z.string().min(10).max(15),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format" })
    .refine(
      (val) => {
        const date = new Date(val + 'T00:00:00Z');
        const dateStr = date.toISOString().split('T')[0];
        return dateStr === val;
      },
      { message: "Invalid date" }
    )
    .refine(
      (val) => {
        const today = new Date().toISOString().split('T')[0];
        return val <= today;
      },
      { message: "Date of birth cannot be in the future" }
    )
    .optional(),
});

export const insertWhatsAppSettingsSchema = z.object({
  apiKey: z.string().min(1),
  phoneNumberId: z.string().min(1),
});

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertWhatsAppSettings = z.infer<typeof insertWhatsAppSettingsSchema>;
