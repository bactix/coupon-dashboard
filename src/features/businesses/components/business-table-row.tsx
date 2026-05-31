"use client";

import { memo } from "react";
import { Business } from "@/types/business";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { PencilIcon, TrashIcon } from "lucide-react";
import {
  BUSINESS_TYPE_VARIANT,
  BUSINESS_TYPE_LABELS,
} from "@/features/businesses/constants";

interface BusinessTableRowProps {
  business: Business;
  onEdit: (business: Business) => void;
  onDelete: (businessId: string) => void;
}

export const BusinessTableRow = memo(function BusinessTableRow({
  business,
  onEdit,
  onDelete,
}: BusinessTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{business.name}</TableCell>
      <TableCell className="text-sm">{business.email}</TableCell>
      <TableCell>
        <Badge
          variant={BUSINESS_TYPE_VARIANT[business.type]}
          className="capitalize"
        >
          {BUSINESS_TYPE_LABELS[business.type]}
        </Badge>
      </TableCell>
      <TableCell>{business.city}</TableCell>
      <TableCell className="font-mono text-sm">{business.phone}</TableCell>
      <TableCell>{business.ownerName}</TableCell>
      <TableCell className="text-sm capitalize">
        {business.businessModel === "limited"
          ? `Limited (${business.usageLimit} uses)`
          : "Unlimited"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(business)}
            aria-label={`Edit ${business.name}`}
            title={`Edit ${business.name}`}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(business.id)}
            aria-label={`Delete ${business.name}`}
            title={`Delete ${business.name}`}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
