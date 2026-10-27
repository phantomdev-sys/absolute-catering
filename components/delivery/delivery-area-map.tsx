'use client';

import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { store, radiusMiles } from '@/content/delivery';
import { RadiusMap } from '@/components/delivery/radius-map';

/**
 * The delivery area on a real map: the store, the 30-mile radius drawn as a
 * true circle on the ground, and the customer's postcode dropped as a pin.
 *
 * Decided 26 Oct 2026 (Alex): MapLibre with OpenFreeMap tiles rather than
 * Google Maps. No API key, no billing, no cookies (so no consent banner), and
 * styled in the brand colours. The OpenStreetMap data licence requires a
 * visible credit; it sits as a small line under the legend (26 Oct 2026),
 * not over the map.
 *
 * The SVG ring (RadiusMap) renders first and stays if the map can't load
 * (no WebGL, tiles blocked, JavaScript off), so the page never shows a hole.
 */

type Pin = { lat: number; lng: number; label: string; delivers: boolean };

const STYLE = 'https://tiles.openfreemap.org/styles/positron';
// Map paint needs literal colours, so read the theme tokens at runtime.
const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const KM = radiusMiles * 1.609344;

/** A geodesic circle as a GeoJSON polygon (accurate at any latitude). */
function circleRing(lat: number, lng: number, km: number, steps = 128): [number, number][] {
  const R = 6371.0088;
  const d = km / R;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lng * Math.PI) / 180;
  const ring: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const θ = (i / steps) * 2 * Math.PI;
    const φ2 = Math.asin(Math.sin(φ1) * Math.cos(d) + Math.cos(φ1) * Math.sin(d) * Math.cos(θ));
    const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(d) * Math.cos(φ1), Math.cos(d) - Math.sin(φ1) * Math.sin(φ2));
    ring.push([(λ2 * 180) / Math.PI, (φ2 * 180) / Math.PI]);
  }
  return ring;
}

function markerEl(colour: string, size: number) {
  const el = document.createElement('div');
  el.style.cssText = `width:${size}px;height:${size}px;border-radius:9999px;background:${colour};border:3px solid ${token('--color-ground')};box-shadow:0 1px 4px rgba(0,0,0,.35)`;
  return el;
}

export function DeliveryAreaMap({ pin }: { pin?: Pin }) {
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const live = useRef<{ map: import('maplibre-gl').Map; bounds: import('maplibre-gl').LngLatBounds } | null>(null);

  // The map is built in a hidden box the size of the SVG; once it's shown at
  // full height, resize and refit so the 30-mile circle fills the frame.
  useEffect(() => {
    if (!ready || !live.current) return;
    live.current.map.resize();
    live.current.map.fitBounds(live.current.bounds, { padding: 28, animate: false });
  }, [ready]);

  useEffect(() => {
    let map: import('maplibre-gl').Map | undefined;
    let cancelled = false;

    (async () => {
      try {
        const maplibre = await import('maplibre-gl');
        if (cancelled || !box.current) return;
        // Served from public/ (scripts/copy-maplibre-worker.mjs); MapLibre's own
        // relative worker URL doesn't survive bundling.
        maplibre.setWorkerUrl(`/vendor/maplibre/maplibre-gl-worker-${maplibre.getVersion()}.mjs`);
        const ring = circleRing(store.lat, store.lng, KM);
        const area: GeoJSON.Feature<GeoJSON.Polygon> = {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [ring] },
        };
        const BRAND = token('--color-brand');
        const ACCENT = token('--color-accent');
        const INK = token('--color-ink');
        const TEAL = token('--color-teal');
        const bounds = new maplibre.LngLatBounds(ring[0], ring[0]);
        for (const c of ring) bounds.extend(c);
        if (pin) bounds.extend([pin.lng, pin.lat]);

        map = new maplibre.Map({
          container: box.current,
          style: STYLE,
          bounds,
          fitBoundsOptions: { padding: 28 },
          cooperativeGestures: true,
          // Credit is shown in our own caption below the map (see figcaption),
          // so it can't sit over the map or the legend.
          attributionControl: false,
          dragRotate: false,
          pitchWithRotate: false,
        });
        map.touchZoomRotate.disableRotation();
        map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');

        map.on('error', (e) => {
          // A missing tile is fine; a style that never loads is not.
          if (!map?.isStyleLoaded()) {
            console.warn('[delivery-map]', e.error?.message);
            setFailed(true);
          }
        });

        map.on('load', () => {
          if (!map) return;
          map.addSource('area', { type: 'geojson', data: area });
          map.addLayer({ id: 'area-fill', type: 'fill', source: 'area', paint: { 'fill-color': TEAL, 'fill-opacity': 0.16 } });
          map.addLayer({
            id: 'area-edge',
            type: 'line',
            source: 'area',
            paint: { 'line-color': ACCENT, 'line-width': 2.5, 'line-dasharray': [3, 2] },
          });

          new maplibre.Marker({ element: markerEl(BRAND, 22) })
            .setLngLat([store.lng, store.lat])
            .setPopup(new maplibre.Popup({ offset: 14, closeButton: false }).setText('Absolute Catering Supplies · our store'))
            .addTo(map);

          if (pin) {
            new maplibre.Marker({ color: pin.delivers ? ACCENT : INK })
              .setLngLat([pin.lng, pin.lat])
              .setPopup(
                new maplibre.Popup({ offset: 28, closeButton: false }).setText(
                  `${pin.label}: ${pin.delivers ? 'we deliver here' : 'click & collect'}`,
                ),
              )
              .addTo(map)
              .togglePopup();
          }
          live.current = { map, bounds };
          setReady(true);
        });
      } catch (err) {
        console.warn('[delivery-map]', err);
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      live.current = null;
      map?.remove();
    };
  }, [pin]);

  const summary = pin
    ? `Map of our ${radiusMiles}-mile delivery area around Omagh, with ${pin.label} marked ${pin.delivers ? 'inside' : 'outside'} it.`
    : `Map of our ${radiusMiles}-mile delivery area around our store in Omagh.`;

  return (
    <figure className="relative">
      {/* The SVG version sits underneath until the real map has drawn. */}
      {!ready && <RadiusMap pin={pin} />}
      {!failed && (
        <div
          ref={box}
          role="img"
          aria-label={summary}
          className={
            ready
              ? 'h-[26rem] w-full overflow-hidden rounded-md border border-line md:h-[32rem]'
              : 'pointer-events-none absolute inset-0 opacity-0'
          }
        />
      )}
      {ready && (
        <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="inline-block size-3.5 rounded-full border-2 border-white bg-brand shadow" />
            Our store, Gortrush, Omagh
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-3 w-5 rounded-sm border-2 border-dashed border-accent bg-teal-soft" />
            We deliver within {radiusMiles} miles
          </span>
          {pin && (
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className={`inline-block size-3.5 rounded-full ${pin.delivers ? 'bg-accent' : 'bg-ink'}`} />
              {pin.label}
            </span>
          )}
          <span className="w-full text-xs">
            Map{' '}
            <a href="https://openfreemap.org" className="underline underline-offset-2" rel="noopener" target="_blank">
              OpenFreeMap
            </a>{' '}
            ©{' '}
            <a href="https://www.openmaptiles.org/" className="underline underline-offset-2" rel="noopener" target="_blank">
              OpenMapTiles
            </a>
            , data ©{' '}
            <a href="https://www.openstreetmap.org/copyright" className="underline underline-offset-2" rel="noopener" target="_blank">
              OpenStreetMap contributors
            </a>
          </span>
        </figcaption>
      )}
    </figure>
  );
}
