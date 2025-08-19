import {
  users,
  customers,
  resellers,
  softwareCatalog,
  subscriptions,
  emailReminders,
  type User,
  type UpsertUser,
  type Customer,
  type InsertCustomer,
  type Reseller,
  type InsertReseller,
  type Software,
  type InsertSoftware,
  type Subscription,
  type InsertSubscription,
  type SubscriptionWithDetails,
  type EmailReminder,
  type InsertEmailReminder,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, gte, lte, count, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  // Reseller operations
  getResellers(): Promise<Reseller[]>;
  getReseller(id: string): Promise<Reseller | undefined>;
  createReseller(reseller: InsertReseller): Promise<Reseller>;
  updateReseller(id: string, reseller: Partial<InsertReseller>): Promise<Reseller>;
  deleteReseller(id: string): Promise<void>;

  // Software operations
  getSoftware(): Promise<Software[]>;
  getSoftwareItem(id: string): Promise<Software | undefined>;
  createSoftware(software: InsertSoftware): Promise<Software>;
  updateSoftware(id: string, software: Partial<InsertSoftware>): Promise<Software>;

  // Subscription operations
  getSubscriptions(): Promise<SubscriptionWithDetails[]>;
  getSubscription(id: string): Promise<SubscriptionWithDetails | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription>;
  deleteSubscription(id: string): Promise<void>;
  getSubscriptionsByStatus(status: string): Promise<SubscriptionWithDetails[]>;
  getExpiringSubscriptions(days: number): Promise<SubscriptionWithDetails[]>;

  // Analytics operations
  getDashboardMetrics(): Promise<{
    activeSubscriptions: number;
    expiringSoon: number;
    monthlyRevenue: number;
    monthlyProfit: number;
  }>;

  // Email reminder operations
  createEmailReminder(reminder: InsertEmailReminder): Promise<EmailReminder>;
  getEmailReminders(subscriptionId: string): Promise<EmailReminder[]>;
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
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Reseller operations
  async getResellers(): Promise<Reseller[]> {
    return await db.select().from(resellers).orderBy(desc(resellers.createdAt));
  }

  async getReseller(id: string): Promise<Reseller | undefined> {
    const [reseller] = await db.select().from(resellers).where(eq(resellers.id, id));
    return reseller;
  }

  async createReseller(reseller: InsertReseller): Promise<Reseller> {
    const [newReseller] = await db.insert(resellers).values(reseller).returning();
    return newReseller;
  }

  async updateReseller(id: string, reseller: Partial<InsertReseller>): Promise<Reseller> {
    const [updatedReseller] = await db
      .update(resellers)
      .set({ ...reseller, updatedAt: new Date() })
      .where(eq(resellers.id, id))
      .returning();
    return updatedReseller;
  }

  async deleteReseller(id: string): Promise<void> {
    await db.delete(resellers).where(eq(resellers.id, id));
  }

  // Software operations
  async getSoftware(): Promise<Software[]> {
    return await db.select().from(softwareCatalog).where(eq(softwareCatalog.isActive, true));
  }

  async getSoftwareItem(id: string): Promise<Software | undefined> {
    const [software] = await db.select().from(softwareCatalog).where(eq(softwareCatalog.id, id));
    return software;
  }

  async createSoftware(software: InsertSoftware): Promise<Software> {
    const [newSoftware] = await db.insert(softwareCatalog).values(software).returning();
    return newSoftware;
  }

  async updateSoftware(id: string, software: Partial<InsertSoftware>): Promise<Software> {
    const [updatedSoftware] = await db
      .update(softwareCatalog)
      .set(software)
      .where(eq(softwareCatalog.id, id))
      .returning();
    return updatedSoftware;
  }

  // Subscription operations
  async getSubscriptions(): Promise<SubscriptionWithDetails[]> {
    return await db
      .select()
      .from(subscriptions)
      .leftJoin(customers, eq(subscriptions.customerId, customers.id))
      .leftJoin(resellers, eq(subscriptions.resellerId, resellers.id))
      .leftJoin(softwareCatalog, eq(subscriptions.softwareId, softwareCatalog.id))
      .orderBy(desc(subscriptions.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.subscriptions,
          customer: row.customers!,
          reseller: row.resellers || undefined,
          software: row.software_catalog!,
        }))
      );
  }

  async getSubscription(id: string): Promise<SubscriptionWithDetails | undefined> {
    const rows = await db
      .select()
      .from(subscriptions)
      .leftJoin(customers, eq(subscriptions.customerId, customers.id))
      .leftJoin(resellers, eq(subscriptions.resellerId, resellers.id))
      .leftJoin(softwareCatalog, eq(subscriptions.softwareId, softwareCatalog.id))
      .where(eq(subscriptions.id, id));

    if (rows.length === 0) return undefined;

    const row = rows[0];
    return {
      ...row.subscriptions,
      customer: row.customers!,
      reseller: row.resellers || undefined,
      software: row.software_catalog!,
    };
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({ ...subscription, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  async deleteSubscription(id: string): Promise<void> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
  }

  async getSubscriptionsByStatus(status: string): Promise<SubscriptionWithDetails[]> {
    return await db
      .select()
      .from(subscriptions)
      .leftJoin(customers, eq(subscriptions.customerId, customers.id))
      .leftJoin(resellers, eq(subscriptions.resellerId, resellers.id))
      .leftJoin(softwareCatalog, eq(subscriptions.softwareId, softwareCatalog.id))
      .where(eq(subscriptions.status, status))
      .orderBy(desc(subscriptions.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.subscriptions,
          customer: row.customers!,
          reseller: row.resellers || undefined,
          software: row.software_catalog!,
        }))
      );
  }

  async getExpiringSubscriptions(days: number): Promise<SubscriptionWithDetails[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await db
      .select()
      .from(subscriptions)
      .leftJoin(customers, eq(subscriptions.customerId, customers.id))
      .leftJoin(resellers, eq(subscriptions.resellerId, resellers.id))
      .leftJoin(softwareCatalog, eq(subscriptions.softwareId, softwareCatalog.id))
      .where(
        and(
          eq(subscriptions.status, 'active'),
          lte(subscriptions.expiryDate, futureDate)
        )
      )
      .orderBy(asc(subscriptions.expiryDate))
      .then(rows => 
        rows.map(row => ({
          ...row.subscriptions,
          customer: row.customers!,
          reseller: row.resellers || undefined,
          software: row.software_catalog!,
        }))
      );
  }

  async getDashboardMetrics(): Promise<{
    activeSubscriptions: number;
    expiringSoon: number;
    monthlyRevenue: number;
    monthlyProfit: number;
  }> {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // Active subscriptions count
    const [activeCount] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));

    // Expiring soon count (next 30 days)
    const [expiringCount] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, 'active'),
          lte(subscriptions.expiryDate, thirtyDaysFromNow),
          gte(subscriptions.expiryDate, now)
        )
      );

    // Monthly revenue and profit
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const [monthlyStats] = await db
      .select({
        revenue: sum(subscriptions.salesPrice),
        profit: sum(
          db.$with('profit_calc')
            .as(
              db.select({
                profit: sql`${subscriptions.salesPrice} - ${subscriptions.purchasePrice} - ${subscriptions.commissionAmount}`
              }).from(subscriptions)
            )
        )
      })
      .from(subscriptions)
      .where(
        and(
          gte(subscriptions.createdAt, firstDayOfMonth),
          lte(subscriptions.createdAt, lastDayOfMonth)
        )
      );

    return {
      activeSubscriptions: activeCount.count || 0,
      expiringSoon: expiringCount.count || 0,
      monthlyRevenue: Number(monthlyStats.revenue) || 0,
      monthlyProfit: Number(monthlyStats.profit) || 0,
    };
  }

  // Email reminder operations
  async createEmailReminder(reminder: InsertEmailReminder): Promise<EmailReminder> {
    const [newReminder] = await db.insert(emailReminders).values(reminder).returning();
    return newReminder;
  }

  async getEmailReminders(subscriptionId: string): Promise<EmailReminder[]> {
    return await db
      .select()
      .from(emailReminders)
      .where(eq(emailReminders.subscriptionId, subscriptionId))
      .orderBy(desc(emailReminders.sentAt));
  }
}

export const storage = new DatabaseStorage();
