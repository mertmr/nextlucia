import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


import { type Sale, insertSaleParams } from "@/lib/db/schema/sale";
import {
  createSaleAction,
  deleteSaleAction,
  updateSaleAction,
} from "@/lib/actions/sale";
import { TAddOptimistic } from "@/app/sale/useOptimisticSale";


const SaleForm = ({
  
  sale,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  sale?: Sale | null;
  
  openModal?: (sale?: Sale) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Sale>(insertSaleParams);
  const { toast } = useToast();
  const editing = !!sale?.id;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Sale },
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
    } else {
      router.refresh();
      postSuccess && postSuccess();
    }

    toast({
      title: failed ? `Failed to ${action}` : "Success",
      description: failed ? data?.error ?? "Error" : `Sale ${action}d!`,
      variant: failed ? "destructive" : "default",
    });
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const saleParsed = await insertSaleParams.safeParseAsync(payload);
    if (!saleParsed.success) {
      setErrors(saleParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = saleParsed.data;
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: {
            ...values,
          userId: "",            
            id: editing ? sale.id : "",
          },
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateSaleAction({ ...values, id: sale.id })
          : await createSaleAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: editing
            ? { ...sale, ...values }
            : { ...values, id: "", userId: "" }, 
        };
        onSuccess(
          editing ? "update" : "create",
          error ? errorFormatted : undefined,
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  return (
    <form action={handleSubmit} onChange={handleChange} className={"space-y-8"}>
      {/* Schema fields start */}
              <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.total ? "text-destructive" : "",
          )}
        >
          Total
        </Label>
        <Input
          type="text"
          name="total"
          className={cn(errors?.total ? "ring ring-destructive" : "")}
          defaultValue={sale?.total ?? ""}
        />
        {errors?.total ? (
          <p className="text-xs text-destructive mt-2">{errors.total[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic && addOptimistic({ action: "delete", data: sale });
              const error = await deleteSaleAction(sale.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: sale,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default SaleForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: Boolean;
  errors: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating || errors}
      aria-disabled={isCreating || isUpdating || errors}
    >
      {editing
        ? `Sav${isUpdating ? "ing..." : "e"}`
        : `Creat${isCreating ? "ing..." : "e"}`}
    </Button>
  );
};
