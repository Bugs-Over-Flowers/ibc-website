import { connection } from "next/server";
import { ScheduleInterview } from "./_components/ScheduleInterview";

export default async function ScheduleInterviewPage() {
  // Ensure this route runs at request-time under Cache Components.
  await connection();

  // The client component will handle validation and data fetching with proper error handling
  return <ScheduleInterview />;
}
