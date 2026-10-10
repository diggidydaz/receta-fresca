// Phone + PIN sign-in for patients (hotspot H4). Supabase Auth signs a patient in with an address
// made from their phone number, so no text message is sent; the PIN is the password.
// Used on both the browser and the server.

/** Digits only, with the US/Puerto Rico country code: "(787) 555-0101" → "17875550101". Null if not a 10-digit number. */
export function normalizePhone(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return "1" + d;
  if (d.length === 11 && d.startsWith("1")) return d;
  return null;
}

/** The sign-in address for a phone number. ".invalid" is reserved, so it can never reach a real mailbox. */
export const phoneEmail = (phone: string) => `${phone}@phone.receta.invalid`;

/** Six digits: the shortest password Supabase Auth accepts. */
export const PIN_LENGTH = 6;
export const validPin = (pin: string) => new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);

/** "17875550101" → "(787) 555-0101" */
export function formatPhone(phone: string): string {
  const d = phone.replace(/^1/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : phone;
}
