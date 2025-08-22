import {
  users,
  partners,
  products,
  orders,
  chatMessages,
  partnerRegistrationRequests,
  marketplaceIntegrations,
  partnerLegalInfo,
  productRequests,
  type User,
  type Partner,
  type Product,
  type Order,
  type ChatMessage,
  type PartnerRegistrationRequest,
  type InsertUser,
  type InsertPartner,
  type InsertProduct,
  type InsertOrder,
  type InsertChatMessage,
  type InsertPartnerRegistrationRequest,
  type MarketplaceIntegration,
  type InsertMarketplaceIntegration,
  type PartnerLegalInfo,
  type InsertPartnerLegalInfo,
  type ProductRequest,
  type InsertProductRequest,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

// Create session store with proper configuration
const createSessionStore = () => {
  try {
    return new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      },
      tableName: 'sessions',
      createTableIfMissing: true,
    });
  } catch (error) {
    console.error('Failed to create session store:', error);
    // Fallback to memory store for development
    return new session.MemoryStore();
  }
};

export const sessionStore = createSessionStore();

export interface IStorage {
  // Users (Admin only)
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAdminByUsername(username: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createAdmin(adminData: {
    username: string;
    passwordHash: string;
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<User>;

  // Partners
  createPartner(partner: InsertPartner): Promise<Partner>;
  getAllPartners(): Promise<Partner[]>;
  getPartnerById(id: string): Promise<Partner | undefined>;
  getPartnerByUserId(userId: string): Promise<Partner | undefined>;

  // Products
  createProduct(product: InsertProduct): Promise<Product>;
  getAllProducts(): Promise<Product[]>;
  getProductsByPartner(partnerId: string): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByPartner(partnerId: string): Promise<Order[]>;

  // Chat Messages
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(userId1: string, userId2: string): Promise<ChatMessage[]>;

  // Partner Registration Requests
  createPartnerRegistrationRequest(request: InsertPartnerRegistrationRequest): Promise<PartnerRegistrationRequest>;
  getAllPartnerRegistrationRequests(): Promise<PartnerRegistrationRequest[]>;
  getPartnerRegistrationByUsername(username: string): Promise<PartnerRegistrationRequest | undefined>;
  getPartnerRegistrationById(id: string): Promise<PartnerRegistrationRequest | undefined>;
  approvePartnerRegistration(id: string): Promise<void>;
  rejectPartnerRegistration(id: string, reason: string): Promise<void>;

  // Session store
  sessionStore: session.Store; // Changed to session.Store

  // Partner activation (legal info)
  createPartnerActivation(info: InsertPartnerLegalInfo): Promise<PartnerLegalInfo>;
  getPartnerActivationsByPartner(partnerId: string): Promise<PartnerLegalInfo[]>;
  updatePartnerActivationStatus(id: string, status: "pending" | "approved" | "rejected", reason?: string): Promise<void>;

  // Marketplace integrations
  createMarketplaceIntegration(integration: InsertMarketplaceIntegration): Promise<MarketplaceIntegration>;
  getMarketplaceIntegrationsByPartner(partnerId: string): Promise<MarketplaceIntegration[]>;
  deleteMarketplaceIntegration(id: string): Promise<void>;

  // Product fulfillment requests
  createProductRequest(request: InsertProductRequest): Promise<ProductRequest>;
  getAllProductRequests(): Promise<ProductRequest[]>;
  getProductRequestsByPartner(partnerId: string): Promise<ProductRequest[]>;
  updateProductRequestStatus(id: string, status: "pending"|"under_review"|"needs_partner_confirmation"|"approved"|"rejected"|"in_mysklad", options?: { reviewedBy?: string; approvedAt?: Date; needsConfirmation?: boolean; adminNotes?: string; rejectionReason?: string; }): Promise<void>;
  getProductRequestById(id: string): Promise<ProductRequest | undefined>;
  setProductRequestProduct(id: string, productId: string): Promise<void>;
  getAllPartnerActivations(): Promise<PartnerLegalInfo[]>;

  // Inventory & partners
  getLowStockProducts(): Promise<Product[]>;
  updatePartnerTier(partnerId: string, tier: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store; // Changed to session.Store

  constructor() {
    this.sessionStore = sessionStore;
  }

  // Admin Users
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getAdminByUsername(username: string): Promise<User | undefined> {
    try {
      const [admin] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      return admin || undefined;
    } catch (error) {
      console.error("Error getting admin by username:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createAdmin(adminData: {
    username: string;
    passwordHash: string;
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    const [admin] = await db
      .insert(users)
      .values({
        id: `admin-${Date.now()}`,
        username: adminData.username,
        passwordHash: adminData.passwordHash,
        email: adminData.email,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: "admin",
        authType: "credentials",
      })
      .returning();
    return admin;
  }

  // Partners
  async createPartner(partner: InsertPartner): Promise<Partner> {
    const [newPartner] = await db.insert(partners).values(partner).returning();
    return newPartner;
  }

  async getAllPartners(): Promise<Partner[]> {
    return await db.select().from(partners).orderBy(desc(partners.createdAt));
  }

  async getPartnerById(id: string): Promise<Partner | undefined> {
    try {
      const [partner] = await db.select().from(partners).where(eq(partners.id, id));
      return partner || undefined;
    } catch (error) {
      console.error("Error getting partner by ID:", error);
      return undefined;
    }
  }

  async getPartnerByUserId(userId: string): Promise<Partner | undefined> {
    try {
      const [partner] = await db.select().from(partners).where(eq(partners.userId, userId));
      return partner || undefined;
    } catch (error) {
      console.error("Error getting partner by user ID:", error);
      return undefined;
    }
  }

  // Products
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProductsByPartner(partnerId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.partnerId, partnerId))
      .orderBy(desc(products.createdAt));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, id));
      return product || undefined;
    } catch (error) {
      console.error("Error getting product by ID:", error);
      return undefined;
    }
  }

  // Orders
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByPartner(partnerId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.partnerId, partnerId)).orderBy(desc(orders.createdAt));
  }

  // Chat Messages
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getChatMessages(userId1: string, userId2: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(
        eq(chatMessages.senderId, userId1) && eq(chatMessages.receiverId, userId2) ||
        eq(chatMessages.senderId, userId2) && eq(chatMessages.receiverId, userId1)
      )
      .orderBy(chatMessages.createdAt);
  }

  // Partner Registration Requests
  async createPartnerRegistrationRequest(request: InsertPartnerRegistrationRequest): Promise<PartnerRegistrationRequest> {
    const [newRequest] = await db
      .insert(partnerRegistrationRequests)
      .values(request)
      .returning();
    return newRequest;
  }

  async getAllPartnerRegistrationRequests(): Promise<PartnerRegistrationRequest[]> {
    return await db
      .select()
      .from(partnerRegistrationRequests)
      .orderBy(desc(partnerRegistrationRequests.createdAt));
  }

  async getPartnerRegistrationByUsername(username: string): Promise<PartnerRegistrationRequest | undefined> {
    try {
      const [request] = await db
        .select()
        .from(partnerRegistrationRequests)
        .where(eq(partnerRegistrationRequests.login, username));
      return request || undefined;
    } catch (error) {
      console.error("Error getting partner registration by username:", error);
      return undefined;
    }
  }

  async getPartnerRegistrationById(id: string): Promise<PartnerRegistrationRequest | undefined> {
    try {
      const [request] = await db
        .select()
        .from(partnerRegistrationRequests)
        .where(eq(partnerRegistrationRequests.id, id));
      return request || undefined;
    } catch (error) {
      console.error("Error getting partner registration by ID:", error);
      return undefined;
    }
  }

  async approvePartnerRegistration(id: string): Promise<void> {
    await db
      .update(partnerRegistrationRequests)
      .set({ status: "approved" })
      .where(eq(partnerRegistrationRequests.id, id));
  }

  async rejectPartnerRegistration(id: string, reason: string): Promise<void> {
    await db
      .update(partnerRegistrationRequests)
      .set({ status: "rejected", rejectionReason: reason })
      .where(eq(partnerRegistrationRequests.id, id));
  }

  // Partner activation (legal info)
  async createPartnerActivation(info: InsertPartnerLegalInfo): Promise<PartnerLegalInfo> {
    const [row] = await db.insert(partnerLegalInfo).values(info).returning();
    return row;
  }

  async getPartnerActivationsByPartner(partnerId: string): Promise<PartnerLegalInfo[]> {
    return await db.select().from(partnerLegalInfo).where(eq(partnerLegalInfo.partnerId, partnerId)).orderBy(desc(partnerLegalInfo.createdAt));
  }

  async updatePartnerActivationStatus(id: string, status: "pending" | "approved" | "rejected", reason?: string): Promise<void> {
    await db
      .update(partnerLegalInfo)
      .set({ activationStatus: status, rejectionReason: reason, updatedAt: new Date() as any })
      .where(eq(partnerLegalInfo.id, id));
  }

  // Marketplace integrations
  async createMarketplaceIntegration(integration: InsertMarketplaceIntegration): Promise<MarketplaceIntegration> {
    const [row] = await db.insert(marketplaceIntegrations).values(integration).returning();
    return row;
  }

  async getMarketplaceIntegrationsByPartner(partnerId: string): Promise<MarketplaceIntegration[]> {
    return await db
      .select()
      .from(marketplaceIntegrations)
      .where(eq(marketplaceIntegrations.partnerId, partnerId))
      .orderBy(desc(marketplaceIntegrations.createdAt));
  }

  async deleteMarketplaceIntegration(id: string): Promise<void> {
    // Using returning not necessary; drizzle delete returns count for pg
    await db.delete(marketplaceIntegrations).where(eq(marketplaceIntegrations.id, id));
  }

  async updateMarketplaceIntegrationSync(id: string, status: 'success'|'failed'|'partial' = 'success'): Promise<void> {
    await db
      .update(marketplaceIntegrations)
      .set({ lastSyncAt: new Date() as any, lastSyncStatus: status })
      .where(eq(marketplaceIntegrations.id, id));
  }

  // Product fulfillment requests
  async createProductRequest(request: InsertProductRequest): Promise<ProductRequest> {
    const [row] = await db.insert(productRequests).values(request).returning();
    return row;
  }

  async getAllProductRequests(): Promise<ProductRequest[]> {
    return await db.select().from(productRequests).orderBy(desc(productRequests.createdAt));
  }

  async getProductRequestsByPartner(partnerId: string): Promise<ProductRequest[]> {
    return await db
      .select()
      .from(productRequests)
      .where(eq(productRequests.partnerId, partnerId))
      .orderBy(desc(productRequests.createdAt));
  }

  async getProductRequestById(id: string): Promise<ProductRequest | undefined> {
    try {
      const [row] = await db.select().from(productRequests).where(eq(productRequests.id, id));
      return row || undefined;
    } catch (error) {
      console.error('Error getProductRequestById:', error);
      return undefined;
    }
  }

  async updateProductRequestStatus(
    id: string,
    status: "pending"|"under_review"|"needs_partner_confirmation"|"approved"|"rejected"|"in_mysklad",
    options?: { reviewedBy?: string; approvedAt?: Date; needsConfirmation?: boolean; adminNotes?: string; rejectionReason?: string; }
  ): Promise<void> {
    await db
      .update(productRequests)
      .set({
        status,
        reviewedBy: options?.reviewedBy,
        approvedAt: options?.approvedAt as any,
        needsConfirmation: options?.needsConfirmation,
        adminNotes: options?.adminNotes,
        updatedAt: new Date() as any,
      })
      .where(eq(productRequests.id, id));
  }

  async setProductRequestProduct(id: string, productId: string): Promise<void> {
    await db
      .update(productRequests)
      .set({ productId, updatedAt: new Date() as any })
      .where(eq(productRequests.id, id));
  }

  // Partner activations (all)
  async getAllPartnerActivations(): Promise<PartnerLegalInfo[]> {
    return await db.select().from(partnerLegalInfo).orderBy(desc(partnerLegalInfo.createdAt));
  }

  async getLowStockProducts(): Promise<Product[]> {
    const all = await db.select().from(products).orderBy(desc(products.createdAt));
    // Filter where stockQuantity <= lowStockThreshold
    return all.filter((p: any) => (p.stockQuantity ?? 0) <= (p.lowStockThreshold ?? 10));
  }

  async updatePartnerTier(partnerId: string, tier: string): Promise<void> {
    await db
      .update(partners)
      .set({ pricingTier: tier as any, updatedAt: new Date() as any })
      .where(eq(partners.id, partnerId));
  }
}

export const storage = new DatabaseStorage();