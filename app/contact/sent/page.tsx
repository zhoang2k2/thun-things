import { ContactResultPage, contactResultMetadata } from '@/components/forms/ContactResultPage';

export const metadata = contactResultMetadata('contactSent');

export default function ContactSentPage() {
  return <ContactResultPage kind="contactSent" />;
}
