import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import RegistrationPage from "./RegistrationPage";

const Page = ({ params }: PageProps<"/registration/[e]">) => {
  return (
    <main className="flex h-screen w-full items-center justify-center p-5">
      <Suspense fallback={<Spinner />}>
        <RegistrationPage params={params} />
      </Suspense>
    </main>
  );
};

export default Page;
