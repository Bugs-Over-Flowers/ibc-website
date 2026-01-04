import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RegistrationTabsProps {
  children: React.ReactNode;
}

export default function RegistrationTabs({ children }: RegistrationTabsProps) {
  return (
    <Tabs defaultValue="registrations">
      <TabsList>
        <TabsTrigger value="registrations">Registrations</TabsTrigger>
        <TabsTrigger value="participants">Participants</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
