import type { Metadata } from "next";
import { CreateNetworkPageContent } from "./_components/CreateNetworkPageContent";

export const metadata: Metadata = {
  title: "Create Network | Admin",
  description: "Add a new network organization and representative",
};

export default function NewNetworkPage() {
  return <CreateNetworkPageContent />;
}
