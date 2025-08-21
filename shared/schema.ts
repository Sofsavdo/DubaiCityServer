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

// Session storage table - required for custom authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - supports only custom admin credentials
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Admin credentials (hashed password) - REQUIRED for all users
  passwordHash: varchar("password_hash").notNull(),
  username: varchar("username").notNull(),
  // Role and status
  role: varchar("role", { enum: ["admin", "partner"] }).default("partner").notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  // Authentication type - ONLY credentials, NO REPLIT
  authType: varchar("auth_type").default("credentials").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pricing tiers enum - Updated to match database structure
export const pricingTierEnum = pgEnum("pricing_tier", ["basic", "professional", "professional_plus", "enterprise"]);

// Partner profiles with 3-tier pricing system
export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessName: text("business_name"),
  description: text("description"),
  pricingTier: pricingTierEnum("pricing_tier").default("basic").notNull(),
  // Fixed monthly payments based on tier
  fixedPayment: decimal("fixed_payment", { precision: 12, scale: 2 }).default("0.00"), // Basic: 0 UZS (risk-free)
  // Commission rates from net profit
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("35.00"), // Basic: 35% from net profit
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

// Marketplace integrations for partners
export const marketplaceIntegrations = pgTable("marketplace_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").references(() => partners.id).notNull(),
  // Marketplace info
  marketplace: varchar("marketplace", { enum: ["uzum_market", "yandex_market"] }).notNull(),
  storeName: text("store_name").notNull(),
  storeId: varchar("store_id"), // External marketplace store ID
  // API credentials (encrypted)
  apiKey: text("api_key"), // Encrypted API key
  secretKey: text("secret_key"), // Encrypted secret key
  accessToken: text("access_token"), // For OAuth integrations
  refreshToken: text("refresh_token"), // For token refresh
  // Integration settings
  isActive: boolean("is_active").default(true),
  autoSync: boolean("auto_sync").default(false), // Auto sync inventory
  syncFrequency: integer("sync_frequency").default(24), // Hours between syncs
  // Status tracking
  lastSyncAt: timestamp("last_sync_at"),
  lastSyncStatus: varchar("last_sync_status", { enum: ["success", "failed", "partial"] }),
  syncErrors: text("sync_errors"), // JSON array of error messages
  // Statistics
  totalProductsSynced: integer("total_products_synced").default(0),
  totalOrdersImported: integer("total_orders_imported").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketplace product mappings
