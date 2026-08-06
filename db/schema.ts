import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  date,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  businessName: varchar('business_name', { length: 255 }),
  npwp: varchar('npwp', { length: 20 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  logoUrl: text('logo_url'),
  defaultCurrency: varchar('default_currency', { length: 3 }).default('IDR').notNull(),
  defaultNotes: text('default_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  country: varchar('country', { length: 100 }),
  isForeignHint: boolean('is_foreign_hint').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).default('draft').notNull(), // draft, sent, partial_paid, paid, overdue, cancelled
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date').notNull(),
  currency: varchar('currency', { length: 3 }).default('IDR').notNull(),
  exchangeRate: numeric('exchange_rate'),
  exchangeRateSource: varchar('exchange_rate_source', { length: 100 }),
  exchangeRateDate: date('exchange_rate_date'),
  notes: text('notes'),
  meteraiRequired: boolean('meterai_required').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceId: uuid('invoice_id').references(() => invoices.id).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  quantity: numeric('quantity').notNull(),
  rate: numeric('rate').notNull(),
  subtotal: numeric('subtotal').notNull(),
});

export const quotations = pgTable('quotations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  quotationNumber: varchar('quotation_number', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).default('draft').notNull(), // draft, sent, accepted, rejected, expired
  issueDate: date('issue_date').notNull(),
  validUntil: date('valid_until').notNull(),
  currency: varchar('currency', { length: 3 }).default('IDR').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const quotationItems = pgTable('quotation_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  quotationId: uuid('quotation_id').references(() => quotations.id).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  quantity: numeric('quantity').notNull(),
  rate: numeric('rate').notNull(),
  subtotal: numeric('subtotal').notNull(),
});

export const contracts = pgTable('contracts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  contractNumber: varchar('contract_number', { length: 100 }).notNull(),
  contractType: varchar('contract_type', { length: 100 }), // e.g., 'freelance'
  currency: varchar('currency', { length: 3 }).default('IDR').notNull(),
  value: numeric('value').notNull(),
  signatureStatus: varchar('signature_status', { length: 50 }).default('unsigned').notNull(), // unsigned, freelancer_signed, both_signed
  signedAt: timestamp('signed_at'),
  documentHash: varchar('document_hash', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
