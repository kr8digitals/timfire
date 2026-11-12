export type Enquiry = {
  id: string;
  kind: string;
  name: string;
  email: string;
  answers: Record<string, string>;
  at: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __tfInbox: Enquiry[] | undefined;
}

/**
 * Session inbox shared by the contact route and the admin inbox endpoint.
 * Local by design: it survives normal uptime and clears on redeploy, until the
 * owner connects a database. A transactional email provider remains the
 * guaranteed delivery route — see docs/KNOWN-LIMITATIONS.md.
 */
export function enquiryInbox(): Enquiry[] {
  if (!globalThis.__tfInbox) globalThis.__tfInbox = [];
  return globalThis.__tfInbox;
}
