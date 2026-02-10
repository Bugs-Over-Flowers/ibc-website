"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAction } from "@/hooks/useAction";
import { cn } from "@/lib/utils";
import { logout } from "@/server/auth/mutations/logout";

interface AdminSidebarSecondaryProps {
  onNavigate?: () => void;
}

export function AdminSidebarSecondary({
  onNavigate,
}: AdminSidebarSecondaryProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { execute, isPending } = useAction(logout, {
    onSuccess: () => {
      setOpen(false);
      if (onNavigate) {
        onNavigate();
      }
      router.push("/auth");
    },
  });

  const handleLogout = () => {
    execute(undefined);
  };

  return (
    <>
      <SidebarGroup className="mt-auto border-t pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={cn(
                "h-12 w-full justify-start transition-colors transition-padding",
                "text-red-600 hover:bg-red-50 hover:text-red-700",
              )}
              disabled={isPending}
              onClick={() => setOpen(true)}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">
                {isPending ? "Logging out..." : "Logout"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <AlertDialog onOpenChange={setOpen} open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You'll need to sign in again to
              access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isPending}
              onClick={handleLogout}
            >
              {isPending ? "Logging out..." : "Logout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
