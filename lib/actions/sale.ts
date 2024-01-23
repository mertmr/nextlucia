"use server";

import { revalidatePath } from "next/cache";
import {
  createSale,
  deleteSale,
  updateSale,
} from "@/lib/api/sale/mutations";
import {
  SaleId,
  NewSaleParams,
  UpdateSaleParams,
  saleIdSchema,
  insertSaleParams,
  updateSaleParams,
} from "@/lib/db/schema/sale";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateSales = () => revalidatePath("/sale");

export const createSaleAction = async (input: NewSaleParams) => {
  try {
    const payload = insertSaleParams.parse(input);
    await createSale(payload);
    revalidateSales();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateSaleAction = async (input: UpdateSaleParams) => {
  try {
    const payload = updateSaleParams.parse(input);
    await updateSale(payload.id, payload);
    revalidateSales();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteSaleAction = async (input: SaleId) => {
  try {
    const payload = saleIdSchema.parse({ id: input });
    await deleteSale(payload.id);
    revalidateSales();
  } catch (e) {
    return handleErrors(e);
  }
};