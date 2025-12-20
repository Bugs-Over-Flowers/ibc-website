import { Suspense } from "react";
import CheckIn from "./_components/CheckIn";

export default function CheckInPage() {
  return (
    <div>
      <h2>Check in page</h2>
      <div className="flex w-full gap-5 pt-10">
        <Suspense>
          <CheckIn />
        </Suspense>
      </div>
    </div>
  );
}
