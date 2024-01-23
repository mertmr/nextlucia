import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createSale,
  deleteSale,
  updateSale,
} from "@/lib/api/sale/mutations";
import { 
  saleIdSchema,
  insertSaleParams,
  updateSaleParams 
} from "@/lib/db/schema/sale";

export async function POST(req: Request) {
  try {
    const validatedData = insertSaleParams.parse(await req.json());
    const { sale } = await createSale(validatedData);

    revalidatePath("/sale"); // optional - assumes you will have named route same as entity

    return NextResponse.json(sale, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json({ error: err }, { status: 500 });
    }
  }
}


export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const validatedData = updateSaleParams.parse(await req.json());
    const validatedParams = saleIdSchema.parse({ id });

    const { sale } = await updateSale(validatedParams.id, validatedData);

    return NextResponse.json(sale, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const validatedParams = saleIdSchema.parse({ id });
    const { sale } = await deleteSale(validatedParams.id);

    return NextResponse.json(sale, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}
