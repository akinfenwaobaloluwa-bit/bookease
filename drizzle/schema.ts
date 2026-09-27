import {
    boolean,
    int,
    mysqlEnum,
    mysqlTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 160 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businesses = mysqlTable("businesses", {
    id: int("id").autoincrement().primaryKey(),
    ownerId: int("owner_id"),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    description: text("description"),
    logoUrl: varchar("logo_url", { length: 500 }),
    whatsappNumber: varchar("whatsapp_number", { length: 20 }).notNull(),
    phone: varchar("phone", { length: 30 }),
    address: varchar("address", { length: 255 }),
    primaryColor: varchar("primary_color", { length: 20 })
        .default("#7c3aed")
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const services = mysqlTable("services", {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("business_id").notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    imageUrl: varchar("image_url", { length: 500 }),
    price: int("price").notNull(),
    currency: varchar("currency", { length: 5 }).default("NGN").notNull(),
    durationMinutes: int("duration_minutes").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = mysqlTable("bookings", {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("business_id").notNull(),
    serviceId: int("service_id").notNull(),
    customerName: varchar("customer_name", { length: 120 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 30 }).notNull(),
    customerEmail: varchar("customer_email", { length: 160 }),
    bookingDate: varchar("booking_date", { length: 10 }).notNull(),
    startTime: varchar("start_time", { length: 5 }).notNull(),
    note: text("note"),
    status: mysqlEnum("status", [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
    ])
        .default("pending")
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const availability = mysqlTable("availability", {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("business_id").notNull(),
    dayOfWeek: int("day_of_week").notNull(),
    isOpen: boolean("is_open").default(true).notNull(),
    startTime: varchar("start_time", { length: 5 }).notNull(),
    endTime: varchar("end_time", { length: 5 }).notNull(),
});