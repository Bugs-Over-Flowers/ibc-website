import { CheckCircle, Clock, Users2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 *
 * Skeletons
 */
export function RegistrationListStatsSkeleton() {
  return (
    <div className="w-full flex justify-between flex-col md:flex-row gap-2 md:gap-4">
      {[
        {
          label: "Total Registrations",

          icon: <Users2 />,
        },
        { label: "Verified Registrations", icon: <CheckCircle /> },
        { label: "Pending Registrations", icon: <Clock /> },
      ].map(({ label, icon }) => (
        <Card key={label} className="h-36 w-full">
          <CardContent className="flex flex-col h-full justify-between">
            <div className="flex gap-2 items-center">
              {icon}
              <h3 className="text-lg font-medium">{label}</h3>
            </div>
            <div>
              <Spinner className="text-lg font-medium" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RegistrationListTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Affiliation</TableHead>
            <TableHead>Registered By</TableHead>
            <TableHead>Registration Date</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {["a", "b", "c", "d", "e"].map((id) => (
            <TableRow key={id}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-14 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
