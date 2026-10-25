import { PAGE_SIZE } from '@/lib/catalog';

// Same footprint as the grid so streaming the real grid causes no layout shift.
export const ProductGridSkeleton = () => (
  <ul
    aria-hidden="true"
    className="ProductGridSkeleton mx-auto grid max-w-screen-2xl grid-cols-1 px-4 py-10 md:grid-cols-4 md:px-8"
  >
    {Array.from({ length: PAGE_SIZE }, (_, position) => (
      <li key={position} className="bg-placeholder aspect-[4/5] motion-safe:animate-pulse" />
    ))}
  </ul>
);
