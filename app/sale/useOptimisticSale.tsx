
import { type Sale, type CompleteSale } from "@/lib/db/schema/sale";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Sale>) => void;

export const useOptimisticSales = (
  sale: CompleteSale[],
  
) => {
  const [optimisticSales, addOptimisticSale] = useOptimistic(
    sale,
    (
      currentState: CompleteSale[],
      action: OptimisticAction<Sale>,
    ): CompleteSale[] => {
      const { data } = action;

      

      const optimisticSale = {
        ...data,
        
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticSale]
            : [...currentState, optimisticSale];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticSale } : item,
          );
        case "delete":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, id: "delete" } : item,
          );
        default:
          return currentState;
      }
    },
  );

  return { addOptimisticSale, optimisticSales };
};
