'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Heart, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: '홈', href: '/' },
  { icon: Heart, label: '즐겨찾기', href: '/?favorite=true' },
  { icon: Tag, label: '카테고리', href: '/?view=categories' },
];

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('favorite') === 'true') setActive(1);
      else if (params.get('view') === 'categories') setActive(2);
      else setActive(0);
    }
  }, [pathname]);

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
      <div className="glass card-shadow flex items-center gap-1 px-3 py-2 rounded-full border border-border/60">
        {navItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => {
              setActive(i);
              router.push(item.href);
            }}
            className={cn(
              'flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all duration-200',
              active === i
                ? 'bg-[#FF0000] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export function DesktopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('favorite') === 'true') setActive(1);
      else if (params.get('view') === 'categories') setActive(2);
      else setActive(0);
    }
  }, [pathname]);

  return (
    <nav className="hidden md:flex flex-col items-center gap-2 fixed left-0 top-0 h-full w-[72px] pt-6 pb-8 border-r border-border bg-background/95 backdrop-blur-sm z-40">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FF0000] mb-6 flex-shrink-0">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        {navItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => {
              setActive(i);
              router.push(item.href);
            }}
            title={item.label}
            className={cn(
              'flex flex-col items-center gap-1 w-12 py-2.5 rounded-xl transition-all duration-200',
              active === i
                ? 'bg-[#FF0000]/10 text-[#FF0000]'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-medium leading-none">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
