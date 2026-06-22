import { ContactRequest } from './contact.model.js';
import type { ContactInput } from './contact.schema.js';

export async function submitContact(input: ContactInput) {
  const contact = await ContactRequest.create(input);
  return contact;
}
