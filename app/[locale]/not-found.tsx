import { NotFoundState, notFoundMetadata } from '@/components/layout/NotFoundState';

export const generateMetadata = notFoundMetadata;

export default function NotFound() {
  return <NotFoundState />;
}
