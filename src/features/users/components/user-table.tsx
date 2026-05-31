"use client";

import { memo } from "react";
import { AppUser } from "@/types/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserTableRow } from "./user-table-row";
import { USER_EMPTY_STATE } from "@/features/users/constants";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface UserTableProps {
  users: AppUser[];
  onEdit: (user: AppUser) => void;
  onDelete: (userId: string) => void;
  onRenew: (user: AppUser) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export const UserTable = memo(function UserTable({
  users,
  onEdit,
  onDelete,
  onRenew,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: UserTableProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="text-muted-foreground">
                    <p className="font-medium">{USER_EMPTY_STATE.title}</p>
                    <p className="text-sm">{USER_EMPTY_STATE.description}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onRenew={onRenew}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalItems > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            Showing {start}–{end} of {totalItems} users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={!hasPrev}
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={!hasNext}
            >
              Next
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});
