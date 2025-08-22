import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import bcrypt from 'bcryptjs';
import { sendEmail, sendSMS } from './services/notifications';

// NO REPLIT AUTH OR OPENID-CLIENT - PURE SESSION-BASED AUTH ONLY

// Extend session interface
declare module "express-session" {
  interface SessionData {
    userId?: string;
    userRole?: string;
    authType?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket connection established');
    
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth' && message.userId) {
          clients.set(message.userId, ws);
          console.log(`User ${message.userId} connected via WebSocket`);
          
          // Notify other users
          clients.forEach((client, userId) => {
            if (client.readyState === WebSocket.OPEN && userId !== message.userId) {
              client.send(JSON.stringify({
                type: 'user_online',
                userId: message.userId
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      // Find and remove disconnected client
      clients.forEach((client, userId) => {
        if (client === ws) {
          clients.delete(userId);
          console.log(`User ${userId} disconnected from WebSocket`);
          
          // Notify other users
          clients.forEach((otherClient) => {
            if (otherClient.readyState === WebSocket.OPEN) {
              otherClient.send(JSON.stringify({
                type: 'user_offline',
                userId: userId
              }));
            }
          });
        }
      });
    });
  });

  // Custom session-based authentication middleware (NO REPLIT)
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session.userId || req.session.userRole !== 'admin') {
      return res.status(401).json({ message: "Admin access required" });
    }
    next();
  };

  // Authentication endpoints - CUSTOM ONLY (NO REPLIT AUTH)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      console.log(`🔐 Login attempt: ${username}`);
      
      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username va parol majburiy" });
      }
      
      // Check if admin
      const admin = await storage.getAdminByUsername(username);
      if (admin && admin.passwordHash) {
        const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
        console.log(`🔑 Admin ${username} password check:`, isValidPassword);
        
        if (isValidPassword) {
          req.session.userId = admin.id;
          req.session.userRole = 'admin';
          req.session.authType = "credentials";
          req.session.username = admin.username;
          req.session.firstName = admin.firstName || undefined;
          req.session.lastName = admin.lastName || undefined;
          
          console.log(`✅ Admin ${username} logged in successfully`);
          
          return res.json({
            success: true,
            user: {
              id: admin.id,
              username: admin.username,
              firstName: admin.firstName,
              lastName: admin.lastName,
              role: 'admin'
            }
          });
        }
      }
      
      // Check partner users (approved partners can login)
      const partnerUser = await storage.getUserByUsername(username);
      if (partnerUser && partnerUser.role === 'partner' && partnerUser.isApproved && partnerUser.passwordHash) {
        const isValidPassword = await bcrypt.compare(password, partnerUser.passwordHash);
        console.log(`🔑 Partner ${username} password check:`, isValidPassword);
        
        if (isValidPassword) {
          req.session.userId = partnerUser.id;
          req.session.userRole = 'partner';
          req.session.authType = "credentials";
          req.session.username = partnerUser.username;
          req.session.firstName = partnerUser.firstName || undefined;
          req.session.lastName = partnerUser.lastName || undefined;
          
          console.log(`✅ Partner ${username} logged in successfully`);
          
          return res.json({
            success: true,
            user: {
              id: partnerUser.id,
              username: partnerUser.username,
              firstName: partnerUser.firstName,
              lastName: partnerUser.lastName,
              role: 'partner'
            }
          });
        }
      }
      
      // Check partner registration requests (approved partners can login)
      const partnerRequest = await storage.getPartnerRegistrationByUsername(username);
      if (partnerRequest && partnerRequest.status === 'approved' && partnerRequest.password) {
        const isValidPassword = await bcrypt.compare(password, partnerRequest.password);
        console.log(`🔑 Partner Request ${username} password check:`, isValidPassword);
        
        if (isValidPassword) {
          req.session.userId = partnerRequest.id;
          req.session.userRole = 'partner';
          req.session.authType = "credentials";
          req.session.username = partnerRequest.login;
          req.session.firstName = partnerRequest.login;
          
          console.log(`✅ Partner Request ${username} logged in successfully`);
          
          return res.json({
            success: true,
            user: {
              id: partnerRequest.id,
              username: partnerRequest.login,
              firstName: partnerRequest.login,
              role: 'partner'
            }
          });
        }
      }
      
