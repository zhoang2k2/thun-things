import { Badge } from '@/components/ui/Badge';
import type { ProductStatus } from '@/lib/catalog/schema';
import { presentStatus } from '@/lib/catalog/status';

export const StatusBadge = ({ status }: { status: ProductStatus }) => {
  const { label, tone } = presentStatus(status);
  return <Badge tone={tone}>{label}</Badge>;
};
