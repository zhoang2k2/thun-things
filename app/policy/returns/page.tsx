import { PolicyPage, policyMetadata } from '@/components/policy/PolicyPage';

// Static routes (not /policy/[slug]): with Partial Prerendering a dynamic segment
// streams a 200 before notFound() runs, so unknown slugs would not get a real 404.
export const metadata = policyMetadata('returns');

export default function ReturnsPolicyPage() {
  return <PolicyPage slug="returns" />;
}