      console.log(`❌ Login failed for: ${username}`);
      return res.status(401).json({ success: false, message: "Login yoki parol noto'g'ri" });
      
    } catch (error) {
      console.error("❌ Login error:", error);
      res.status(500).json({ success: false, message: "Login xatosi" });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    try {
      // Clear session
      req.session.destroy((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        
        // Clear cookies
        res.clearCookie('sessionId');
        res.clearCookie('connect.sid');
        
        console.log('✅ User logged out successfully');
        res.json({ success: true, message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.get('/api/auth/session', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (req.session.userRole === 'admin') {
        const admin = await storage.getUser(req.session.userId);
        if (admin) {
          return res.json({
            success: true,
            user: {
              id: admin.id,
              username: admin.username,
              firstName: admin.firstName,
              lastName: admin.lastName,
              role: admin.role
            }
          });
        }
      } else if (req.session.userRole === 'partner') {
        const partner = await storage.getPartnerRegistrationById(req.session.userId);
        if (partner) {
          return res.json({
            success: true,
            user: {
              id: partner.id,
              username: partner.login,
              firstName: partner.login,
              role: 'partner'
            }
          });
        }
      }
      
      return res.status(401).json({ message: "Session invalid" });
    } catch (error) {
      console.error("Session error:", error);
      res.status(500).json({ message: "Session error" });
    }
  });

  // Get authenticated user
  app.get('/api/auth/user', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = {
        id: req.session.userId,
        username: req.session.username || 'Unknown',
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        role: req.session.userRole
      };
      
      console.log('📊 Returning session user:', user);
      res.json(user);
    } catch (error) {
      console.error('User fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get current partner profile (by session user)
  app.get('/api/me/partner', requireAuth, async (req: any, res) => {
    try {
      const partner = await storage.getPartnerByUserId(req.session.userId!);
      if (!partner) return res.status(404).json({ success: false, message: 'Hamkor topilmadi' });
      res.json({ success: true, partner });
    } catch (error) {
      console.error('Error fetching current partner:', error);
      res.status(500).json({ success: false });
    }
  });

  // Create default admin if doesn't exist
  app.post('/api/auth/admin/create-default', async (req, res) => {
    try {
      const existingAdmin = await storage.getAdminByUsername('admin');
      if (existingAdmin) {
        return res.json({ message: "Admin already exists" });
      }

      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await storage.createAdmin({
        username: 'admin',
        passwordHash: hashedPassword,
        email: 'admin@marketplace.uz',
        firstName: 'Admin',
        lastName: 'User'
      });

      res.json({ message: "Default admin created", adminId: admin.id });
    } catch (error) {
      console.error("Error creating default admin:", error);
      res.status(500).json({ message: "Failed to create admin" });
    }
  });

  // Create new admin endpoint
  app.post('/api/auth/admin/create', async (req, res) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username va parol majburiy" });
      }
      
      // Check if admin already exists
      const existingAdmin = await storage.getAdminByUsername(username);
      if (existingAdmin) {
        return res.json({ message: "Bu username bilan admin mavjud" });
      }
      
      // Create new admin
      const passwordHash = await bcrypt.hash(password, 10);
      const admin = await storage.createAdmin({
        username,
        passwordHash,
        email: email || `${username}@marketplace.uz`,
        firstName: firstName || 'Admin',
        lastName: lastName || 'User'
      });
      
      res.json({ 
        success: true,
        message: "Yangi admin yaratildi", 
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName
        }
      });
    } catch (error) {
      console.error('Create admin error:', error);
      res.status(500).json({ message: "Admin yaratishda xatolik" });
    }
  });

  // Partner registration requests
  app.post('/api/partner-registration-requests', async (req, res) => {
    try {
      const { login, password, phone, address, productCategory, investmentAmount, productQuantity } = req.body;
      
      // Validation
      if (!login || !password || !phone || !address || !productCategory || !investmentAmount || !productQuantity) {
        return res.status(400).json({ 
          success: false, 
          message: "Barcha maydonlar to'ldirilishi shart" 
        });
      }
      
      // Check if username already exists
      const existingUser = await storage.getPartnerRegistrationByUsername(login);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Bu login allaqachon mavjud" 
        });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const registration = await storage.createPartnerRegistrationRequest({
        login,
        password: hashedPassword,
        phone,
        address,
        productCategory,
        investmentAmount: parseFloat(investmentAmount).toFixed(2),
        productQuantity: parseInt(productQuantity),
        status: 'pending'
      });
      
      console.log('✅ Partner registration created:', registration.id);
      res.status(201).json({ 
        success: true, 
        message: "Ariza muvaffaqiyatli yuborildi",
        registration 
      });
    } catch (error) {
      console.error("❌ Error creating partner registration request:", error);
      res.status(500).json({ 
        success: false, 
        message: "Ariza yuborishda xatolik yuz berdi" 
      });
    }
  });

  app.get('/api/partner-registration-requests', requireAdmin, async (req: any, res) => {
    try {
      const requests = await storage.getAllPartnerRegistrationRequests();
      res.json({ 
        success: true, 
        requests 
      });
    } catch (error) {
      console.error("❌ Error fetching partner registration requests:", error);
      res.status(500).json({ 
        success: false, 
        message: "Arizalarni olishda xatolik" 
      });
    }
  });

  // Approve partner registration
  app.post('/api/partner-registration-requests/:id/approve', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.approvePartnerRegistration(id);
      
      // Create partner user after approval
      const registration = await storage.getPartnerRegistrationById(id);
      if (registration) {
        const partner = await storage.createPartner({
          userId: registration.id,
          businessName: registration.login,
          description: `Partner: ${registration.login}`,
          pricingTier: 'basic',
          fixedPayment: "0.00",
          commissionRate: "45.00", // Basic tier default rate
        });
        
        console.log('✅ Partner approved and created:', partner.id);
      }
      
      res.json({ 
        success: true, 
        message: "Hamkor tasdiqlandi" 
      });
    } catch (error) {
      console.error("❌ Error approving partner:", error);
      res.status(500).json({ 
        success: false, 
        message: "Tasdiqlashda xatolik" 
      });
    }
  });

  // Reject partner registration
  app.post('/api/partner-registration-requests/:id/reject', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ 
          success: false, 
          message: "Rad etish sababi ko'rsatilishi shart" 
        });
      }
      
      await storage.rejectPartnerRegistration(id, reason);
      
      console.log('❌ Partner rejected:', id);
      res.json({ 
        success: true, 
        message: "Hamkor rad etildi" 
      });
    } catch (error) {
      console.error("❌ Error rejecting partner:", error);
      res.status(500).json({ 
        success: false, 
        message: "Rad etishda xatolik" 
      });
    }
  });

  // Partners - for managing partners
  app.post('/api/partners', requireAdmin, async (req, res) => {
    try {
      const partner = await storage.createPartner(req.body);
      res.status(201).json(partner);
    } catch (error) {
      console.error("Error creating partner:", error);
      res.status(500).json({ message: "Failed to create partner" });
    }
  });

  app.get('/api/partners', requireAdmin, async (req, res) => {
    try {
      const partners = await storage.getAllPartners();
      res.json(partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      res.status(500).json({ message: "Failed to fetch partners" });
    }
  });

  // Get single partner (admin)
  app.get('/api/admin/partners/:partnerId', requireAdmin, async (req, res) => {
    try {
      const partner = await storage.getPartnerById(req.params.partnerId);
      if (!partner) return res.status(404).json({ message: 'Partner not found' });
      res.json(partner);
    } catch (error) {
      console.error('Error fetching partner by id:', error);
      res.status(500).json({ message: 'Failed to fetch partner' });
    }
  });

  // Products
  app.post('/api/products', requireAdmin, async (req, res) => {
    try {
      const { name, description, sku, price, costPrice, stockQuantity, partnerId, imageUrl } = req.body;
      
      if (!name || !sku || !price || !partnerId) {
        return res.status(400).json({ 
          success: false, 
          message: "Mahsulot nomi, SKU, narxi va hamkor ID majburiy" 
        });
      }
      
      const product = await storage.createProduct({
        name,
        description,
        sku,
        price: parseFloat(price).toFixed(2),
        costPrice: costPrice ? parseFloat(costPrice).toFixed(2) : null,
        stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
        partnerId,
        imageUrl,
        isActive: true
      });
      
      console.log('✅ Product created:', product.id);
      res.status(201).json({ 
        success: true, 
        message: "Mahsulot yaratildi",
        product 
      });
    } catch (error) {
      console.error("❌ Error creating product:", error);
      res.status(500).json({ 
        success: false, 
        message: "Mahsulot yaratishda xatolik" 
      });
    }
  });

  // Marketplace integrations (admin)
  app.post('/api/admin/partners/:partnerId/marketplace-integrations', requireAdmin, async (req, res) => {
    try {
      const { partnerId } = req.params;
      const { marketplace, storeName, apiKey, storeUrl, additionalConfig } = req.body || {};
      if (!marketplace || !storeName) {
        return res.status(400).json({ success: false, message: "Marketplace va do'kon nomi majburiy" });
      }
      const integration = await storage.createMarketplaceIntegration({
        partnerId,
        marketplace,
        storeName,
        apiKey,
        storeId: undefined as any,
        storeUrl: storeUrl as any,
        isActive: true,
        autoSync: false,
        syncFrequency: 24,
      } as any);
      res.status(201).json({ success: true, integration });
    } catch (error) {
      console.error('❌ Error creating marketplace integration:', error);
      res.status(500).json({ success: false, message: 'Integratsiya yaratilmedi' });
    }
  });

  app.get('/api/admin/partners/:partnerId/marketplace-integrations', requireAdmin, async (req, res) => {
    try {
      const list = await storage.getMarketplaceIntegrationsByPartner(req.params.partnerId);
      res.json(list);
    } catch (error) {
      console.error('❌ Error fetching marketplace integrations:', error);
      res.status(500).json({ success: false, message: 'Integratsiyalarni olishda xatolik' });
    }
  });

  app.delete('/api/admin/marketplace-integrations/:id', requireAdmin, async (req, res) => {
    try {
      await storage.deleteMarketplaceIntegration(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Error deleting marketplace integration:', error);
      res.status(500).json({ success: false, message: 'Integratsiyani o\'chirishda xatolik' });
    }
  });

  app.post('/api/admin/marketplace-integrations/:id/test-connection', requireAdmin, async (req, res) => {
    try {
      // Placeholder: simulate success response
      await storage.updateMarketplaceIntegrationSync(req.params.id, 'success');
      res.json({ success: true, marketplace: 'Test', status: 'success' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Test xatosi' });
    }
  });

  // Update partner tier
  app.post('/api/admin/partners/:partnerId/tier', requireAdmin, async (req, res) => {
    try {
      const { partnerId } = req.params;
      const { tier } = req.body || {};
      if (!tier) return res.status(400).json({ success: false, message: 'Tier majburiy' });
      await storage.updatePartnerTier(partnerId, tier);
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Error updating partner tier:', error);
      res.status(500).json({ success: false, message: 'Xatolik' });
    }
  });

  app.get('/api/products', requireAuth, async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json({ 
        success: true, 
        products 
      });
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      res.status(500).json({ 
        success: false, 
        message: "Mahsulotlarni olishda xatolik" 
      });
    }
  });

  // Get products by partner
  app.get('/api/products/partner/:partnerId', requireAuth, async (req, res) => {
    try {
      const { partnerId } = req.params;
      const products = await storage.getProductsByPartner(partnerId);
      res.json({ 
        success: true, 
        products 
      });
    } catch (error) {
      console.error("❌ Error fetching partner products:", error);
      res.status(500).json({ 
        success: false, 
        message: "Hamkor mahsulotlarini olishda xatolik" 
      });
    }
  });

  // Low stock inventory (admin)
  app.get('/api/admin/inventory/low-stock', requireAdmin, async (_req, res) => {
    try {
      const list = await storage.getLowStockProducts();
      res.json({ success: true, list });
    } catch (error) {
      console.error('❌ Error fetching low stock:', error);
      res.status(500).json({ success: false, message: 'Xatolik' });
    }
  });

  // Orders
  app.post('/api/orders', requireAuth, async (req, res) => {
    try {
      const order = await storage.createOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/orders', requireAuth, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Orders by partner
  app.get('/api/orders/partner/:partnerId', requireAuth, async (req, res) => {
    try {
      const list = await storage.getOrdersByPartner(req.params.partnerId);
      res.json({ success: true, list });
    } catch (error) {
      console.error('Error fetching partner orders:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
  });

  // Chat routes
  app.post('/api/chat/send', requireAuth, async (req: any, res) => {
    try {
      const { receiverId, message } = req.body;
      
      if (!receiverId || !message) {
        return res.status(400).json({ message: "receiverId va message majburiy" });
      }
      
      const newMessage = {
        id: Date.now().toString(),
        senderId: req.session.userId,
        receiverId: receiverId,
        message: message,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      // Send real-time notification via WebSocket
      const targetClient = clients.get(receiverId);
      if (targetClient && targetClient.readyState === WebSocket.OPEN) {
        targetClient.send(JSON.stringify({
          type: 'new_message',
          message: newMessage
        }));
      }
      
      console.log('Yangi xabar yaratildi va yuborildi:', newMessage);
      res.json(newMessage);
    } catch (error) {
      console.error("Xabar yuborishda xatolik:", error);
      res.status(500).json({ message: "Xabar yuborilmadi" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/partner-stats', requireAuth, async (req: any, res) => {
    try {
      const stats = {
        totalOrders: 47,
        activeProducts: 12,
        totalRevenue: 21300000,
        monthlyRevenue: 4500000,
        commission: 675000
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching partner stats:", error);
      res.status(500).json({ message: "Failed to fetch partner stats" });
    }
  });

  // Partner activation (legal info)
  app.post('/api/partner-activation-requests', requireAuth, async (req: any, res) => {
    try {
      const partner = await storage.getPartnerByUserId(req.session.userId!);
      if (!partner) {
        return res.status(400).json({ success: false, message: 'Hamkor topilmadi' });
      }
      const payload = req.body || {};
      const info = await storage.createPartnerActivation({
        partnerId: partner.id,
        companyName: payload.companyName,
        legalForm: payload.legalForm,
        taxId: payload.taxId,
        bankAccount: payload.bankAccount,
        bankName: payload.bankName,
        mfo: payload.mfo,
        legalAddress: payload.legalAddress,
        companyDocuments: JSON.stringify(payload.companyDocuments || []),
        chosenTier: payload.chosenTier,
        activationStatus: 'pending',
      });
      res.status(201).json({ success: true, info });
    } catch (error) {
      console.error('❌ Error creating partner activation:', error);
      res.status(500).json({ success: false, message: 'Aktivatsiya so\'rovi yuborilmadi' });
    }
  });

  app.get('/api/admin/partner-activation-requests/:partnerId', requireAdmin, async (req, res) => {
    try {
      const list = await storage.getPartnerActivationsByPartner(req.params.partnerId);
      res.json({ success: true, list });
    } catch (error) {
      console.error('❌ Error fetching activation list:', error);
      res.status(500).json({ success: false, message: 'Ma\'lumotlarni olishda xatolik' });
    }
  });

  app.get('/api/admin/partner-activation-requests', requireAdmin, async (_req, res) => {
    try {
      const list = await storage.getAllPartnerActivations();
      res.json({ success: true, list });
    } catch (error) {
      console.error('❌ Error fetching activation list:', error);
      res.status(500).json({ success: false, message: 'Ma\'lumotlarni olishda xatolik' });
    }
  });

  app.post('/api/admin/partner-activation-requests/:id/approve', requireAdmin, async (req, res) => {
    try {
      await storage.updatePartnerActivationStatus(req.params.id, 'approved');
      res.json({ success: true, message: 'Aktivatsiya tasdiqlandi' });
    } catch (error) {
      console.error('❌ Error approving activation:', error);
      res.status(500).json({ success: false, message: 'Tasdiqlash xatosi' });
    }
  });

  app.post('/api/admin/partner-activation-requests/:id/reject', requireAdmin, async (req, res) => {
    try {
      const { reason } = req.body;
      if (!reason) return res.status(400).json({ success: false, message: 'Sabab majburiy' });
      await storage.updatePartnerActivationStatus(req.params.id, 'rejected', reason);
      res.json({ success: true, message: 'Aktivatsiya rad etildi' });
    } catch (error) {
      console.error('❌ Error rejecting activation:', error);
      res.status(500).json({ success: false, message: 'Rad etish xatosi' });
    }
  });

  // Product fulfillment requests
  app.post('/api/product-fulfillment-requests', requireAuth, async (req: any, res) => {
    try {
      const partner = await storage.getPartnerByUserId(req.session.userId!);
      if (!partner) {
        return res.status(400).json({ success: false, message: 'Hamkor topilmadi' });
      }
      const payload = req.body || {};
      const pr = await storage.createProductRequest({
        partnerId: partner.id,
        productName: payload.productName,
        description: payload.productDescription,
        expectedQuantity: parseInt(payload.expectedQuantity),
        estimatedPrice: payload.estimatedPrice ? parseFloat(payload.estimatedPrice) : null as any,
        supplierInfo: payload.supplierInfo,
        urgencyLevel: payload.urgencyLevel,
        status: 'pending',
      });
      res.status(201).json({ success: true, request: pr });
    } catch (error) {
      console.error('❌ Error creating product fulfillment request:', error);
      res.status(500).json({ success: false, message: 'So\'rov yuborilmadi' });
    }
  });

  app.get('/api/admin/product-fulfillment-requests', requireAdmin, async (_req, res) => {
    try {
      const list = await storage.getAllProductRequests();
      res.json({ success: true, list });
    } catch (error) {
      console.error('❌ Error fetching product requests:', error);
      res.status(500).json({ success: false, message: 'Ma\'lumotlarni olishda xatolik' });
    }
  });

  app.post('/api/admin/product-fulfillment-requests/:id/approve', requireAdmin, async (req: any, res) => {
    try {
      // Approve request
      await storage.updateProductRequestStatus(req.params.id, 'approved', { reviewedBy: req.session.userId, approvedAt: new Date() });
      // Auto-create product if missing
      const pr = await storage.getProductRequestById(req.params.id);
      if (pr) {
        const product = await storage.createProduct({
          name: pr.productName,
          description: pr.description || null as any,
          sku: `SKU-${Date.now()}`,
          price: pr.estimatedPrice || 0 as any,
          costPrice: null as any,
          stockQuantity: pr.expectedQuantity || 0,
          partnerId: pr.partnerId,
          imageUrl: null as any,
          isActive: true,
        } as any);
        await storage.setProductRequestProduct(req.params.id, product.id);
        // Mark as in MySklad (internal warehouse)
        await storage.updateProductRequestStatus(req.params.id, 'in_mysklad');
        // Notify partner (placeholder)
        await sendEmail({ to: `${pr.partnerId}@example.com`, subject: 'Fulfillment so\'rovi tasdiqlandi', text: `Mahsulot: ${pr.productName}` });
      }
      res.json({ success: true, message: 'So\'rov tasdiqlandi va mahsulot omborga qo\'shildi' });
    } catch (error) {
      console.error('❌ Error approving product request:', error);
      res.status(500).json({ success: false, message: 'Tasdiqlash xatosi' });
    }
  });

  app.post('/api/admin/product-fulfillment-requests/:id/reject', requireAdmin, async (req, res) => {
    try {
      const { reason } = req.body;
      if (!reason) return res.status(400).json({ success: false, message: 'Sabab majburiy' });
      await storage.updateProductRequestStatus(req.params.id, 'rejected', { adminNotes: reason });
      res.json({ success: true, message: 'So\'rov rad etildi' });
    } catch (error) {
      console.error('❌ Error rejecting product request:', error);
      res.status(500).json({ success: false, message: 'Rad etish xatosi' });
    }
  });


  return httpServer;
}