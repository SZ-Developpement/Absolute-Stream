import { cn } from "@/lib/utils";

export default function MediaContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex-1">
      <div
        className={cn(
          "custom-container flex flex-col gap-6 lg:gap-14",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
