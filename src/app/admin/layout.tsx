import { Sidebar } from "@/components/admin/sidebar";
import { TopNav } from "@/components/admin/top-nav";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const headerList = await headers();
  const pathname = headerList.get("x-pathname");

  if (!session && pathname !== "/admin/login") {
    redirect("/admin/login");
  }

  if (pathname === "/admin/login") {
    return <SessionProvider session={session}>{children}</SessionProvider>;
  }

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen bg-canvas">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

