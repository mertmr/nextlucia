"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { type Sale, CompleteSale } from "@/lib/db/schema/sale";
import Modal from "@/components/shared/Modal";

import { Button } from "@/components/ui/button";
import SaleForm from "./SaleForm";
import { PlusIcon } from "lucide-react";
import { useOptimisticSales } from "@/app/sale/useOptimisticSale";

type TOpenModal = (sale?: Sale) => void;

export default function SaleList({
  sale,
   
}: {
  sale: CompleteSale[];
   
}) {
  const { optimisticSales, addOptimisticSale } = useOptimisticSales(
    sale,
     
  );
  const [open, setOpen] = useState(false);
  const [activeSale, setActiveSale] = useState<Sale | null>(null);
  const openModal = (sale?: Sale) => {
    setOpen(true);
    sale ? setActiveSale(sale) : setActiveSale(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeSale ? "Edit Sale" : "Create Sale"}
      >
        <SaleForm
          sale={activeSale}
          addOptimistic={addOptimisticSale}
          openModal={openModal}
          closeModal={closeModal}
          
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticSales.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticSales.map((sale) => (
            <Sale
              sale={sale}
              key={sale.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Sale = ({
  sale,
  openModal,
}: {
  sale: CompleteSale;
  openModal: TOpenModal;
}) => {
  const optimistic = sale.id === "optimistic";
  const deleting = sale.id === "delete";
  const mutating = optimistic || deleting;
  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div>{sale.total}</div>
      </div>
      <Button
        onClick={() => openModal(sale)}
        disabled={mutating}
        variant={"ghost"}
      >
        Edit
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No sale
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new sale.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Sale </Button>
      </div>
    </div>
  );
};
