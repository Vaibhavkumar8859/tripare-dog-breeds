import type { Breed, Group } from './types';

const BASE = process.env.EXPO_PUBLIC_DOG_API_BASE ?? 'https://dogapi.dog/api/v2';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${url}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Fetch all 283 breeds by parallel requests to the 6 paginated pages (48/page).
 * Intelligent merge into a single flat array.
 */
export async function fetchAllBreeds(): Promise<Breed[]> {
  const pagePromises = Array.from({ length: 6 }, (_, i) =>
    fetchJson<{ data: Breed[] }>(
      `${BASE}/breeds?page[number]=${i + 1}&page[size]=48`
    )
  );

  const pages = await Promise.all(pagePromises);
  const breeds = pages.flatMap((p) => p.data);

  // Deduplicate by id just in case of overlapping pages
  const seen = new Set<string>();
  return breeds.filter((b) => {
    if (seen.has(b.id)) return false;
    seen.add(b.id);
    return true;
  });
}

export async function fetchGroups(): Promise<Group[]> {
  const json = await fetchJson<{ data: Group[] }>(`${BASE}/groups`);
  return json.data;
}

export async function fetchBreedById(id: string): Promise<Breed> {
  const json = await fetchJson<{ data: Breed }>(`${BASE}/breeds/${id}`);
  return json.data;
}

/** Simple exponential backoff retry wrapper */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 400
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts) break;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}
