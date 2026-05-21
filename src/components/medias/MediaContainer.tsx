export default function MediaContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1">
      <div className="custom-container flex flex-col gap-6 lg:gap-14">
        {children}
      </div>
    </div>
  );
}
