import React, { useState } from 'react';
import { Input } from '@/components/base/Input/Input';
import { useRouter } from 'next/navigation';

interface DocSearchProps {
  className?: string;
}

export function DocSearch({ className }: DocSearchProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React?.FormEvent) => {
    e?.preventDefault();
    if (query?.trim()) {
      router?.push(`/docs/search?q=${encodeURIComponent(query?.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={className}>
      <div className="relative">
        <Input
          type="search"
          role="searchbox"
          placeholder="Search documentation..."
          value={query}
          onChange={(e) => setQuery(e?.target.value)}
          className="w-full pl-10"
        />
        <svg
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www?.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-muted px-1?.5 font-mono text-xs text-muted-foreground">
          ⌘K
        </kbd>
      </div>
    </form>
  );
}
