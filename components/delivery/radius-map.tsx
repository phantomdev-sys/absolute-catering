import { store, radiusMiles, districts } from '@/content/delivery';
import { milesBetween } from '@/lib/delivery';

/**
 * The 30-mile ring — the site's signature moment.
 *
 * A plain SVG drawn on the server from real coordinates: the store at the
 * centre, the delivery radius as a ring, and the main town in each nearby
 * postcode district placed where it actually is. Pass a `pin` and the
 * customer's own postcode drops onto it, inside or outside the ring.
 *
 * Projection is a local equirectangular one (longitude scaled by cos(latitude)),
 * which is accurate to well under a mile at this size. No map tiles, no
 * third-party requests, nothing to load.
 */

const W = 540;
const H = 420;
const CX = 270;
const CY = 208;
const PX_PER_MILE = 150 / radiusMiles;
const MILES_PER_DEG_LAT = 69.0;
const MILES_PER_DEG_LNG = 69.17 * Math.cos((store.lat * Math.PI) / 180);

function project(lat: number, lng: number) {
  return {
    x: CX + (lng - store.lng) * MILES_PER_DEG_LNG * PX_PER_MILE,
    y: CY - (lat - store.lat) * MILES_PER_DEG_LAT * PX_PER_MILE,
  };
}

// Label side per town, chosen by hand so neighbours don't collide.
// Towns hidden on phones, where the labels are scaled up and these collide.
const MINOR = new Set(['BT94', 'BT75', 'BT93', 'BT69', 'BT92']);

const LABEL: Record<string, 'left' | 'right' | 'above' | 'below'> = {
  BT82: 'left',
  BT81: 'left',
  BT74: 'left',
  BT80: 'right',
  BT70: 'right',
  BT69: 'right',
  BT94: 'above',
  BT93: 'left',
  BT92: 'right',
  BT75: 'right',
  BT48: 'left',
  BT45: 'right',
  BT49: 'right',
  BT61: 'right',
};

type Pin = { lat: number; lng: number; label: string; delivers: boolean };

export function RadiusMap({ pin, className }: { pin?: Pin; className?: string }) {
  const shown = districts.filter((d) => LABEL[d.outcode]);
  const pinPoint = pin ? project(pin.lat, pin.lng) : null;
  // A far-away postcode would fall off the drawing; clamp it to the edge and
  // say so in its label rather than pretending it's nearby.
  const pinOffMap =
    pinPoint && (pinPoint.x < 12 || pinPoint.x > W - 12 || pinPoint.y < 12 || pinPoint.y > H - 12);
  const pinDraw = pinPoint
    ? { x: Math.min(W - 12, Math.max(12, pinPoint.x)), y: Math.min(H - 12, Math.max(12, pinPoint.y)) }
    : null;

  const summary = pin
    ? `Map of our 30-mile delivery area around Omagh. ${pin.label} is ${Math.round(milesBetween(store, pin))} miles away, ${pin.delivers ? 'inside' : 'outside'} the area.`
    : 'Map of our 30-mile delivery area around Omagh, with nearby towns marked.';

  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="h-auto w-full">
        {/* Delivery area */}
        <circle cx={CX} cy={CY} r={150} fill="var(--color-teal-soft)" />
        <circle
          cx={CX}
          cy={CY}
          r={150}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2}
          strokeDasharray="6 6"
        />
        <circle cx={CX} cy={CY} r={75} fill="none" stroke="var(--color-line-strong)" strokeWidth={1} strokeDasharray="2 5" />
        <text x={CX - 150 + 6} y={CY - 4} className="map-label-sm" fill="var(--color-ink-muted)">
          30 miles
        </text>
        <text x={CX - 75 + 6} y={CY - 4} className="map-label-sm" fill="var(--color-ink-muted)">
          15 miles
        </text>

        {/* Towns */}
        {shown.map((d) => {
          const p = project(d.lat, d.lng);
          const inside = d.miles <= radiusMiles;
          const side = LABEL[d.outcode];
          const t =
            side === 'left'
              ? { x: p.x - 8, y: p.y + 4, anchor: 'end' as const }
              : side === 'right'
                ? { x: p.x + 8, y: p.y + 4, anchor: 'start' as const }
                : side === 'above'
                  ? { x: p.x, y: p.y - 9, anchor: 'middle' as const }
                  : { x: p.x, y: p.y + 16, anchor: 'middle' as const };
          return (
            <g key={d.outcode} className={MINOR.has(d.outcode) ? 'map-minor' : undefined}>
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                fill={inside ? 'var(--color-brand)' : 'var(--color-ground)'}
                stroke={inside ? 'var(--color-brand)' : 'var(--color-line-strong)'}
                strokeWidth={1.5}
              />
              <text
                x={t.x}
                y={t.y}
                textAnchor={t.anchor}
                className="map-label"
                fontWeight={inside ? 600 : 400}
                fill={inside ? 'var(--color-ink)' : 'var(--color-ink-muted)'}
              >
                {d.town}
              </text>
            </g>
          );
        })}

        {/* The store */}
        <circle cx={CX} cy={CY} r={9} fill="var(--color-brand)" stroke="var(--color-ground)" strokeWidth={3} />
        <text x={CX} y={CY + 28} textAnchor="middle" className="map-label-lg" fontWeight={700} fill="var(--color-brand)">
          Omagh · our store
        </text>

        {/* The customer's postcode */}
        {pinDraw && pin && (
          <g>
            <path
              d={`M${pinDraw.x} ${pinDraw.y} l-9 -16 a10 10 0 1 1 18 0 z`}
              fill={pin.delivers ? 'var(--color-accent)' : 'var(--color-ink)'}
              stroke="var(--color-ground)"
              strokeWidth={2}
            />
            <circle cx={pinDraw.x} cy={pinDraw.y - 19} r={3.5} fill="var(--color-ground)" />
            <text
              x={pinDraw.x}
              y={pinDraw.y - 34}
              // Near an edge the label grows inwards so it is never clipped.
              textAnchor={pinDraw.x > W - 70 ? 'end' : pinDraw.x < 70 ? 'start' : 'middle'}
              className="map-label-lg"
              fontWeight={700}
              fill="var(--color-ink)"
              stroke="var(--color-ground)"
              strokeWidth={4}
              paintOrder="stroke"
            >
              {pin.label}
              {pinOffMap ? ' (off map)' : ''}
            </text>
          </g>
        )}
      </svg>
      <figcaption className="mt-2 text-xs text-ink-muted">
        Distances are measured in a straight line from our store to the centre of each postcode district.
      </figcaption>
    </figure>
  );
}
