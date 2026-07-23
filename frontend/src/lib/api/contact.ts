import { api } from "../api";

export async function submitContact(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return api.post("/contact", payload);
}
