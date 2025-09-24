import { useEffect, useState } from 'react';

type Country = { name: string; flag: string };

// Lightweight cached hook for countries. Uses sessionStorage to survive page reloads
// and an in-memory singleton to avoid duplicate background fetches in the same session.

let inMemoryCache: Country[] | null = null;
let inFlight: Promise<Country[]> | null = null;

export default function useCountries() {
  const [countries, setCountries] = useState<Country[] | null>(() => {
    if (inMemoryCache) return inMemoryCache;
    try {
      const raw = sessionStorage.getItem('countries');
      if (raw) {
        const parsed = JSON.parse(raw) as Country[];
        inMemoryCache = parsed;
        return parsed;
      }
    } catch (e) {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    if (countries) return; // already have data

    // If there's an in-flight fetch, reuse it
    if (inFlight) {
      inFlight.then(data => setCountries(data)).catch(() => {});
      return;
    }

    inFlight = (async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
        const data = await res.json();
        const mapped: Country[] = data.map((c: any) => ({
          name: c?.name?.common || '',
          flag: c?.flags?.svg || c?.flags?.png || ''
        })).filter((c: Country) => c.name);
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        inMemoryCache = mapped;
        try { sessionStorage.setItem('countries', JSON.stringify(mapped)); } catch (e) { /* ignore */ }
        setCountries(mapped);
        return mapped;
      } catch (err) {
        inMemoryCache = [];
        setCountries([]);
        return [];
      } finally {
        inFlight = null;
      }
    })();

    // no cleanup needed
  }, [countries]);

  return { countries: countries ?? [], loading: countries === null } as const;
}
