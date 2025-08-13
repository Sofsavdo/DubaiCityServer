import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "partner"] }).default("partner").notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pricing tiers enum
export const pricingTierEnum = pgEnum("pricing_tier", ["basic", "professional", "enterprise"]);

// Partner profiles with 3-tier pricing system
export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessName: text("business_name"),
  description: text("description"),
  pricingTier: pricingTierEnum("pricing_tier").default("basic").notNull(),
  // Fixed monthly payments based on tier
  fixedPayment: decimal("fixed_payment", { precision: 12, scale: 2 }).default("1500000.00"), // Basic: 1.5M UZS
  // Commission rates for bonuses
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("8.00"), // Basic: 8%
  // Revenue tracking
  totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).default("0.00"),
  monthlyRevenue: decimal("monthly_revenue", { precision: 15, scale: 2 }).default("0.00"),
  totalSales: decimal("total_sales", { precision: 15, scale: 2 }).default("0.00"),
  monthlySales: decimal("monthly_sales", { precision: 15, scale: 2 }).default("0.00"),
  totalProfit: decimal("total_profit", { precision: 15, scale: 2 }).default("0.00"),
  monthlyProfit: decimal("monthly_profit", { precision: 15, scale: 2 }).default("0.00"),
  totalBonus: decimal("total_bonus", { precision: 15, scale: 2 }).default("0.00"),
  monthlyBonus: decimal("monthly_bonus", { precision: 15, scale: 2 }).default("0.00"),
  // Premium features access
  hasAnalytics: boolean("has_analytics").default(false),
  hasPrioritySupport: boolean("has_priority_support").default(false),
  hasCustomIntegrations: boolean("has_custom_integrations").default(false),
  hasAdvancedReports: boolean("has_advanced_reports").default(false),
  maxProductRequests: integer("max_product_requests").default(10), // Basic: 10 per month
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products catalog - MySklad inventory system (internal to platform)
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  sku: varchar("sku").unique().notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 12, scale: 2 }), // Себестоимость
  // MySklad inventory tracking
  stockQuantity: integer("stock_quantity").default(0), // Current MySklad stock
  reservedQuantity: integer("reserved_quantity").default(0), // Reserved for orders
  deliveredQuantity: integer("delivered_quantity").default(0), // Total delivered to fulfillment
  soldQuantity: integer("sold_quantity").default(0), // Total sold quantity
  lowStockThreshold: integer("low_stock_threshold").default(10), // Alert threshold
  // Marketplace integration
  uzumMarketSku: varchar("uzum_market_sku"), // SKU in Uzum Market
  yandexMarketSku: varchar("yandex_market_sku"), // SKU in Yandex Market
  lastSyncedAt: timestamp("last_synced_at"), // Last API sync time
  // Partner and status
  partnerId: varchar("partner_id").references(() => partners.id).notNull(), // Who requested this product
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product requests from partners - enhanced with full workflow support
export const productRequests = pgTable("product_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").references(() => partners.id).notNull(),
  productId: varchar("product_id").references(() => products.id), // Set after admin approval
  // Partner submitted data
  productName: text("product_name").notNull(),
  description: text("description"),
  expectedQuantity: integer("expected_quantity").notNull(), // What partner expects to bring
  estimatedPrice: decimal("estimated_price", { precision: 12, scale: 2 }),
  supplierInfo: text("supplier_info"), // Where partner will get it from
  urgencyLevel: varchar("urgency_level", { enum: ["low", "normal", "high", "urgent"] }).default("normal"),
  // Admin review data - can be different from partner data
  adminNotes: text("admin_notes"), // Admin notes about changes
  finalQuantity: integer("final_quantity"), // What admin actually received/approved
  finalPrice: decimal("final_price", { precision: 12, scale: 2 }), // Final price set by admin
  actualQuantity: integer("actual_quantity"), // What actually arrived (for discrepancy tracking)
  actualCondition: text("actual_condition"), // "10 red pens became 9 white pens"
  // Workflow status
  status: varchar("status", { enum: ["pending", "under_review", "needs_partner_confirmation", "approved", "rejected", "in_mysklad"] }).default("pending"),
  // Approval tracking
  reviewedBy: varchar("reviewed_by").references(() => users.id), // Admin who reviewed
  approvedAt: timestamp("approved_at"),
  needsConfirmation: boolean("needs_confirmation").default(false), // If admin made changes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders management
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").references(() => partners.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  customerName: text("customer_name").notNull(),
  quantity: integer("quantity").notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["pending", "processing", "shipped", "delivered", "cancelled"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner registration requests (from landing page)
export const partnerRegistrationRequests = pgTable("partner_registration_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  login: varchar("login").notNull().unique(),
  password: varchar("password").notNull(), // hashed
  phone: varchar("phone").notNull(),
  address: text("address").notNull(),
  productCategory: varchar("product_category").notNull(),
  investmentAmount: decimal("investment_amount", { precision: 15, scale: 2 }).notNull(),
  productQuantity: integer("product_quantity").notNull(),
  status: varchar("status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partner legal information and activation requests
export const partnerLegalInfo = pgTable("partner_legal_info", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").references(() => partners.id).notNull(),
  // Legal details
  companyName: text("company_name"),
  legalForm: varchar("legal_form", { enum: ["LLC", "JSC", "IP", "other"] }),
  taxId: varchar("tax_id"),
  bankAccount: varchar("bank_account"),
  bankName: varchar("bank_name"),
  mfo: varchar("mfo"),
  legalAddress: text("legal_address"),
  // Documents
  companyDocuments: text("company_documents"), // JSON array of document URLs
  // Chosen pricing tier and activation
  chosenTier: pricingTierEnum("chosen_tier").notNull(),
  activationStatus: varchar("activation_status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  partner: one(partners, {
    fields: [users.id],
    references: [partners.userId],
  }),
  sentMessages: many(chatMessages, { relationName: "sender" }),
  receivedMessages: many(chatMessages, { relationName: "receiver" }),
}));

