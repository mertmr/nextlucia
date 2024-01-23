import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type SaleId, saleIdSchema, sale } from "@/lib/db/schema/sale";

export const getSales = async () => {
  const { session } = await getUserAuth();
  const s = await db.select().from(sale).where(eq(sale.userId, session?.user.id!));
  return { sale: s };
};

export const getSaleById = async (id: SaleId) => {
  const { session } = await getUserAuth();
  const { id: saleId } = saleIdSchema.parse({ id });
  const [s] = await db.select().from(sale).where(and(eq(sale.id, saleId), eq(sale.userId, session?.user.id!)));
  return { sale: s };
};

