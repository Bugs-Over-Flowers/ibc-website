import { Suspense } from "react";
import MockPage from "./MockPage";

const ComponentName = () => {
  return (
    <main className="pt-10">
      <Suspense fallback={"Loading events..."}>
        <MockPage />
      </Suspense>
    </main>
  );
};

export default ComponentName;
