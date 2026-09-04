"use client";

import { useState } from "react";
import { Check, Minus, Plus, type LucideIcon } from "lucide-react";

export interface MenuItemMeta {
  icon: LucideIcon;
  label: string;
}

interface MenuItemCardProps {
  name: string;
  price: number;
  description?: string | null;
  image?: string | null;
  /** Badges de metadados específicos do tipo (duração, volume, álcool…). */
  meta?: MenuItemMeta[];
  variant: "select" | "stepper";
  /** Variante select (serviços): estado + callback. */
  selected?: boolean;
  onSelect?: () => void;
  /** Variante stepper (bebidas/produtos): quantidade + callbacks. */
  quantity?: number;
  onAdd?: () => void;
  onRemove?: () => void;
}

/**
 * Monograma elegante usado quando o item não tem imagem: iniciais do nome
 * sobre gradiente espresso/sand (sem serviço externo, funciona offline).
 */
function monogram(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function MenuItemCard({
  name,
  price,
  description,
  image,
  meta = [],
  variant,
  selected = false,
  onSelect,
  quantity = 0,
  onAdd,
  onRemove,
}: MenuItemCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = image && !imgFailed;

  const body = (
    <>
      {/* Imagem em destaque com fallback de monograma */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-gradient-to-br from-surface-dark via-canvas to-surface-soft">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image!}
            alt={name}
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-5xl text-brand-primary/45 select-none">
              {monogram(name)}
            </span>
          </div>
        )}
        {/* Vinheta sutil para o conteúdo do card "sentar" sobre a imagem */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-canvas/80 to-transparent" />
      </div>

      {/* Conteúdo: nome em serif, metadados e preço hierarquizado */}
      <div className="flex flex-col gap-2 pt-3">
        <h3 className="font-display text-title-md text-ink leading-snug">{name}</h3>
        {description && (
          <p className="text-body-md text-body line-clamp-2">{description}</p>
        )}
        {meta.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {meta.map((m) => {
              const Icon = m.icon;
              return (
                <span
                  key={m.label}
                  className="inline-flex items-center gap-1 rounded-pill bg-surface-soft px-2.5 py-1 text-caption text-body"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {m.label}
                </span>
              );
            })}
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-title-sm text-brand-primary font-medium">
            R$ {Number(price).toFixed(2)}
          </span>

          {variant === "select" ? (
            <span
              aria-hidden={!selected}
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                selected
                  ? "bg-brand-primary border-brand-primary"
                  : "border-border-strong"
              }`}
            >
              {selected && <Check className="w-4 h-4 text-on-primary" />}
            </span>
          ) : quantity > 0 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRemove}
                aria-label={`Remover ${name}`}
                className="w-11 h-11 rounded-full border border-border-strong flex items-center justify-center hover:bg-surface-soft transition-colors"
              >
                <Minus className="w-4 h-4 text-ink" />
              </button>
              <span className="text-title-sm font-medium text-ink w-6 text-center tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={onAdd}
                aria-label={`Adicionar ${name}`}
                className="w-11 h-11 rounded-full bg-brand-primary flex items-center justify-center hover:bg-brand-primary-active transition-colors"
              >
                <Plus className="w-4 h-4 text-on-primary" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              aria-label={`Adicionar ${name}`}
              className="w-11 h-11 rounded-lg border border-border-strong flex items-center justify-center hover:bg-surface-soft transition-colors"
            >
              <Plus className="w-4 h-4 text-brand-primary" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  if (variant === "select") {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`w-full text-left min-h-[44px] p-3 rounded-xl border transition-all ${
          selected
            ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary"
            : "border-hairline bg-surface-card hover:border-border-strong"
        }`}
      >
        {body}
      </button>
    );
  }

  return (
    <div className="w-full p-3 rounded-xl border border-hairline bg-surface-card">
      {body}
    </div>
  );
}
