export type Enquiry = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  at: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __tfInbox: Enquiry[] | undefined;
}

/** Session inbox shared by the contact route and the admin inbox endpoint. */
export function enquiryInbox(): Enquiry[] {
  if (!globalThis.__tfInbox) globalThis.__tfInbox = [];
  return globalThis.__tfInbox;
}
