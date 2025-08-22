import { db } from "./db";
import { users, partners, marketplaceIntegrations } from "@shared/schema";
import bcrypt from "bcryptjs";

export async function seedDemoData() {
  try {
    console.log("🔄 Starting data setup...");

    // Optional: seed admin from environment variables (safe for prod)
    if (process.env.AUTO_SEED_ADMIN === 'true') {
      const adminUsername = process.env.ADMIN_USERNAME ?? 'admin';
      const adminEmail = process.env.ADMIN_EMAIL ?? '';
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminPassword) {
        console.warn("⚠️ AUTO_SEED_ADMIN is true but ADMIN_PASSWORD is not set. Skipping admin seed.");
      } else {
        const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

        const [adminUser] = await db
          .insert(users)
          .values({
            username: adminUsername,
            email: adminEmail,
            passwordHash: adminPasswordHash,
            firstName: "Admin",
            lastName: "User",
            role: "admin",
            isApproved: true,
            authType: "credentials",
          })
          .onConflictDoNothing()
          .returning();

        if (adminUser) {
          console.log("✅ Admin account ensured:", adminUsername);

          await db
            .insert(partners)
            .values({
              userId: adminUser.id,
              businessName: "MarketPro Administration",
              description: "System administration account",
              pricingTier: "enterprise",
              fixedPayment: "0.00",
              commissionRate: "0.00",
              hasAnalytics: true,
              hasPrioritySupport: true,
              hasCustomIntegrations: true,
              hasAdvancedReports: true,
              maxProductRequests: -1,
            })
            .onConflictDoNothing();

          console.log("✅ Admin partner profile ensured");
        }
      }
    }

    console.log("🎉 Data setup completed.");
  } catch (error) {
    console.error("❌ Error setting up data:", error);
    throw error;
  }
}