import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs text-gray-500 overflow-x-auto py-2 ${className}`}
    >
      <ol className="flex items-center gap-1.5 whitespace-nowrap">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 text-gray-500 hover:text-[#e85d75] transition-colors focus:outline-none focus:ring-1 focus:ring-[#e85d75] rounded px-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Trang chủ</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {isLast || !item.href ? (
                <span
                  className="font-semibold text-gray-800"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-[#e85d75] transition-colors focus:outline-none focus:ring-1 focus:ring-[#e85d75] rounded px-1"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
