import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-background p-4">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Comanda Digital</h1>
        <p className="text-muted-foreground">Welcome! Please select an option to continue.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
        <Button asChild size="lg" className="w-full sm:w-auto px-8 py-6 text-lg font-semibold">
          <Link href="/totem">Totem</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-lg font-semibold">
          <Link href={session ? "/admin" : "/admin/login"}>Admin</Link>
        </Button>
      </div>
    </div>
  );
}
