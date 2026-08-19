"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  confirmLabel = "Are you sure?",
}: {
  action: () => Promise<void> | void;
  confirmLabel?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon-sm"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmLabel)) {
          startTransition(() => {
            action();
          });
        }
      }}
      aria-label="Delete"
    >
      <Trash2 className="size-3.5" />
    </Button>
  );
}
