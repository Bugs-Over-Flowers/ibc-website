import type { PropsWithChildren } from "react";
import { Footer } from "@/components/navbar/Footer";
import { Header } from "@/components/navbar/Header";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <div className="min-h-screen">{children}</div>
    </>
  );
}
