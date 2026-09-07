import { supabase } from "./supabase";

export function parseAo3WorkId(input) {
  try {
    const url = new URL(input);
    if (!["archiveofourown.org", "www.archiveofourown.org"].includes(url.hostname.toLowerCase())) return null;
    return url.pathname.match(/^\/works\/(\d+)/)?.[1] || null;
  } catch {
    return null;
  }
}

export async function fetchAo3Work(url) {
  if (!parseAo3WorkId(url)) throw new Error("Paste a direct archiveofourown.org work URL.");
  if (!supabase) throw new Error("Sign-in is required to import AO3 works.");

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Your session has expired. Sign in again.");

  const response = await fetch("/api/ao3-work", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ url })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Unable to import AO3 work.");
  return data;
}
