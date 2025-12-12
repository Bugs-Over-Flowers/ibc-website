import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RegistrationTabsProps {
  children: React.ReactNode;
}

export default function RegistrationTabs({ children }: RegistrationTabsProps) {
  return (
    <Tabs defaultValue="participants">
      <TabsList>
        <TabsTrigger value="participants">Participants</TabsTrigger>
        <TabsTrigger value="registrations">Registrations</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
