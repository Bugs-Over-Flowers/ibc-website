import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import RegistrationPage from "./RegistrationPage";

const Page = ({ params }: PageProps<"/registration/[e]">) => {
  return (
    <main className="p-5 h-screen w-full flex items-center justify-center">
      <Suspense fallback={<Spinner />}>
        <RegistrationPage params={params} />
      </Suspense>
    </main>
  );
};

export default Page;
