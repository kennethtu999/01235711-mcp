import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const Rule = sqliteTable('Rule', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskType: text('taskType').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  content: text('content').notNull(),
  isActive: integer('isActive', { mode: 'boolean' }).notNull(),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
});

export const ApiToken = sqliteTable('ApiToken', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hashedToken: text('hashedToken').notNull(),
  name: text('name').notNull(),
  createdAt: text('createdAt').notNull(),
}); 