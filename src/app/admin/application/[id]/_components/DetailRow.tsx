interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <dt className="font-medium text-muted-foreground text-sm">{label}</dt>
      <dd className="col-span-2 text-sm">{value}</dd>
    </div>
  );
}
