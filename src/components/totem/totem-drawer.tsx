"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger,
  DrawerFooter
} from "@/components/ui/drawer";
import { ShoppingBag, ChevronUp, Plus, Minus, Trash2, CreditCard } from "lucide-react";
import { 
  getComandaState, 
  subscribeToComanda, 
  getTotal, 
  updateQuantidade, 
  removeItem 
} from "@/hooks/use-comanda";
import { ButtonPrimary } from "@/components/shared/button-primary";

export function TotemDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState(getComandaState());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Subscreve às mudanças do estado global da comanda
    const unsubscribe = subscribeToComanda(() => {
      setState(getComandaState());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Não mostrar o drawer na página inicial do totem ou se não houver itens
  const isHiddenPage = pathname === "/totem" || pathname === "/totem/sucesso";
  if (isHiddenPage || state.itens.length === 0) return null;

  const total = getTotal();

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      {/* Gatilho (A barra fina no rodapé) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4">
        <DrawerTrigger asChild>
          <button className="w-full max-w-4xl mx-auto flex items-center justify-between bg-ink text-white p-5 rounded-xl shadow-lg hover:bg-brand-primary-active transition-all">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-caption text-white/70 leading-none mb-1">
                  {state.itens.length} {state.itens.length === 1 ? "item" : "itens"} no carrinho
                </p>
                <p className="text-title-sm font-cal leading-none">
                  Ver Comanda
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-title-md font-cal">
                R$ {total.toFixed(2)}
              </span>
              <ChevronUp className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </button>
        </DrawerTrigger>
      </div>

      {/* Conteúdo da Gaveta (Drawer) */}
      <DrawerContent className="max-w-4xl mx-auto border-hairline bg-canvas">
        <DrawerHeader className="border-b border-hairline pb-4">
          <DrawerTitle className="text-display-sm font-cal text-ink flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            Minha Comanda
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {state.itens.length === 0 ? (
            <p className="text-center py-10 text-body-md text-muted">Seu carrinho está vazio.</p>
          ) : (
            <div className="space-y-4">
              {state.itens.map((item, index) => (
                <div key={`${item.tipo}-${item.id}-${index}`} className="flex items-center justify-between py-3 border-b border-hairline last:border-0">
                  <div className="flex-1">
                    <h4 className="text-title-sm text-ink">{item.nomeItem}</h4>
                    <p className="text-caption text-muted">
                      R$ {item.precoUnit.toFixed(2)} cada
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-surface-soft rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantidade(index, item.quantidade - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-body-md font-bold w-4 text-center">{item.quantidade}</span>
                      <button 
                        onClick={() => updateQuantidade(index, item.quantidade + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(index)}
                      className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DrawerFooter className="border-t border-hairline bg-surface-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-title-md text-body font-cal">Total Parcial</span>
            <span className="text-display-sm text-ink font-cal">R$ {total.toFixed(2)}</span>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setIsOpen(false)}
              className="flex-1 py-4 text-body-md font-bold text-ink border border-hairline rounded-lg bg-white hover:bg-surface-soft transition-colors"
            >
              Continuar Comprando
            </button>
            <ButtonPrimary 
              onClick={() => {
                setIsOpen(false);
                router.push("/totem/resumo");
              }}
              className="flex-1 py-4 h-auto text-lg flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Finalizar Pedido
            </ButtonPrimary>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
