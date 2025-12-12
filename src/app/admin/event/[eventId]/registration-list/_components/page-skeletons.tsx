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
export function StatsSkeleton() {
  return (
    <div className="flex w-full flex-col justify-between gap-2 md:flex-row md:gap-4">
      {[
        {
          label: "Total Registrations",

          icon: <Users2 />,
        },
        { label: "Verified Registrations", icon: <CheckCircle /> },
        { label: "Pending Registrations", icon: <Clock /> },
      ].map(({ label, icon }) => (
        <Card className="h-36 w-full" key={label}>
          <CardContent className="flex h-full flex-col justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-medium text-lg">{label}</h3>
            </div>
            <div>
              <Spinner className="font-medium text-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton() {
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
