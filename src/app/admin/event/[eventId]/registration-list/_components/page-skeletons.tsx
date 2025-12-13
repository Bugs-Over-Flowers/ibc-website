/** biome-ignore-all lint/suspicious/noArrayIndexKey: Rendering static items only */
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
        { label: "Total Registrations", icon: <Users2 /> },
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

interface TableSkeletonProps {
  columns: number;
}

export function TableSkeleton({ columns }: TableSkeletonProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
              <TableHead key={index}>Column {index + 1}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              {Array.from({ length: columns }).map((_, index) => (
                <TableCell key={index}>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
              ))}
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