export const marketplaceProducts = pgTable("marketplace_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationId: varchar("integration_id").references(() => marketplaceIntegrations.id).notNull(),
  productId: varchar("product_id").references(() => products.id), // Internal product
  // Marketplace product info
  marketplaceSku: varchar("marketplace_sku").notNull(), // SKU in marketplace
  marketplaceProductId: varchar("marketplace_product_id").notNull(), // External product ID
  marketplaceName: text("marketplace_name").notNull(),
  marketplacePrice: decimal("marketplace_price", { precision: 12, scale: 2 }),
  marketplaceStock: integer("marketplace_stock").default(0),
  marketplaceStatus: varchar("marketplace_status", { enum: ["active", "inactive", "out_of_stock"] }).default("active"),
  // Sync info
  lastSyncedAt: timestamp("last_synced_at"),
  needsSync: boolean("needs_sync").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketplace orders - imported from external APIs
export const marketplaceOrders = pgTable("marketplace_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationId: varchar("integration_id").references(() => marketplaceIntegrations.id).notNull(),
  orderId: varchar("order_id").references(() => orders.id), // Link to internal order
  // External order info
  externalOrderId: varchar("external_order_id").notNull(), // Order ID from marketplace
  externalOrderNumber: varchar("external_order_number"),
  marketplace: varchar("marketplace", { enum: ["uzum_market", "yandex_market"] }).notNull(),
  // Order details
  orderStatus: varchar("order_status", { enum: ["new", "confirmed", "shipped", "delivered", "cancelled"] }).default("new"),
  orderDate: timestamp("order_date").notNull(),
  deliveryDate: timestamp("delivery_date"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 12, scale: 2 }), // Marketplace commission
  netAmount: decimal("net_amount", { precision: 12, scale: 2 }), // After commission
  // Customer info (if available)
  customerInfo: jsonb("customer_info"), // Customer details from marketplace
  deliveryInfo: jsonb("delivery_info"), // Delivery address and info
  // Sync info
  lastSyncedAt: timestamp("last_synced_at"),
  syncStatus: varchar("sync_status", { enum: ["pending", "synced", "failed"] }).default("pending"),
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
  marketplaceIntegrations: many(marketplaceIntegrations),
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

export const marketplaceIntegrationsRelations = relations(marketplaceIntegrations, ({ one, many }) => ({
  partner: one(partners, {
    fields: [marketplaceIntegrations.partnerId],
    references: [partners.id],
  }),
  products: many(marketplaceProducts),
  orders: many(marketplaceOrders),
}));

export const marketplaceProductsRelations = relations(marketplaceProducts, ({ one }) => ({
  integration: one(marketplaceIntegrations, {
    fields: [marketplaceProducts.integrationId],
    references: [marketplaceIntegrations.id],
  }),
  product: one(products, {
    fields: [marketplaceProducts.productId],
    references: [products.id],
  }),
}));

export const marketplaceOrdersRelations = relations(marketplaceOrders, ({ one }) => ({
  integration: one(marketplaceIntegrations, {
    fields: [marketplaceOrders.integrationId],
    references: [marketplaceIntegrations.id],
  }),
  order: one(orders, {
    fields: [marketplaceOrders.orderId],
    references: [orders.id],
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

export const insertMarketplaceIntegrationSchema = createInsertSchema(marketplaceIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceProductSchema = createInsertSchema(marketplaceProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceOrderSchema = createInsertSchema(marketplaceOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Admin login schema
export const adminLoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Admin creation schema
export const createAdminSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Valid email is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
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
export type MarketplaceIntegration = typeof marketplaceIntegrations.$inferSelect;
export type InsertMarketplaceIntegration = z.infer<typeof insertMarketplaceIntegrationSchema>;
export type MarketplaceProduct = typeof marketplaceProducts.$inferSelect;
export type InsertMarketplaceProduct = z.infer<typeof insertMarketplaceProductSchema>;
export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type InsertMarketplaceOrder = z.infer<typeof insertMarketplaceOrderSchema>;

// Extended types with relations
export type PartnerWithUser = Partner & { 
  user: User; 
  marketplaceIntegrations?: MarketplaceIntegration[];
};
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

// Updated Pricing tier configuration
export type PricingTier = "basic" | "professional" | "professional_plus" | "enterprise";

export interface CommissionTier {
  threshold: number; // Net profit threshold in UZS
  rate: number; // Commission percentage from net profit
}

export interface TierConfig {
  name: string;
  description: string;
  fixedPayment: number; // Monthly fixed payment in UZS
  commissionTiers: CommissionTier[]; // Progressive commission rates
  sptCost: number; // SPT (Stretch, Package, Tag) cost per item
  maxProductRequests: number;
  trialPeriod: number; // Trial period in days
  features: {
    analytics: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
    advancedReports: boolean;
    apiAccess: boolean;
    customBranding: boolean;
    personalManager?: boolean;
    weeklyReports?: boolean;
    monthlyReports?: boolean;
    marketingSupport?: boolean;
    customDashboard?: boolean;
    priorityQueue?: boolean;
    customPackaging?: boolean;
    directExecutiveAccess?: boolean;
  };
}

// Updated Professional Pricing Tiers - Commission from NET PROFIT
export const PRICING_TIERS: Record<PricingTier, TierConfig> = {
  basic: {
    name: "Basic",
    description: "Nol xavfli boshlash - yangi hamkorlar uchun",
    fixedPayment: 0, // Risk-free start
    commissionTiers: [
      { threshold: 5000000, rate: 45 }, // 0-5M: 45%
      { threshold: 15000000, rate: 40 }, // 5-15M: 40%
      { threshold: 30000000, rate: 35 }, // 15-30M: 35%
      { threshold: Infinity, rate: 30 }, // 30M+: 30%
    ],
    sptCost: 2000, // Fixed SPT cost
    maxProductRequests: 25,
    trialPeriod: 60, // 2 months free trial
    features: {
      analytics: true,
      prioritySupport: false,
      customIntegrations: false,
      advancedReports: false,
      apiAccess: false,
      customBranding: false,
      personalManager: true,
      weeklyReports: true,
    },
  },
  professional: {
    name: "Business Standard",
    description: "Kichik biznes uchun barqaror variant",
    fixedPayment: 3500000, // 3.5M UZS
    commissionTiers: [
      { threshold: 10000000, rate: 25 }, // 0-10M: 25%
      { threshold: 25000000, rate: 22 }, // 10-25M: 22%
      { threshold: 50000000, rate: 20 }, // 25-50M: 20%
      { threshold: Infinity, rate: 18 }, // 50M+: 18%
    ],
    sptCost: 2000,
    maxProductRequests: 100,
    trialPeriod: 30,
    features: {
      analytics: true,
      prioritySupport: true,
      customIntegrations: false,
      advancedReports: true,
      apiAccess: true,
      customBranding: false,
      personalManager: false,
      weeklyReports: true,
      monthlyReports: true,
      marketingSupport: true,
    },
  },
  professional_plus: {
    name: "Professional Plus",
    description: "O'rta-katta hajmli savdo uchun premium variant",
    fixedPayment: 6000000,
    commissionTiers: [
      { threshold: 15000000, rate: 20 }, // 0-15M: 20%
      { threshold: 50000000, rate: 18 }, // 15-50M: 18%
      { threshold: Infinity, rate: 15 }, // 50M+: 15%
    ],
    sptCost: 2000,
    maxProductRequests: -1,
    trialPeriod: 30,
    features: {
      analytics: true,
      prioritySupport: true,
      customIntegrations: false,
      advancedReports: true,
      apiAccess: true,
      customBranding: false,
      personalManager: true,
      weeklyReports: true,
      monthlyReports: true,
      marketingSupport: true,
      customDashboard: true,
      priorityQueue: true,
    },
  },
  enterprise: {
    name: "Enterprise Elite", 
    description: "Yirik biznes uchun maxsus xizmat",
    fixedPayment: 10000000, // 10M UZS
    commissionTiers: [
      { threshold: 25000000, rate: 18 }, // 0-25M: 18%
      { threshold: 50000000, rate: 16 }, // 25-50M: 16%
      { threshold: 100000000, rate: 14 }, // 50-100M: 14%
      { threshold: Infinity, rate: 12 }, // 100M+: 12%
    ],
    sptCost: 2000,
    maxProductRequests: -1, // Unlimited
    trialPeriod: 30,
    features: {
      analytics: true,
      prioritySupport: true,
      customIntegrations: true,
      advancedReports: true,
      apiAccess: true,
      customBranding: true,
      personalManager: true,
      weeklyReports: true,
      monthlyReports: true,
      marketingSupport: true,
      customDashboard: true,
      priorityQueue: true,
      customPackaging: true,
      directExecutiveAccess: true,
    },
  },
};

// Updated helper functions for new pricing structure
export function calculateCommission(netProfit: number, tier: PricingTier): { rate: number; amount: number } {
  const config = PRICING_TIERS[tier];
  
  // Find the applicable commission tier based on net profit
  for (const commissionTier of config.commissionTiers) {
    if (netProfit <= commissionTier.threshold) {
      return {
        rate: commissionTier.rate,
        amount: (netProfit * commissionTier.rate) / 100
      };
    }
  }
  
  // Default to the last tier if net profit exceeds all thresholds
  const lastTier = config.commissionTiers[config.commissionTiers.length - 1];
  return {
    rate: lastTier.rate,
    amount: (netProfit * lastTier.rate) / 100
  };
}

export function getTotalFulfillmentFee(netProfit: number, tier: PricingTier): number {
  const config = PRICING_TIERS[tier];
  const commission = calculateCommission(netProfit, tier);
  return config.fixedPayment + commission.amount;
}

export function getPartnerProfit(sales: number, costPrice: number, fulfillmentFee: number, sptCost: number = 0): number {
  // Formula: Sales - Cost Price - Fulfillment Fee - SPT Cost - 3% Tax = Partner Net Profit
  const taxRate = 0.03;
  const beforeTax = sales - costPrice - fulfillmentFee - sptCost;
  const tax = beforeTax * taxRate;
  return beforeTax - tax;
}

export function hasFeature(tier: PricingTier, feature: keyof TierConfig['features']): boolean {
  return PRICING_TIERS[tier].features[feature] ?? false;
}

export function getSPTCost(tier: PricingTier): number {
  return PRICING_TIERS[tier].sptCost;
}

// Helper to calculate total SPT cost for multiple items
export function getTotalSPTCost(tier: PricingTier, itemCount: number = 1): number {
  return PRICING_TIERS[tier].sptCost * itemCount;
}

export function getTrialPeriod(tier: PricingTier): number {
  return PRICING_TIERS[tier].trialPeriod;
}
