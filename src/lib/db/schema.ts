import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  varchar,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const providers = pgTable('providers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  address: text('address'),
  businessHours: text('business_hours'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').references(() => providers.id),
  name: text('name').notNull(),
  description: text('description'),
  duration: integer('duration').notNull(), // in minutes
  price: integer('price').notNull(), // in cents
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').references(() => providers.id),
  serviceId: integer('service_id').references(() => services.id),
  userId: text('user_id').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('scheduled'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const availability = pgTable('availability', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').references(() => providers.id),
  date: timestamp('date').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  isAvailable: boolean('is_available').notNull().default(true),
  appointmentId: integer('appointment_id').references(() => appointments.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const providerRelations = relations(providers, ({ many }) => ({
  services: many(services),
  appointments: many(appointments),
  availability: many(availability),
}));

export const serviceRelations = relations(services, ({ one, many }) => ({
  provider: one(providers, {
    fields: [services.providerId],
    references: [providers.id],
  }),
  appointments: many(appointments),
}));

export const appointmentRelations = relations(appointments, ({ one, many }) => ({
  provider: one(providers, {
    fields: [appointments.providerId],
    references: [providers.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  availability: many(availability),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  provider: one(providers, {
    fields: [availability.providerId],
    references: [providers.id],
  }),
  appointment: one(appointments, {
    fields: [availability.appointmentId],
    references: [appointments.id],
  }),
}));
