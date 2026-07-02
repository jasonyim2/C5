'use client';

import { cn } from '@/lib/utils';

interface FilterBarProps {
  categories: string[];
  activeCategory: string | null;
  showFavorites: boolean;
  onCategoryChange: (cat: string | null) => void;
  onFavoritesToggle: () => void;
  totalCount: number;
}

export function FilterBar({
  categories,
  activeCategory,
  showFavorites,
  onCategoryChange,
  onFavoritesToggle,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
      <button
        onClick={() => {
          onCategoryChange(null);
          if (showFavorites) onFavoritesToggle();
        }}
        className={cn(
          'flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border',
          !showFavorites && activeCategory === null
            ? 'bg-[#FF0000] text-white border-[#FF0000] shadow-sm'
            : 'bg-secondary text-secondary-foreground border-border hover:border-border/60 hover:bg-accent'
        )}
      >
        전체 {totalCount > 0 && <span className="ml-1 opacity-70">{totalCount}</span>}
      </button>

      <button
        onClick={onFavoritesToggle}
        className={cn(
          'flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border',
          showFavorites
            ? 'bg-[#FF0000] text-white border-[#FF0000] shadow-sm'
            : 'bg-secondary text-secondary-foreground border-border hover:border-border/60 hover:bg-accent'
        )}
      >
        ♥ 즐겨찾기
      </button>

      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => {
            if (showFavorites) onFavoritesToggle();
            onCategoryChange(activeCategory === cat ? null : cat);
          }}
          className={cn(
            'flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border',
            activeCategory === cat && !showFavorites
              ? 'bg-[#FF0000] text-white border-[#FF0000] shadow-sm'
              : 'bg-secondary text-secondary-foreground border-border hover:border-border/60 hover:bg-accent'
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
