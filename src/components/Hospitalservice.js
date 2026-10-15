
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export const SEARCH_RADII_M = [5000, 15000, 30000];

const MAX_RESULTS = 60;
const REQUEST_TIMEOUT_MS = 30000;
const EARTH_RADIUS_M = 6371000;

export class HospitalServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'HospitalServiceError';
    this.code = code;
  }
}

export function haversineMeters(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M *
    Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(meters) {
  if (!Number.isFinite(meters)) return 'Distance unavailable';

  const rounded = Math.round(meters);
  if (rounded < 1000) return `${rounded} m`;

  const km = meters / 1000;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

function buildQuery(lat, lng, radius) {
  const around = `(around:${radius},${lat},${lng})`;

  return `[out:json][timeout:25];
(
  nwr["amenity"="hospital"]${around};
  nwr["healthcare"="hospital"]${around};
  nwr["amenity"="clinic"]${around};
  nwr["healthcare"="clinic"]${around};
  nwr["emergency"="yes"]${around};
);
out center tags;`;
}

async function queryEndpoint(endpoint, query, outerSignal) {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  const onAbort = () => controller.abort();
  outerSignal?.addEventListener('abort', onAbort);

  try {
    let response;

    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: 'data=' + encodeURIComponent(query),
        signal: controller.signal,
      });
    } catch (error) {
      if (outerSignal?.aborted) throw error;

      if (controller.signal.aborted) {
        throw new HospitalServiceError(
          'server',
          'The hospital search timed out.'
        );
      }

      throw new HospitalServiceError(
        'network',
        'Could not reach the hospital data service.'
      );
    }

    if (response.status === 429) {
      throw new HospitalServiceError(
        'rate_limit',
        'The hospital data service is busy.'
      );
    }

    if (!response.ok) {
      throw new HospitalServiceError(
        'server',
        `Hospital service returned ${response.status}.`
      );
    }

    const json = await response.json();

    if (!Array.isArray(json.elements)) {
      throw new HospitalServiceError(
        'server',
        'Invalid hospital data received.'
      );
    }

    if (
      json.remark &&
      /timed out|out of memory/i.test(json.remark) &&
      json.elements.length === 0
    ) {
      throw new HospitalServiceError(
        'server',
        'The hospital search timed out.'
      );
    }

    return json.elements;
  } finally {
    clearTimeout(timer);
    outerSignal?.removeEventListener('abort', onAbort);
  }
}

async function queryOverpass(query, signal) {
  let lastError;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      return await queryEndpoint(endpoint, query, signal);
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
    }
  }

  throw lastError;
}

function classify(tags) {
  if (
    tags.amenity === 'hospital' ||
    tags.healthcare === 'hospital'
  ) {
    return { kind: 'hospital', kindLabel: 'Hospital' };
  }

  if (
    tags.amenity === 'clinic' ||
    tags.healthcare === 'clinic'
  ) {
    return { kind: 'clinic', kindLabel: 'Clinic' };
  }

  return {
    kind: 'emergency',
    kindLabel: 'Emergency facility',
  };
}

function classifyOwnership(tags) {
  const values = [
    tags['operator:type'],
    tags.ownership,
    tags.operator,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    /\b(government|governmental|public|municipal)\b/.test(values)
  ) {
    return 'government';
  }

  if (/\b(private|corporate)\b/.test(values)) {
    return 'private';
  }

  return 'unknown';
}

function buildAddress(tags) {
  if (tags['addr:full']) return tags['addr:full'];

  const street = [
    tags['addr:housenumber'],
    tags['addr:street'],
  ].filter(Boolean).join(' ');

  const parts = [
    street,
    tags['addr:suburb'] || tags['addr:neighbourhood'],
    tags['addr:city'] ||
      tags['addr:town'] ||
      tags['addr:village'] ||
      tags['addr:district'],
    tags['addr:state'],
    tags['addr:postcode'],
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : null;
}

export function parseElements(elements, origin) {
  const seen = new Set();
  const facilities = [];

  for (const element of elements) {
    const tags = element.tags || {};
    const lat = element.lat ?? element.center?.lat;
    const lng = element.lon ?? element.center?.lon;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const id = `${element.type}/${element.id}`;

    if (seen.has(id)) continue;
    seen.add(id);

    const { kind, kindLabel } = classify(tags);

    facilities.push({
      id,
      name:
        tags.name ||
        tags['name:en'] ||
        'Unnamed medical facility',
      kind,
      kindLabel,
      hospitalType: classifyOwnership(tags),
      lat,
      lng,
      address: buildAddress(tags),
      phone: tags.phone || tags['contact:phone'] || null,
      openingHours: tags.opening_hours || null,
      emergency: tags.emergency || null,
      distanceMeters: haversineMeters(origin, { lat, lng }),
    });
  }

  facilities.sort(
    (a, b) =>
      a.distanceMeters - b.distanceMeters ||
      a.name.localeCompare(b.name)
  );

  return facilities;
}

export async function searchNearbyFacilities({
  lat,
  lng,
  signal,
  onRadius,
}) {
  const origin = { lat, lng };
  let radiusM = SEARCH_RADII_M[0];

  for (const radius of SEARCH_RADII_M) {
    if (signal?.aborted) {
      throw new DOMException('Search cancelled', 'AbortError');
    }

    radiusM = radius;
    onRadius?.(radius);

    const elements = await queryOverpass(
      buildQuery(lat, lng, radius),
      signal
    );

    const facilities = parseElements(elements, origin);

    if (facilities.length > 0) {
      return {
        facilities: facilities.slice(0, MAX_RESULTS),
        radiusM,
      };
    }
  }

  return { facilities: [], radiusM };
}

export function buildDirectionsUrl({
  facility,
  origin,
  mode = 'driving',
}) {
  const params = new URLSearchParams();
  params.set('api', '1');

  if (
    origin &&
    Number.isFinite(origin.lat) &&
    Number.isFinite(origin.lng)
  ) {
    params.set(
      'origin',
      `${origin.lat},${origin.lng}`
    );
  }

  params.set(
    'destination',
    `${facility.lat},${facility.lng}`
  );

  params.set(
    'travelmode',
    mode === 'walking' ? 'walking' : 'driving'
  );

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function buildFallbackSearchUrl() {
  return (
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('hospitals near me')
  );
}

export function buildHospitalLocationUrl(facility) {
  const query = [
    facility.name,
    facility.address,
  ].filter(Boolean).join(', ');

  return (
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(query)
  );
}
