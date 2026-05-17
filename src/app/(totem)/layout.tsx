import { Toaster } from "@/components/ui/sonner";

export default function TotemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      {children}
      <Toaster />
    </div>
  );
}
