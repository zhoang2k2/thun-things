import { ContactResultPage, contactResultMetadata } from '@/components/forms/ContactResultPage';

export const metadata = contactResultMetadata('contactRetry');

export default function ContactRetryPage() {
  return <ContactResultPage kind="contactRetry" />;
}
