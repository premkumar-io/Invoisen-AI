import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isDeleting?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Client Profile?",
  description = "Are you sure you want to delete this profile? This action will remove all associated billing entity records.",
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive shadow-lg shadow-destructive/10">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="font-headline font-extrabold text-2xl text-foreground tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              {description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="w-full flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="w-full sm:w-1/2 rounded-full py-3 text-xs font-bold border-border/80 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full sm:w-1/2 rounded-full py-3 text-xs font-bold gap-2 shadow-lg shadow-destructive/25"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" /> Delete Profile
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
