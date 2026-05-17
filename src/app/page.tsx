import Link from 'next/link';
import { Scissors, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="text-center mb-12">
        <div className="h-20 w-20 rounded-full bg-primary mx-auto mb-6 flex items-center justify-center">
          <Scissors className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Barbearia</h1>
        <p className="text-xl text-gray-400">Sistema de Comanda Digital</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg w-full">
        <Button
          variant="outline"
          className="w-full h-32 flex flex-col items-center justify-center gap-2 border-gray-600 text-white hover:bg-white/10"
          asChild
        >
          <Link href="/totem">
            <Monitor className="h-10 w-10" />
            <span className="text-lg font-semibold">Totem</span>
            <span className="text-sm text-gray-400">Fazer check-in</span>
          </Link>
        </Button>

        <Button
          variant="outline"
          className="w-full h-32 flex flex-col items-center justify-center gap-2 border-gray-600 text-white hover:bg-white/10"
          asChild
        >
          <Link href="/professional">
            <Scissors className="h-10 w-10" />
            <span className="text-lg font-semibold">Profissional</span>
            <span className="text-sm text-gray-400">Painel de pedidos</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
