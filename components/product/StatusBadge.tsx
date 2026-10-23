import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/Badge';
import type { ProductStatus } from '@/lib/catalog/schema';
import { presentStatus } from '@/lib/catalog/status';

export const StatusBadge = ({ status }: { status: ProductStatus }) => {
  const t = useTranslations('product.status');
  const { tone } = presentStatus(status);
  return <Badge tone={tone}>{t(status)}</Badge>;
};
