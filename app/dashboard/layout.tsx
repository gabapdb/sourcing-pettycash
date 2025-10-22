export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* your sidebar or navbar here */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
