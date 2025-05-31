import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const files = pgTable("files", {
  id: uuid().defaultRandom().primaryKey(),

  name: text("name").notNull(),
  path: text("path").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(),

  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),

  userId: text("user_id").notNull(),
  parentId: text("parent_id"),

  isFolder: boolean("is_folder").notNull().default(false),
  isStarred: boolean("is_starred").notNull().default(false),
  isInTrash: boolean("is_in_trash").notNull().default(false),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const filesRelations = relations(files, ({ one, many }) => ({
  parent: one(files, {
    fields: [files.parentId],
    references: [files.id],
  }),

  children: many(files),
}));

export const File = typeof files.$inferSelect
export const createFile = typeof files.$inferInsert