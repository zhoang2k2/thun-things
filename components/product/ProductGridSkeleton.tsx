import { PAGE_SIZE } from '@/lib/catalog';

// Same footprint as the grid so streaming the real grid causes no layout shift.
export const ProductGridSkeleton = () => (
  <ul aria-hidden="true" className="ProductGridSkeleton grid grid-cols-1 px-4 md:grid-cols-4">
    {Array.from({ length: PAGE_SIZE }, (_, position) => (
      <li key={position} className="bg-placeholder aspect-[4/5] motion-safe:animate-pulse" />
    ))}
  </ul>
);
