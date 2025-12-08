import { Footer } from "@/components/navbar/Footer";
import { Header } from "@/components/navbar/Header";

export default function Page() {
  const handleNavigate = (page: string, params?: { eventId?: string }) => {
    console.log("Navigate to:", page, params);
  };
  return (
    <>
      <Header />
      <div>page 1</div>
      <Footer />
    </>
  );
}