export const partnersRelations = relations(partners, ({ one, many }) => ({
  user: one(users, {
    fields: [partners.userId],
    references: [users.id],
  }),
  productRequests: many(productRequests),
  orders: many(orders),
  legalInfo: one(partnerLegalInfo),
}));

export const productRequestsRelations = relations(productRequests, ({ one }) => ({
  partner: one(partners, {
    fields: [productRequests.partnerId],
    references: [partners.id],
  }),
  product: one(products, {
    fields: [productRequests.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  partner: one(partners, {
    fields: [orders.partnerId],
    references: [partners.id],
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [chatMessages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const partnerLegalInfoRelations = relations(partnerLegalInfo, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerLegalInfo.partnerId],
    references: [partners.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductRequestSchema = createInsertSchema(productRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertPartnerRegistrationRequestSchema = createInsertSchema(partnerRegistrationRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPartnerLegalInfoSchema = createInsertSchema(partnerLegalInfo).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Enhanced schema exports
export type ProductRequest = typeof productRequests.$inferSelect;
export type InsertProductRequest = z.infer<typeof insertProductRequestSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;


export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type PartnerRegistrationRequest = typeof partnerRegistrationRequests.$inferSelect;
export type InsertPartnerRegistrationRequest = z.infer<typeof insertPartnerRegistrationRequestSchema>;
export type PartnerLegalInfo = typeof partnerLegalInfo.$inferSelect;
export type InsertPartnerLegalInfo = z.infer<typeof insertPartnerLegalInfoSchema>;

// Extended types with relations
export type PartnerWithUser = Partner & { user: User };
export type ProductRequestWithDetails = ProductRequest & { 
  partner: PartnerWithUser;
  product?: Product;
};
export type OrderWithDetails = Order & {
  partner: PartnerWithUser;
  product: Product;
};
export type ChatMessageWithSender = ChatMessage & {
  sender: User;
  receiver?: User;
};

// Pricing tier configuration
export type PricingTier = "basic" | "professional" | "enterprise";

export interface TierConfig {
  name: string;
  fixedPayment: number; // Monthly payment in UZS
  commissionRate: number; // Percentage for bonus calculations
  salesThreshold: number; // Monthly sales threshold for bonus in UZS
  maxProductRequests: number;
  features: {
    analytics: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
    advancedReports: boolean;
    apiAccess: boolean;
    customBranding: boolean;
  };
}

export const PRICING_TIERS: Record<PricingTier, TierConfig> = {
  basic: {
    name: "Asosiy",
    fixedPayment: 1500000, // 1.5M UZS
    commissionRate: 8, // 8%
    salesThreshold: 10000000, // 10M UZS (lowered from 75M)
    maxProductRequests: 10,
    features: {
      analytics: false,
      prioritySupport: false,
      customIntegrations: false,
      advancedReports: false,
      apiAccess: false,
      customBranding: false,
    },
  },
  professional: {
    name: "Professional",
    fixedPayment: 3500000, // 3.5M UZS
    commissionRate: 12, // 12%
    salesThreshold: 25000000, // 25M UZS
    maxProductRequests: 50,
    features: {
      analytics: true,
      prioritySupport: true,
      customIntegrations: false,
      advancedReports: true,
      apiAccess: true,
      customBranding: false,
    },
  },
  enterprise: {
    name: "Korporativ",
    fixedPayment: 7500000, // 7.5M UZS
    commissionRate: 18, // 18%
    salesThreshold: 50000000, // 50M UZS
    maxProductRequests: -1, // Unlimited
    features: {
      analytics: true,
      prioritySupport: true,
      customIntegrations: true,
      advancedReports: true,
      apiAccess: true,
      customBranding: true,
    },
  },
};

// Helper functions for pricing calculations
export function calculateBonus(monthlyRevenue: number, tier: PricingTier): number {
  const config = PRICING_TIERS[tier];
  if (monthlyRevenue >= config.salesThreshold) {
    const bonusAmount = (monthlyRevenue * config.commissionRate) / 100;
    return bonusAmount;
  }
  return 0;
}

export function getTotalPayment(monthlyRevenue: number, tier: PricingTier): number {
  const config = PRICING_TIERS[tier];
  const bonus = calculateBonus(monthlyRevenue, tier);
  return config.fixedPayment + bonus;
}

export function hasFeature(tier: PricingTier, feature: keyof TierConfig['features']): boolean {
  return PRICING_TIERS[tier].features[feature];
}
