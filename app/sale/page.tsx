import SaleList from "@/components/sale/SaleList";
import { getSales } from "@/lib/api/sale/queries";

import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function Sale() {
  await checkAuth();
  const { sale } = await getSales();
  

  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Sale</h1>
        </div>
        <SaleList sale={sale}  />
      </div>
    </main>
  );
}
