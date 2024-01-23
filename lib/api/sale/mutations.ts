import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import { 
  SaleId, 
  NewSaleParams,
  UpdateSaleParams, 
  updateSaleSchema,
  insertSaleSchema, 
  sale,
  saleIdSchema 
} from "@/lib/db/schema/sale";
import { getUserAuth } from "@/lib/auth/utils";

export const createSale = async (sales: NewSaleParams) => {
  const { session } = await getUserAuth();
  const newSale = insertSaleSchema.parse({ ...sales, userId: session?.user.id! });
  try {
    const [s] =  await db.insert(sale).values(newSale).returning();
    return { sale: s };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateSale = async (id: SaleId, sales: UpdateSaleParams) => {
  const { session } = await getUserAuth();
  const { id: saleId } = saleIdSchema.parse({ id });
  const newSale = updateSaleSchema.parse({ ...sales, userId: session?.user.id! });
  try {
    const [s] =  await db
     .update(sale)
     .set(newSale)
     .where(and(eq(sale.id, saleId!), eq(sale.userId, session?.user.id!)))
     .returning();
    return { sale: s };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteSale = async (id: SaleId) => {
  const { session } = await getUserAuth();
  const { id: saleId } = saleIdSchema.parse({ id });
  try {
    const [s] =  await db.delete(sale).where(and(eq(sale.id, saleId!), eq(sale.userId, session?.user.id!)))
    .returning();
    return { sale: s };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

