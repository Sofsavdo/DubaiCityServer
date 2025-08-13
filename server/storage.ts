import {
  users,
  partners,
  products,
  productRequests,
  orders,
  chatMessages,
  partnerRegistrationRequests,
  partnerLegalInfo,
  type User,
  type UpsertUser,
  type InsertPartner,
  type Partner,
  type InsertProduct,
  type Product,
  type InsertProductRequest,
  type ProductRequest,
  type InsertOrder,
  type Order,
  type InsertChatMessage,
  type ChatMessage,
  type PartnerRegistrationRequest,
  type InsertPartnerRegistrationRequest,
  type PartnerLegalInfo,
  type InsertPartnerLegalInfo,
  type PartnerWithUser,
  type ProductRequestWithDetails,
  type OrderWithDetails,
  type ChatMessageWithSender,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Partner operations
  createPartner(partner: InsertPartner): Promise<Partner>;
  getPartner(id: string): Promise<PartnerWithUser | undefined>;
  getPartnerByUserId(userId: string): Promise<PartnerWithUser | undefined>;
  updatePartner(id: string, updates: Partial<InsertPartner>): Promise<Partner | undefined>;
  getAllPartners(): Promise<PartnerWithUser[]>;
  approvePartner(userId: string): Promise<User | undefined>;
  
  // Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsByPartnerId(partnerId: string): Promise<Product[]>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Product request operations
  createProductRequest(request: InsertProductRequest): Promise<ProductRequest>;
  getProductRequest(id: string): Promise<ProductRequestWithDetails | undefined>;
  getProductRequestsByPartner(partnerId: string): Promise<ProductRequestWithDetails[]>;
  getAllProductRequests(): Promise<ProductRequestWithDetails[]>;
  updateProductRequestStatus(id: string, status: string, notes?: string): Promise<ProductRequest | undefined>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<OrderWithDetails | undefined>;
  getOrdersByPartner(partnerId: string): Promise<OrderWithDetails[]>;
  getAllOrders(): Promise<OrderWithDetails[]>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(userId1: string, userId2?: string): Promise<ChatMessageWithSender[]>;
  markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  
  // Partner registration requests (from landing page)
  createPartnerRegistrationRequest(request: InsertPartnerRegistrationRequest): Promise<PartnerRegistrationRequest>;
  getAllPartnerRegistrationRequests(): Promise<PartnerRegistrationRequest[]>;
  updatePartnerRegistrationRequestStatus(id: string, status: "approved" | "rejected", rejectionReason?: string): Promise<PartnerRegistrationRequest | undefined>;
  
  // Partner legal info and activation
  createPartnerLegalInfo(legalInfo: InsertPartnerLegalInfo): Promise<PartnerLegalInfo>;
  getPartnerLegalInfoByPartnerId(partnerId: string): Promise<PartnerLegalInfo | undefined>;
  getAllPartnerLegalInfoRequests(): Promise<PartnerLegalInfo[]>;
  updatePartnerActivationStatus(id: string, status: "approved" | "rejected", rejectionReason?: string): Promise<PartnerLegalInfo | undefined>;
  
  // Analytics
  getPartnerRevenue(partnerId: string): Promise<{ totalRevenue: number; commission: number }>;
  getPartnerStats(partnerId: string): Promise<{
    totalOrders: number;
    activeProducts: number;
    totalRevenue: number;
    monthlyRevenue: number;
    commission: number;
  }>;
  
  // Admin analytics
  getAdminStats(): Promise<{
    totalPartners: number;
    pendingRequests: number;
    totalRevenue: number;
    totalOrders: number;
  }>;
  
  // Chat helpers
  getChatUsers(userId: string): Promise<User[]>;
  getUnreadCounts(userId: string): Promise<Record<string, number>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Partner operations
  async createPartner(partner: InsertPartner): Promise<Partner> {
    const [newPartner] = await db.insert(partners).values(partner).returning();
    return newPartner;
  }

  async getPartner(id: string): Promise<PartnerWithUser | undefined> {
    const [partner] = await db
      .select()
      .from(partners)
      .leftJoin(users, eq(partners.userId, users.id))
      .where(eq(partners.id, id));
    
    if (!partner || !partner.users) return undefined;
    
    return {
      ...partner.partners,
      user: partner.users,
    };
  }

  async getPartnerByUserId(userId: string): Promise<PartnerWithUser | undefined> {
    const [partner] = await db
      .select()
      .from(partners)
      .leftJoin(users, eq(partners.userId, users.id))
      .where(eq(partners.userId, userId));
    
    if (!partner || !partner.users) return undefined;
    
    return {
      ...partner.partners,
      user: partner.users,
    };
  }

  async updatePartner(id: string, updates: Partial<InsertPartner>): Promise<Partner | undefined> {
    const [partner] = await db
      .update(partners)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(partners.id, id))
      .returning();
    return partner;
  }

  async getAllPartners(): Promise<PartnerWithUser[]> {
    const result = await db
      .select()
      .from(partners)
      .leftJoin(users, eq(partners.userId, users.id))
      .orderBy(desc(partners.createdAt));
    
    return result
      .filter(row => row.users)
      .map(row => ({
        ...row.partners,
        user: row.users!,
      }));
  }

  async approvePartner(userId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isApproved: true, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Product operations
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
  }

  async getProductsByPartnerId(partnerId: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(and(eq(products.partnerId, partnerId), eq(products.isActive, true)))
      .orderBy(desc(products.createdAt));
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Product request operations
  async createProductRequest(request: InsertProductRequest): Promise<ProductRequest> {
    const [newRequest] = await db.insert(productRequests).values(request).returning();
    return newRequest;
  }

  async getProductRequest(id: string): Promise<ProductRequestWithDetails | undefined> {
    const [request] = await db
      .select()
      .from(productRequests)
      .leftJoin(partners, eq(productRequests.partnerId, partners.id))
      .leftJoin(users, eq(partners.userId, users.id))
      .leftJoin(products, eq(productRequests.productId, products.id))
      .where(eq(productRequests.id, id));
    
    if (!request || !request.partners || !request.users) return undefined;
    
    return {
      ...request.product_requests,
      partner: {
        ...request.partners,
        user: request.users,
      },
      product: request.products || undefined,
    };
  }

  async getProductRequestsByPartner(partnerId: string): Promise<ProductRequestWithDetails[]> {
    const result = await db
      .select()
      .from(productRequests)
      .leftJoin(partners, eq(productRequests.partnerId, partners.id))
      .leftJoin(users, eq(partners.userId, users.id))
      .leftJoin(products, eq(productRequests.productId, products.id))
      .where(eq(productRequests.partnerId, partnerId))
      .orderBy(desc(productRequests.createdAt));
    
    return result
      .filter(row => row.partners && row.users)
      .map(row => ({
        ...row.product_requests,
        partner: {
          ...row.partners!,
          user: row.users!,
        },
        product: row.products || undefined,
      }));
  }

  async getAllProductRequests(): Promise<ProductRequestWithDetails[]> {
    const result = await db
      .select()
      .from(productRequests)
      .leftJoin(partners, eq(productRequests.partnerId, partners.id))
      .leftJoin(users, eq(partners.userId, users.id))
      .leftJoin(products, eq(productRequests.productId, products.id))
      .orderBy(desc(productRequests.createdAt));
    
    return result
      .filter(row => row.partners && row.users)
      .map(row => ({
        ...row.product_requests,
        partner: {
          ...row.partners!,
          user: row.users!,
        },
        product: row.products || undefined,
      }));
  }

  async updateProductRequestStatus(id: string, status: string, notes?: string): Promise<ProductRequest | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (notes) updateData.notes = notes;
    
    const [request] = await db
      .update(productRequests)
      .set(updateData)
      .where(eq(productRequests.id, id))
      .returning();
    return request;
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrder(id: string): Promise<OrderWithDetails | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .leftJoin(partners, eq(orders.partnerId, partners.id))
      .leftJoin(users, eq(partners.userId, users.id))
      .leftJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.id, id));
    
    if (!order || !order.partners || !order.users || !order.products) return undefined;
    
    return {
      ...order.orders,
      partner: {
        ...order.partners,
        user: order.users,
      },
      product: order.products,
    };
  }

  async getOrdersByPartner(partnerId: string): Promise<OrderWithDetails[]> {
    const result = await db
      .select()
      .from(orders)
      .leftJoin(partners, eq(orders.partnerId, partners.id))
      .leftJoin(users, eq(partners.userId, users.id))
      .leftJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.partnerId, partnerId))
      .orderBy(desc(orders.createdAt));
    
    return result
      .filter(row => row.partners && row.users && row.products)
      .map(row => ({
        ...row.orders,
        partner: {
          ...row.partners!,
          user: row.users!,
        },
        product: row.products!,
      }));
  }

  async getAllOrders(): Promise<OrderWithDetails[]> {
    const result = await db
      .select()
      .from(orders)
      .leftJoin(partners, eq(orders.partnerId, partners.id))
      .leftJoin(users, eq(partners.userId, users.id))
      .leftJoin(products, eq(orders.productId, products.id))
      .orderBy(desc(orders.createdAt));
    
    return result
      .filter(row => row.partners && row.users && row.products)
      .map(row => ({
        ...row.orders,
        partner: {
          ...row.partners!,
          user: row.users!,
        },
        product: row.products!,
      }));
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Chat operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getChatMessages(userId1: string, userId2?: string): Promise<ChatMessageWithSender[]> {
    let query = db
      .select()
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.senderId, users.id));

    if (userId2) {
      query = query.where(
        or(
          and(eq(chatMessages.senderId, userId1), eq(chatMessages.receiverId, userId2)),
          and(eq(chatMessages.senderId, userId2), eq(chatMessages.receiverId, userId1))
        )
      );
    } else {
      query = query.where(
        or(eq(chatMessages.senderId, userId1), eq(chatMessages.receiverId, userId1))
      );
    }

    const result = await query.orderBy(desc(chatMessages.createdAt));
    
    return result
      .filter(row => row.users)
      .map(row => ({
        ...row.chat_messages,
        sender: row.users!,
      }));
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(chatMessages.senderId, senderId),
          eq(chatMessages.receiverId, receiverId)
        )
      );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.receiverId, userId),
          eq(chatMessages.isRead, false)
        )
      );
    
    return result.count;
  }

  // Analytics
  async getPartnerRevenue(partnerId: string): Promise<{ totalRevenue: number; commission: number }> {
    const [result] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        commissionRate: partners.commissionRate,
        fixedPayment: partners.fixedPayment,
      })
      .from(orders)
      .leftJoin(partners, eq(orders.partnerId, partners.id))
      .where(eq(orders.partnerId, partnerId))
      .groupBy(partners.commissionRate, partners.fixedPayment);

    if (!result) return { totalRevenue: 0, commission: 0 };

    const totalRevenue = Number(result.totalRevenue) || 0;
    const commissionRate = Number(result.commissionRate) || 15;
    const fixedPayment = Number(result.fixedPayment) || 5500000;
    
    // Calculate tiered commission
    let commission = fixedPayment;
    if (totalRevenue > 50000000) { // 50M threshold
      const exceeding = totalRevenue - 50000000;
      if (exceeding <= 50000000) { // 50M - 100M range
        commission += exceeding * 0.15;
      } else {
        commission += 50000000 * 0.15; // First 50M after threshold
        if (exceeding <= 100000000) { // 100M - 150M range
          commission += (exceeding - 50000000) * 0.20;
        } else {
          commission += 50000000 * 0.20; // Second 50M
          commission += (exceeding - 100000000) * 0.25; // 150M+ range
        }
      }
    }

    return { totalRevenue, commission };
  }

  async getPartnerStats(partnerId: string): Promise<{
    totalOrders: number;
    activeProducts: number;
    totalRevenue: number;
    monthlyRevenue: number;
    commission: number;
  }> {
    const revenueData = await this.getPartnerRevenue(partnerId);
    
    const [orderStats] = await db
      .select({
        totalOrders: sql<number>`COALESCE(COUNT(${orders.id}), 0)`,
      })
      .from(orders)
      .where(eq(orders.partnerId, partnerId));

    const [productStats] = await db
      .select({
        activeProducts: sql<number>`COALESCE(COUNT(${productRequests.id}), 0)`,
      })
      .from(productRequests)
      .where(
        and(
          eq(productRequests.partnerId, partnerId),
          eq(productRequests.status, 'approved')
        )
      );

    // Calculate monthly revenue (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [monthlyStats] = await db
      .select({
        monthlyRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.partnerId, partnerId),
          sql`${orders.createdAt} >= ${startOfMonth}`
        )
      );

    return {
      totalOrders: Number(orderStats?.totalOrders) || 0,
      activeProducts: Number(productStats?.activeProducts) || 0,
      totalRevenue: revenueData.totalRevenue,
      monthlyRevenue: Number(monthlyStats?.monthlyRevenue) || 0,
      commission: revenueData.commission,
    };
  }

  async getAdminStats(): Promise<{
    totalPartners: number;
    pendingRequests: number;
    totalRevenue: number;
    totalOrders: number;
  }> {
    const [partnerStats] = await db
      .select({
        totalPartners: sql<number>`COALESCE(COUNT(${partners.id}), 0)`,
      })
      .from(partners);

    const [requestStats] = await db
      .select({
        pendingRequests: sql<number>`COALESCE(COUNT(${productRequests.id}), 0)`,
      })
      .from(productRequests)
      .where(eq(productRequests.status, 'pending'));

    const [revenueStats] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        totalOrders: sql<number>`COALESCE(COUNT(${orders.id}), 0)`,
      })
      .from(orders);

    return {
      totalPartners: Number(partnerStats?.totalPartners) || 0,
      pendingRequests: Number(requestStats?.pendingRequests) || 0,
      totalRevenue: Number(revenueStats?.totalRevenue) || 0,
      totalOrders: Number(revenueStats?.totalOrders) || 0,
    };
  }

  // Chat helper methods
  async getChatUsers(userId: string): Promise<User[]> {
    const user = await this.getUser(userId);
    if (!user) return [];

    // If admin, get all partners with approved users
    if (user.role === 'admin') {
      const partnersWithUsers = await db
        .select()
        .from(partners)
        .leftJoin(users, eq(partners.userId, users.id))
        .where(eq(users.isApproved, true));

      return partnersWithUsers
        .filter(row => row.users)
        .map(row => row.users!);
    }

    // If partner, get all admins
    const admins = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'));

    return admins;
  }

  async getUnreadCounts(userId: string): Promise<Record<string, number>> {
    const chatUsers = await this.getChatUsers(userId);
    const counts: Record<string, number> = {};

    for (const chatUser of chatUsers) {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.senderId, chatUser.id),
            eq(chatMessages.receiverId, userId),
            eq(chatMessages.isRead, false)
          )
        );
      
      counts[chatUser.id] = Number(result?.count) || 0;
    }

    return counts;
  }

  // Partner registration requests (from landing page)
  async createPartnerRegistrationRequest(request: InsertPartnerRegistrationRequest): Promise<PartnerRegistrationRequest> {
    const [newRequest] = await db.insert(partnerRegistrationRequests).values(request).returning();
    return newRequest;
  }

  async getAllPartnerRegistrationRequests(): Promise<PartnerRegistrationRequest[]> {
    return await db.select().from(partnerRegistrationRequests).orderBy(desc(partnerRegistrationRequests.createdAt));
  }

  async updatePartnerRegistrationRequestStatus(
    id: string, 
    status: "approved" | "rejected", 
    rejectionReason?: string
  ): Promise<PartnerRegistrationRequest | undefined> {
    const [updated] = await db
      .update(partnerRegistrationRequests)
      .set({ 
        status, 
        rejectionReason,
        updatedAt: new Date() 
      })
      .where(eq(partnerRegistrationRequests.id, id))
      .returning();
    return updated;
  }

  // Partner legal info and activation
  async createPartnerLegalInfo(legalInfo: InsertPartnerLegalInfo): Promise<PartnerLegalInfo> {
    const [newLegalInfo] = await db.insert(partnerLegalInfo).values(legalInfo).returning();
    return newLegalInfo;
  }

  async getPartnerLegalInfoByPartnerId(partnerId: string): Promise<PartnerLegalInfo | undefined> {
    const [legalInfo] = await db
      .select()
      .from(partnerLegalInfo)
      .where(eq(partnerLegalInfo.partnerId, partnerId));
    return legalInfo;
  }

  async getAllPartnerLegalInfoRequests(): Promise<PartnerLegalInfo[]> {
    return await db.select().from(partnerLegalInfo).orderBy(desc(partnerLegalInfo.createdAt));
  }

  async updatePartnerActivationStatus(
    id: string, 
    status: "approved" | "rejected", 
    rejectionReason?: string
  ): Promise<PartnerLegalInfo | undefined> {
    const [updated] = await db
      .update(partnerLegalInfo)
      .set({ 
        activationStatus: status, 
        rejectionReason,
        updatedAt: new Date() 
      })
      .where(eq(partnerLegalInfo.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
