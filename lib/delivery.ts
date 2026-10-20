import { store, radiusMiles } from '@/content/delivery';

/**
 * Delivery eligibility: straight-line distance from the store to a postcode.
 *
 * Runs on the server only. The browser never decides eligibility — at checkout
 * the same function re-checks the address, so a hand-edited request can't book
 * a delivery slot outside the radius.
 */

export type DeliveryCheck =
  | { kind: 'empty' }
  | { kind: 'invalid'; input: string }
  | { kind: 'not-found'; postcode: string }
  | { kind: 'unavailable'; postcode: string }
  | {
      kind: 'ok';
      postcode: string;
      lat: number;
      lng: number;
      miles: number;
      delivers: boolean;
      district: string | null;
    };

// The UK format, loosely: outward code + inward code. postcodes.io is the
// authority; this only stops obvious nonsense being sent to it.
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/;

export function normalisePostcode(raw: string): string {
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return compact.length > 3 ? `${compact.slice(0, -3)} ${compact.slice(-3)}` : compact;
}

export function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 3958.8 * Math.asin(Math.sqrt(h));
}

export async function checkPostcode(raw: string | undefined): Promise<DeliveryCheck> {
  if (!raw || !raw.trim()) return { kind: 'empty' };
  const postcode = normalisePostcode(raw);
  if (!UK_POSTCODE.test(postcode)) return { kind: 'invalid', input: raw.trim().slice(0, 12) };

  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`, {
      // Postcodes don't move; a day's cache keeps us well inside the API's limits.
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.status === 404) return { kind: 'not-found', postcode };
    if (!res.ok) return { kind: 'unavailable', postcode };
    const body = (await res.json()) as {
      result: { latitude: number | null; longitude: number | null; admin_district: string | null };
    };
    const { latitude, longitude, admin_district } = body.result;
    // Some valid postcodes (PO boxes, new builds) have no coordinates yet.
    if (latitude == null || longitude == null) return { kind: 'unavailable', postcode };
    const miles = milesBetween(store, { lat: latitude, lng: longitude });
    return {
      kind: 'ok',
      postcode,
      lat: latitude,
      lng: longitude,
      miles: Math.round(miles * 10) / 10,
      delivers: miles <= radiusMiles,
      district: admin_district,
    };
  } catch {
    return { kind: 'unavailable', postcode };
  }
}
