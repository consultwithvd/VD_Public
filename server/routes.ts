import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertCustomerSchema,
  insertResellerSchema,
  insertSoftwareSchema,
  insertSubscriptionSchema,
} from "@shared/schema";
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

  // Dashboard routes
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Customer routes
  app.get('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, customerData);
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCustomer(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Reseller routes
  app.get('/api/resellers', isAuthenticated, async (req, res) => {
    try {
      const resellers = await storage.getResellers();
      res.json(resellers);
    } catch (error) {
      console.error("Error fetching resellers:", error);
      res.status(500).json({ message: "Failed to fetch resellers" });
    }
  });

  app.get('/api/resellers/:id', isAuthenticated, async (req, res) => {
    try {
      const reseller = await storage.getReseller(req.params.id);
      if (!reseller) {
        return res.status(404).json({ message: "Reseller not found" });
      }
      res.json(reseller);
    } catch (error) {
      console.error("Error fetching reseller:", error);
      res.status(500).json({ message: "Failed to fetch reseller" });
    }
  });

  app.post('/api/resellers', isAuthenticated, async (req, res) => {
    try {
      const resellerData = insertResellerSchema.parse(req.body);
      const reseller = await storage.createReseller(resellerData);
      res.status(201).json(reseller);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reseller data", errors: error.errors });
      }
      console.error("Error creating reseller:", error);
      res.status(500).json({ message: "Failed to create reseller" });
    }
  });

  app.put('/api/resellers/:id', isAuthenticated, async (req, res) => {
    try {
      const resellerData = insertResellerSchema.partial().parse(req.body);
      const reseller = await storage.updateReseller(req.params.id, resellerData);
      res.json(reseller);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reseller data", errors: error.errors });
      }
      console.error("Error updating reseller:", error);
      res.status(500).json({ message: "Failed to update reseller" });
    }
  });

  app.delete('/api/resellers/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteReseller(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting reseller:", error);
      res.status(500).json({ message: "Failed to delete reseller" });
    }
  });

  // Software routes
  app.get('/api/software', isAuthenticated, async (req, res) => {
    try {
      const software = await storage.getSoftware();
      res.json(software);
    } catch (error) {
      console.error("Error fetching software:", error);
      res.status(500).json({ message: "Failed to fetch software" });
    }
  });

  app.post('/api/software', isAuthenticated, async (req, res) => {
    try {
      const softwareData = insertSoftwareSchema.parse(req.body);
      const software = await storage.createSoftware(softwareData);
      res.status(201).json(software);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid software data", errors: error.errors });
      }
      console.error("Error creating software:", error);
      res.status(500).json({ message: "Failed to create software" });
    }
  });

  // Subscription routes
  app.get('/api/subscriptions', isAuthenticated, async (req, res) => {
    try {
      const { status } = req.query;
      let subscriptions;
      
      if (status && typeof status === 'string') {
        subscriptions = await storage.getSubscriptionsByStatus(status);
      } else {
        subscriptions = await storage.getSubscriptions();
      }
      
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.get('/api/subscriptions/expiring/:days', isAuthenticated, async (req, res) => {
    try {
      const days = parseInt(req.params.days);
      const subscriptions = await storage.getExpiringSubscriptions(days);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching expiring subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch expiring subscriptions" });
    }
  });

  app.get('/api/subscriptions/:id', isAuthenticated, async (req, res) => {
    try {
      const subscription = await storage.getSubscription(req.params.id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.post('/api/subscriptions', isAuthenticated, async (req: any, res) => {
    try {
      const subscriptionData = insertSubscriptionSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub,
      });
      const subscription = await storage.createSubscription(subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      }
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.put('/api/subscriptions/:id', isAuthenticated, async (req, res) => {
    try {
      const subscriptionData = insertSubscriptionSchema.partial().parse(req.body);
      const subscription = await storage.updateSubscription(req.params.id, subscriptionData);
      res.json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      }
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.delete('/api/subscriptions/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSubscription(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting subscription:", error);
      res.status(500).json({ message: "Failed to delete subscription" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
