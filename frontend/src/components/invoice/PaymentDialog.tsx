import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface PaymentForm {
  amount: number;
  date: string;
  method: string;
  notes: string;
}

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentForm) => void;
  isSubmitting: boolean;
  maxAmount: number;
}

export function PaymentDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  maxAmount,
}: PaymentDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PaymentForm>({
    defaultValues: {
      amount: maxAmount,
      date: new Date().toISOString().slice(0, 10),
      method: "bank_transfer",
      notes: "",
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>Add a new payment record for this invoice.</DialogDescription>
        </DialogHeader>
        <form id="payment-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", {
                  required: true,
                  valueAsNumber: true,
                  min: 0.01,
                  max: maxAmount,
                })}
              />
              {errors.amount && (
                <p className="text-xs text-destructive mt-1">
                  Please enter a valid amount up to {maxAmount.toFixed(2)}.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="date">Payment Date</Label>
              <Input id="date" type="date" {...register("date", { required: true })} />
            </div>
            <div>
              <Label htmlFor="method">Payment Method</Label>
              <Controller
                name="method"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="e.g., Payment for project milestone 1"
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="payment-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
