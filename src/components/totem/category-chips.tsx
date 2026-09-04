"use client";

interface CategoryChipsProps {
  categories: { id: string; nome: string }[];
  activeId: string;
  onChange: (id: string) => void;
}

/**
 * Chips de filtro por categoria usados nas três telas de cardápio do totem.
 * Alvos de toque ≥ 44px (h-11 = 44px).
 */
export function CategoryChips({ categories, activeId, onChange }: CategoryChipsProps) {
  const chipClass = (active: boolean) =>
    `inline-flex items-center justify-center h-11 min-h-[44px] px-5 rounded-pill whitespace-nowrap text-body-md font-medium transition-colors ${
      active
        ? "bg-brand-primary text-on-primary"
        : "bg-surface-soft text-body hover:text-ink"
    }`;

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
      <button type="button" onClick={() => onChange("todas")} className={chipClass(activeId === "todas")}>
        Todas
      </button>
      {categories.map((cat) => (
        <button key={cat.id} type="button" onClick={() => onChange(cat.id)} className={chipClass(activeId === cat.id)}>
          {cat.nome}
        </button>
      ))}
    </div>
  );
}
