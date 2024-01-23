import { integer, varchar, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";


import { randomUUID } from "crypto";
import { getSales } from "@/lib/api/sale/queries";


export const sale = pgTable('sale', {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => randomUUID()),
  total: integer("total").notNull(),
  userId: varchar("user_id", { length: 256 }).notNull(),
});


// Schema for sale - used to validate API requests
export const insertSaleSchema = createInsertSchema(sale);

export const insertSaleParams = createSelectSchema(sale, {
  total: z.coerce.number()
}).omit({ 
  id: true,
  userId: true
});

export const updateSaleSchema = createSelectSchema(sale);

export const updateSaleParams = createSelectSchema(sale,{
  total: z.coerce.number()
}).omit({ 
  userId: true
});

export const saleIdSchema = updateSaleSchema.pick({ id: true });

// Types for sale - used to type API request params and within Components
export type Sale = z.infer<typeof updateSaleSchema>;
export type NewSale = z.infer<typeof insertSaleSchema>;
export type NewSaleParams = z.infer<typeof insertSaleParams>;
export type UpdateSaleParams = z.infer<typeof updateSaleParams>;
export type SaleId = z.infer<typeof saleIdSchema>["id"];
    
// this type infers the return from getSale() - meaning it will include any joins
export type CompleteSale = Awaited<ReturnType<typeof getSales>>["sale"][number];

