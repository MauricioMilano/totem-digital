"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
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

/** Tempo (ms) que a barra expandida fica visível antes de colapsar para a pill compacta. */
const COLLAPSE_DELAY_MS = 6000;

export function TotemDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState(getComandaState());
  const [isOpen, setIsOpen] = useState(false);
  // "expanded" = barra completa (feedback de item adicionado). false = pill compacta.
  const [expanded, setExpanded] = useState(false);

  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCountRef = useRef<number>(state.itens.length);

  useEffect(() => {
    // Subscreve às mudanças do estado global da comanda
    const unsubscribe = subscribeToComanda(() => {
      setState(getComandaState());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Sempre que o carrinho muda (e a gaveta está fechada), mostra a barra expandida
  // e agenda o colapso para a pill compacta após COLLAPSE_DELAY_MS de inatividade.
  useEffect(() => {
    const count = state.itens.length;
    if (count === prevCountRef.current) return;
    prevCountRef.current = count;

    if (isOpen || count === 0) return; // gaveta aberta trava a barra; vazio some no render

    // Expande a barra e agenda o colapso. O setState é feito fora do corpo síncrono
    // do efeito (via microtask) para evitar re-render em cascata detectado pelo linter.
    const expand = () => {
      setExpanded(true);
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = setTimeout(() => {
        setExpanded(false);
      }, COLLAPSE_DELAY_MS);
    };
    void Promise.resolve().then(expand);
  }, [state.itens.length, isOpen]);

  // Limpa o timer ao desmontar
  useEffect(
    () => () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    },
    []
  );

  // Não mostrar o drawer na página inicial do totem ou se não houver itens
  const isHiddenPage = pathname === "/totem" || pathname === "/totem/sucesso";
  if (isHiddenPage || state.itens.length === 0) return null;

  const total = getTotal();

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          // Gaveta fechou → volta à pill compacta e reinicia o timer de colapso
          setExpanded(false);
          if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
        }
      }}
    >
      {/* Gatilho: barra expandida (feedback temporário) que colapsa para a pill compacta */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4">
        <button
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          className={`w-full max-w-4xl mx-auto flex items-center justify-between bg-brand-primary text-on-primary rounded-xl shadow-lg hover:bg-brand-primary-active transition-all duration-300 ${
            expanded ? "p-5" : "py-3 px-4"
          }`}
        >
            {/* Lado esquerdo: ícone (sempre) + resumo (somente expandido) */}
            <div className="flex items-center gap-3">
              <div className="relative bg-white/20 p-2 rounded-lg">
                <ShoppingBag className="w-5 h-5" />
                {/* Badge de itens: aparece na pill compacta (quando o resumo está oculto) */}
                <span
                  className={`absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-signature-coral text-white text-caption font-bold flex items-center justify-center transition-opacity duration-300 ${
                    expanded ? "opacity-0 scale-50" : "opacity-100 scale-100"
                  }`}
                >
                  {state.itens.length}
                </span>
              </div>
              <div
                className={`text-left overflow-hidden transition-all duration-300 ease-out ${
                  expanded ? "max-w-xs opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                <p className="text-caption text-on-primary/80 leading-none mb-1 whitespace-nowrap">
                  {state.itens.length} {state.itens.length === 1 ? "item" : "itens"} no carrinho
                </p>
                <p className="text-title-sm font-cal leading-none whitespace-nowrap">
                  Ver Comanda
                </p>
              </div>
            </div>

            {/* Lado direito: total + chevron (sempre visíveis) */}
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-title-md font-cal whitespace-nowrap">
                R$ {total.toFixed(2)}
              </span>
              <ChevronUp className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </button>
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
            <p className="text-center py-10 text-body-md text-muted-foreground">Seu carrinho está vazio.</p>
          ) : (
            <div className="space-y-4">
              {state.itens.map((item, index) => (
                <div key={`${item.tipo}-${item.id}-${index}`} className="flex items-center justify-between py-3 border-b border-hairline last:border-0">
                  <div className="flex-1">
                    <h4 className="text-title-sm text-ink">{item.nomeItem}</h4>
                    <p className="text-caption text-muted-foreground">
                      R$ {item.precoUnit.toFixed(2)} cada
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-surface-soft rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantidade(index, item.quantidade - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-card transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-body-md font-bold w-4 text-center">{item.quantidade}</span>
                      <button 
                        onClick={() => updateQuantidade(index, item.quantidade + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-card transition-colors"
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
                className="flex-1 py-4 text-body-md font-bold text-ink border border-hairline rounded-lg bg-canvas hover:bg-surface-card transition-colors"
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
