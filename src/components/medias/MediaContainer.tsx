export default function MediaContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1">
      <div className="custom-container">{children}</div>
    </div>
  );
}
