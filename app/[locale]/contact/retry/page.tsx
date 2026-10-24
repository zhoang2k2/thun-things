import { ContactResultPage, contactResultMetadata } from '@/components/forms/ContactResultPage';

export const generateMetadata = () => contactResultMetadata('contactRetry');

export default function ContactRetryPage() {
  return <ContactResultPage kind="contactRetry" />;
}
