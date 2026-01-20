import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MfaVerifyLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the code from your authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="mx-auto h-4 w-28" />
            <div className="flex justify-center gap-2">
              <Skeleton className="size-12 rounded-md" />
              <Skeleton className="size-12 rounded-md" />
              <Skeleton className="size-12 rounded-md" />
              <Skeleton className="size-12 rounded-md" />
              <Skeleton className="size-12 rounded-md" />
              <Skeleton className="size-12 rounded-md" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    </div>
  );
}
