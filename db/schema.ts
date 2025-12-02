// drizzle/schema.ts
import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  serial,
} from "drizzle-orm/pg-core";

// -----------------------
// Users
// -----------------------
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  provider: text("provider"),
  providerAccountId: text("provider_account_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
});

// -----------------------
// Contacts
// -----------------------
export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  description: text("description"),
  links: jsonb("links").$type<any[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "cascade" }),
});

// -----------------------
// Scans
// -----------------------
export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),

  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),

  userAgent: text("user_agent"),
  ip: text("ip"),
  referrer: text("referrer"),
  country: text("country"),

  createdAt: timestamp("created_at").defaultNow(),
});
