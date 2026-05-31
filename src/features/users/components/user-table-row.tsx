"use client";

import { memo } from "react";
import { AppUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { CalendarClockIcon, PencilIcon, TrashIcon } from "lucide-react";

interface UserTableRowProps {
  user: AppUser;
  onEdit: (user: AppUser) => void;
  onDelete: (userId: string) => void;
  onRenew: (user: AppUser) => void;
}

export const UserTableRow = memo(function UserTableRow({
  user,
  onEdit,
  onDelete,
  onRenew,
}: UserTableRowProps) {
  const fmt = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return "—";
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{user.name || "—"}</TableCell>
      <TableCell className="text-sm">{user.email || "—"}</TableCell>
      <TableCell className="font-mono text-sm">{user.phone || "—"}</TableCell>
      <TableCell>
        <Badge variant={user.status === "active" ? "default" : "secondary"} className="capitalize">
          {user.status || "unknown"}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">{fmt(user.startDate)}</TableCell>
      <TableCell className="text-sm">{fmt(user.expiryDate)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRenew(user)}
            aria-label={`Renew ${user.name}`}
            title={`Renew ${user.name}`}
          >
            <CalendarClockIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(user)}
            aria-label={`Edit ${user.name}`}
            title={`Edit ${user.name}`}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(user.id)}
            aria-label={`Delete ${user.name}`}
            title={`Delete ${user.name}`}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
