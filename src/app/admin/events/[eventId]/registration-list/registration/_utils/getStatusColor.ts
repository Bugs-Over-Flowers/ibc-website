import type { Enums } from "@/lib/supabase/db.types";

const getStatusColor = (status: Enums<"PaymentProofStatus">) => {
  switch (status.toLowerCase()) {
    case "accepted":
      return "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200";
    case "pending":
      return "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-200";
    case "rejected":
      return "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};
export default getStatusColor;
