import { CreateSRPageContent } from "./_components/CreateSRPageContent";

export const metadata = {
  title: "Create Sponsored Registration | Admin",
  description: "Create a new sponsored registration",
};

export default async function NewSponsoredRegistrationPage() {
  return <CreateSRPageContent />;
}
