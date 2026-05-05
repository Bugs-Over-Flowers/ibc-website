import { CreditCard, Wallet } from "lucide-react";
import { PaymentMethodEnum } from "@/lib/validation/utils";

const PAYMENT_OPTIONS = [
  {
    id: "onsite",
    value: PaymentMethodEnum.enum.onsite,
    icon: Wallet,
    title: "Pay Onsite",
    description: "Pay via cash or card at the event",
  },
  {
    id: "online",
    value: PaymentMethodEnum.enum.online,
    icon: CreditCard,
    title: "Bank Transfer / Online",
    description: "Pay now and upload receipt",
  },
];

export default PAYMENT_OPTIONS;
