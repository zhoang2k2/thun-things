import { ContactResultPage, contactResultMetadata } from '@/components/forms/ContactResultPage';

export const generateMetadata = () => contactResultMetadata('contactSent');

export default function ContactSentPage() {
  return <ContactResultPage kind="contactSent" />;
}
