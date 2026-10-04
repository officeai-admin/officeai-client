const ENDPOINT = "https://api.staticforms.dev/submit";
const API_KEY = import.meta.env.VITE_STATICFORMS_API_KEY;

export interface StaticFormFields {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

/** False until VITE_STATICFORMS_API_KEY is set in .env. */
export const isStaticFormsConfigured = Boolean(API_KEY);

/**
 * Sends one form submission to StaticForms, which emails it to the owner of the API key.
 * Any form on the site can use this. Rejects with the reason when the submission is not accepted.
 */
export async function submitStaticForm(fields: StaticFormFields): Promise<void> {
  if (!API_KEY) {
    throw new Error("VITE_STATICFORMS_API_KEY is not set, so the form has nowhere to send to.");
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ apiKey: API_KEY, ...fields }),
  });

  // StaticForms answers with JSON: { success: true } or { success: false, error: "..." }.
  let result: { success?: boolean; error?: string; message?: string } | null = null;
  try {
    result = await response.json();
  } catch {
    // not JSON: fall back to the HTTP status below
  }

  const accepted = result ? result.success === true : response.ok;
  if (!accepted) {
    throw new Error(result?.error ?? result?.message ?? `StaticForms answered ${response.status}`);
  }
}
