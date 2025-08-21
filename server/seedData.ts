import { db } from "./db";
import { users, partners } from "@shared/schema";
import bcrypt from 'bcryptjs';

export async function seedDemoData() {
  try {
    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const partnerPasswordHash = await bcrypt.hash('partner123', 10);
    
    // Create demo admin user
    const [adminUser] = await db
      .insert(users)
      .values({
        id: "demo_admin",
        email: "admin@marketplace.uz",
        firstName: "Admin",
        lastName: "User",
        username: "admin",
        passwordHash: adminPasswordHash,
        role: "admin",
        isApproved: true,
        authType: "credentials",
      })
      .onConflictDoNothing()
      .returning();

    // Create demo partner user
    const [partnerUser] = await db
      .insert(users)
      .values({
        id: "demo_partner",
        email: "partner@company.uz",
        firstName: "Demo",
        lastName: "Hamkor",
        username: "testpartner",
        passwordHash: partnerPasswordHash,
        role: "partner",
        isApproved: true,
        authType: "credentials",
      })
      .onConflictDoNothing()
      .returning();

    // Create partner profile
    if (partnerUser) {
      await db
        .insert(partners)
        .values({
          userId: partnerUser.id,
          businessName: "Demo Biznes",
          description: "Test hamkor kompaniyasi",
          pricingTier: "professional",
          fixedPayment: "4500000.00",
          commissionRate: "15.00",
        })
        .onConflictDoNothing();
    }

    console.log("Demo data seeded successfully");
  } catch (error) {
    console.error("Error seeding demo data:", error);
  }
}