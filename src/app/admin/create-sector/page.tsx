import { Suspense } from "react";
import CreateSectorForm from "./_components/CreateSectorForm";

export default function createSectorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateSectorForm />
    </Suspense>
  );
}
