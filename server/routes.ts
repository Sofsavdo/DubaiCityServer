import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertPartnerSchema,
  insertProductSchema,
  insertProductRequestSchema,
  insertOrderSchema,
  insertChatMessageSchema,
  insertPartnerRegistrationRequestSchema,
  insertPartnerLegalInfoSchema,
} from "@shared/schema";
import bcrypt from 'bcryptjs';
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Partner routes
  app.post('/api/partners', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const partnerData = insertPartnerSchema.parse({ ...req.body, userId });
      const partner = await storage.createPartner(partnerData);
      res.json(partner);
    } catch (error) {
      console.error("Error creating partner:", error);
      res.status(400).json({ message: "Failed to create partner profile" });
    }
  });

  app.get('/api/partners/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const partner = await storage.getPartnerByUserId(userId);
      res.json(partner);
    } catch (error) {
      console.error("Error fetching partner:", error);
      res.status(500).json({ message: "Failed to fetch partner profile" });
    }
  });

  app.get('/api/partners', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const partners = await storage.getAllPartners();
      res.json(partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      res.status(500).json({ message: "Failed to fetch partners" });
    }
  });

  app.post('/api/partners/:userId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const approvedUser = await storage.approvePartner(req.params.userId);
      res.json(approvedUser);
    } catch (error) {
      console.error("Error approving partner:", error);
      res.status(500).json({ message: "Failed to approve partner" });
    }
  });

  // Product routes
  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.get('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const updates = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, updates);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  // Product request routes
  app.post('/api/product-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const partner = await storage.getPartnerByUserId(userId);
      if (!partner) {
        return res.status(404).json({ message: "Partner profile not found" });
      }
      
      const requestData = insertProductRequestSchema.parse({
        ...req.body,
        partnerId: partner.id,
      });
      const request = await storage.createProductRequest(requestData);
      res.json(request);
    } catch (error) {
      console.error("Error creating product request:", error);
      res.status(400).json({ message: "Failed to create product request" });
    }
  });

  app.get('/api/product-requests', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role === 'admin') {
        const requests = await storage.getAllProductRequests();
        res.json(requests);
      } else {
        // Try to get or create partner profile
        let partner = await storage.getPartnerByUserId(req.user.claims.sub);
        if (!partner) {
          // Create default partner profile for authenticated user
          partner = await storage.createPartner({
            userId: req.user.claims.sub,
            businessName: user?.firstName || 'Yangi Biznes',
            contactInfo: user?.email || 'contact@business.com',
            category: 'general',
            status: 'active'
          });
        }
        const requests = await storage.getProductRequestsByPartner(partner.id);
        res.json(requests);
      }
    } catch (error) {
      console.error("Error fetching product requests:", error);
      res.status(500).json({ message: "Failed to fetch product requests" });
    }
  });

  app.put('/api/product-requests/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { status, notes } = z.object({
        status: z.enum(['pending', 'approved', 'rejected']),
        notes: z.string().optional(),
      }).parse(req.body);
      
      const request = await storage.updateProductRequestStatus(req.params.id, status, notes);
      res.json(request);
    } catch (error) {
      console.error("Error updating product request status:", error);
      res.status(400).json({ message: "Failed to update product request status" });
    }
  });

  // Order routes
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const partner = await storage.getPartnerByUserId(userId);
      if (!partner) {
        return res.status(404).json({ message: "Partner profile not found" });
      }
      
      const orderData = insertOrderSchema.parse({
        ...req.body,
        partnerId: partner.id,
      });
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role === 'admin') {
        const orders = await storage.getAllOrders();
        res.json(orders);
      } else {
        // Try to get or create partner profile
        let partner = await storage.getPartnerByUserId(req.user.claims.sub);
        if (!partner) {
          // Create default partner profile for authenticated user
          partner = await storage.createPartner({
            userId: req.user.claims.sub,
            businessName: user?.firstName || 'Yangi Biznes',
            contactInfo: user?.email || 'contact@business.com',
            category: 'general',
            status: 'active'
          });
        }
        const orders = await storage.getOrdersByPartner(partner.id);
        res.json(orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.put('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { status } = z.object({
        status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
      }).parse(req.body);
      
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(400).json({ message: "Failed to update order status" });
    }
  });

  // Chat routes
  app.get('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { with: withUserId } = req.query;
      
      const messages = await storage.getChatMessages(userId, withUserId as string);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        senderId,
      });
      
      const message = await storage.createChatMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending chat message:", error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  app.put('/api/chat/messages/read', isAuthenticated, async (req: any, res) => {
    try {
      const receiverId = req.user.claims.sub;
      const { senderId } = z.object({ senderId: z.string() }).parse(req.body);
      
      await storage.markMessagesAsRead(senderId, receiverId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(400).json({ message: "Failed to mark messages as read" });
    }
  });

  app.get('/api/chat/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error getting unread message count:", error);
      res.status(500).json({ message: "Failed to get unread message count" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/partner-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Try to get or create partner profile
      let partner = await storage.getPartnerByUserId(userId);
      if (!partner) {
        // Create default partner profile for authenticated user
        partner = await storage.createPartner({
          userId: userId,
          businessName: user?.firstName || 'Yangi Biznes',
          contactInfo: user?.email || 'contact@business.com',
          category: 'general',
          status: 'active'
        });
      }
      
      // Return default stats for new partners
      const stats = {
        totalOrders: 0,
        activeProducts: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        commission: 2500000 // Default Tier 1 fixed payment
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching partner stats:", error);
      res.status(500).json({ message: "Failed to fetch partner stats" });
    }
  });

  app.get('/api/analytics/admin-stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Chat routes
  app.get('/api/chat/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chatUsers = await storage.getChatUsers(userId);
      res.json(chatUsers);
    } catch (error) {
      console.error("Error fetching chat users:", error);
      res.status(500).json({ message: "Failed to fetch chat users" });
    }
  });

  app.get('/api/chat/unread-counts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const counts = await storage.getUnreadCounts(userId);
      res.json(counts);
    } catch (error) {
      console.error("Error fetching unread counts:", error);
      res.status(500).json({ message: "Failed to fetch unread counts" });
    }
  });

  // Helper function for password hashing
  const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  };

  // Partner registration requests (from landing page)
  app.post('/api/partner-registration-requests', async (req, res) => {
    try {
      const requestData = insertPartnerRegistrationRequestSchema.parse(req.body);
      // Hash password before storing
      const hashedPassword = await hashPassword(requestData.password);
      const registration = await storage.createPartnerRegistrationRequest({
        ...requestData,
        password: hashedPassword,
      });
      res.status(201).json(registration);
    } catch (error) {
      console.error("Error creating partner registration request:", error);
      res.status(500).json({ message: "Failed to create registration request" });
    }
  });

  app.get('/api/partner-registration-requests', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const requests = await storage.getAllPartnerRegistrationRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching partner registration requests:", error);
      res.status(500).json({ message: "Failed to fetch registration requests" });
    }
  });

  app.patch('/api/partner-registration-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      
      const updated = await storage.updatePartnerRegistrationRequestStatus(id, status, rejectionReason);
      
      // If approved, create user and partner account
      if (status === 'approved' && updated) {
        const newUser = await storage.upsertUser({
          id: updated.login, // Use login as user ID
          email: null,
          firstName: null,
          lastName: null,
          profileImageUrl: null,
          role: 'partner',
          isApproved: true,
        });
        
        await storage.createPartner({
          userId: newUser.id,
          businessName: `${updated.productCategory} Business`,
          description: `Investment: ${updated.investmentAmount} so'm`,
        });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating partner registration request:", error);
      res.status(500).json({ message: "Failed to update registration request" });
    }
  });

  // Partner legal info and activation
  app.post('/api/partner-legal-info', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const partner = await storage.getPartnerByUserId(userId);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      const legalData = insertPartnerLegalInfoSchema.parse(req.body);
      const legalInfo = await storage.createPartnerLegalInfo({
        ...legalData,
        partnerId: partner.id,
      });
      res.status(201).json(legalInfo);
    } catch (error) {
      console.error("Error creating partner legal info:", error);
      res.status(500).json({ message: "Failed to create legal info" });
    }
  });

  app.get('/api/partner-legal-info-requests', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const requests = await storage.getAllPartnerLegalInfoRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching partner legal info requests:", error);
      res.status(500).json({ message: "Failed to fetch legal info requests" });
    }
  });

  app.patch('/api/partner-legal-info/:id/activation', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      
      const updated = await storage.updatePartnerActivationStatus(id, status, rejectionReason);
      res.json(updated);
    } catch (error) {
      console.error("Error updating partner activation status:", error);
      res.status(500).json({ message: "Failed to update activation status" });
    }
  });

  app.get('/api/chat/messages/:userId?', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const otherUserId = req.params.userId;
      const messages = await storage.getChatMessages(currentUserId, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat/send', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const { receiverId, message } = req.body;
      
      if (!receiverId || !message) {
        return res.status(400).json({ message: "Receiver ID and message are required" });
      }

      const newMessage = await storage.createChatMessage({
        senderId,
        receiverId,
        message,
      });

      res.json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.put('/api/chat/mark-read/:senderId', isAuthenticated, async (req: any, res) => {
    try {
      const receiverId = req.user.claims.sub;
      const senderId = req.params.senderId;
      
      await storage.markMessagesAsRead(senderId, receiverId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Get partner warehouse details
  app.get('/api/partners/:partnerId/warehouse', isAuthenticated, async (req, res) => {
    try {
      const { partnerId } = req.params;
      const products = await storage.getProductsByPartnerId(partnerId);
      
      const warehouseData = products.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        costPrice: product.costPrice || 0,
        deliveredQuantity: product.deliveredQuantity || 0,
        soldQuantity: product.soldQuantity || 0,
        currentStock: (product.deliveredQuantity || 0) - (product.soldQuantity || 0),
        stockValue: ((product.deliveredQuantity || 0) - (product.soldQuantity || 0)) * Number(product.costPrice || 0),
        revenue: (product.soldQuantity || 0) * Number(product.price),
        profit: ((product.soldQuantity || 0) * Number(product.price)) - ((product.soldQuantity || 0) * Number(product.costPrice || 0)),
        status: ((product.deliveredQuantity || 0) - (product.soldQuantity || 0)) <= 5 ? 'critical' : 
                ((product.deliveredQuantity || 0) - (product.soldQuantity || 0)) <= 10 ? 'low' : 'good',
        imageUrl: product.imageUrl,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));

      const totals = warehouseData.reduce((acc, item) => ({
        totalProducts: acc.totalProducts + 1,
        totalStock: acc.totalStock + item.currentStock,
        totalValue: acc.totalValue + item.stockValue,
        totalRevenue: acc.totalRevenue + item.revenue,
        totalProfit: acc.totalProfit + item.profit,
      }), {
        totalProducts: 0,
        totalStock: 0,
        totalValue: 0,
        totalRevenue: 0,
        totalProfit: 0,
      });

      res.json({
        products: warehouseData,
        summary: totals,
      });
    } catch (error) {
      console.error("Error fetching partner warehouse:", error);
      res.status(500).json({ message: "Failed to fetch partner warehouse data" });
    }
  });

  // Enhanced analytics with charts data
  app.get('/api/analytics/dashboard-charts', isAuthenticated, async (req, res) => {
    try {
      const now = new Date();
      const monthlyData = [];
      
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('uz-UZ', { month: 'short' });
        
        monthlyData.push({
          month: monthName,
          sales: Math.floor(Math.random() * 50000000) + 20000000,
          profit: Math.floor(Math.random() * 15000000) + 5000000,
          partners: Math.floor(Math.random() * 20) + 10,
          orders: Math.floor(Math.random() * 100) + 50,
        });
      }

      const categoryData = [
        { name: 'Elektronika', value: 35, sales: 45000000 },
        { name: 'Kiyim', value: 25, sales: 32000000 },
        { name: 'Uy-joy', value: 20, sales: 25000000 },
        { name: 'Sport', value: 12, sales: 15000000 },
        { name: 'Boshqa', value: 8, sales: 10000000 },
      ];

      const topPartners = [
        { name: 'Aloqa-Servis', sales: 12000000, profit: 3600000 },
        { name: 'Digital World', sales: 8500000, profit: 2550000 },
        { name: 'Fashion Store', sales: 6200000, profit: 1860000 },
        { name: 'Home Comfort', sales: 4800000, profit: 1440000 },
        { name: 'Sport Plus', sales: 3700000, profit: 1110000 },
      ];

      // Calculate proper profit breakdown
      const totalSales = monthlyData.reduce((acc, month) => acc + month.sales, 0);
      const totalOrders = monthlyData.reduce((acc, month) => acc + month.orders, 0);
      
      // Partner profit calculation (sotuv narxi - marketplace komissiyasi - marketplace harajatlari - 3% soliq - sebestoimost)
      const partnerProfit = totalSales * 0.6; // Simplified: 60% goes to partners after all deductions
      
      // Fulfillment profit (percentage from partner's net profit + fixed fees)
      const fulfillmentProfit = partnerProfit * 0.15 + (totalOrders * 5000); // 15% + 5000 so'm per order
      
      res.json({
        monthlyData,
        categoryData,
        topPartners,
        summary: {
          totalSales: totalSales,
          partnerProfit: partnerProfit,
          fulfillmentProfit: fulfillmentProfit,
          totalPartners: monthlyData[monthlyData.length - 1].partners,
          totalOrders: totalOrders,
          avgOrderValue: totalSales / totalOrders,
          growthRate: 12.5,
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard charts:", error);
      res.status(500).json({ message: "Failed to fetch dashboard charts" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const connectedUsers = new Map<string, any>();

  wss.on('connection', (ws: any, req) => {
    let userId: string | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          userId = message.userId;
          connectedUsers.set(userId, ws);
          ws.send(JSON.stringify({ type: 'auth_success', userId }));
        }
        
        if (message.type === 'chat_message' && userId) {
          const chatMessage = await storage.createChatMessage({
            senderId: userId,
            receiverId: message.receiverId,
            message: message.content,
          });
          
          // Send to receiver if online
          const receiverWs = connectedUsers.get(message.receiverId);
          if (receiverWs && receiverWs.readyState === 1) {
            receiverWs.send(JSON.stringify({
              type: 'new_message',
              message: chatMessage,
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        connectedUsers.delete(userId);
      }
    });
  });

  // Partner charts data endpoint
  app.get("/api/analytics/partner-charts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get partner
      const partner = await storage.getPartnerByUserId(userId);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }

      const partnerSales = (partner.totalSales || 0) as number;
      
      // Mock monthly data for partner
      const monthlyData = [
        { month: "Yanvar", partnerSales: partnerSales * 0.15, commission: partnerSales * 0.12 },
        { month: "Fevral", partnerSales: partnerSales * 0.18, commission: partnerSales * 0.14 },
        { month: "Mart", partnerSales: partnerSales * 0.20, commission: partnerSales * 0.16 },
        { month: "Aprel", partnerSales: partnerSales * 0.22, commission: partnerSales * 0.18 },
        { month: "May", partnerSales: partnerSales * 0.25, commission: partnerSales * 0.20 },
      ];

      // Mock top products for this partner
      const allProducts = await storage.getAllProducts();
      const topProducts = allProducts.slice(0, 5).map((product: any, index: number) => ({
        name: product.name,
        sku: product.sku,
        sold: 150 - (index * 20),
        revenue: (150 - (index * 20)) * Number(product.price)
      }));

      res.json({
        monthlyData,
        topProducts
      });
    } catch (error) {
      console.error("Error fetching partner charts:", error);
      res.status(500).json({ message: "Failed to fetch partner charts" });
    }
  });

  // Get partner warehouse/inventory data
  app.get("/api/partners/:id/warehouse", isAuthenticated, async (req, res) => {
    try {
      const partnerId = req.params.id;
      
      // MySklad warehouse data simulation
      const warehouseData = {
        summary: {
          totalProducts: 15,
          totalStock: 2850,
          totalValue: 25600000, // sebestoimost
          totalProfit: 8600000  // expected profit
        },
        products: [
          {
            id: '1',
            name: 'Smart Phone XL',
            imageUrl: null,
            currentStock: 120,
            costPrice: 1500000,
            stockValue: 180000000
          },
          {
            id: '2', 
            name: 'Wireless Headphones',
            imageUrl: null,
            currentStock: 85,
            costPrice: 350000,
            stockValue: 29750000
          },
          {
            id: '3',
            name: 'Tablet Pro 10"',
            imageUrl: null,
            currentStock: 45,
            costPrice: 2200000,
            stockValue: 99000000
          },
          {
            id: '4',
            name: 'Gaming Mouse',
            imageUrl: null,
            currentStock: 200,
            costPrice: 85000,
            stockValue: 17000000
          },
          {
            id: '5',
            name: 'USB Cable Type-C',
            imageUrl: null,
            currentStock: 450,
            costPrice: 25000,
            stockValue: 11250000
          }
        ]
      };

      res.json(warehouseData);
    } catch (error) {
      console.error("Error fetching warehouse data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get current partner data
  app.get("/api/partners/me", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const partner = await storage.getPartnerByUserId(userId);
      
      if (!partner) {
        return res.status(404).json({ error: "Partner profile not found" });
      }
      
      res.json(partner);
    } catch (error) {
      console.error("Error fetching current partner:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
