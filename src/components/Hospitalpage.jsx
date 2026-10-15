
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse, ArrowLeft, LocateFixed, MapPin, Navigation,
  Phone, Clock, RefreshCw, AlertTriangle, Hospital,
  Stethoscope, Car, Footprints, Landmark, Building2,
  Ambulance, ShieldCheck, ExternalLink, WifiOff,
} from 'lucide-react';

import {
  searchNearbyFacilities,
  buildDirectionsUrl,
  buildFallbackSearchUrl,
  buildHospitalLocationUrl,
  formatDistance,
} from '../lib/hospitalService';

import './HospitalsPage.css';

const CATEGORIES = [
  { id: 'all', label: 'All Facilities', icon: Hospital },
  { id: 'government', label: 'Government Hospitals', icon: Landmark },
  { id: 'private', label: 'Private Hospitals', icon: Building2 },
  { id: 'clinic', label: 'Clinics', icon: Stethoscope },
  { id: 'emergency', label: 'Emergency Care', icon: Ambulance },
];

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!window.isSecureContext) {
      reject({
        kind: 'location',
        code: 'insecure',
      });
      return;
    }

    if (!navigator.geolocation) {
      reject({
        kind: 'location',
        code: 'unsupported',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      }),
      (error) => reject({
        kind: 'location',
        code:
          error.code === 1 ? 'denied' :
          error.code === 3 ? 'timeout' : 'unavailable',
      }),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

function filterFacilities(facilities, category) {
  if (category === 'all') return facilities;

  if (category === 'government' || category === 'private') {
    return facilities.filter(
      (facility) =>
        facility.kind === 'hospital' &&
        facility.hospitalType === category
    );
  }

  if (category === 'clinic') {
    return facilities.filter(
      (facility) => facility.kind === 'clinic'
    );
  }

  if (category === 'emergency') {
    return facilities.filter(
      (facility) =>
        facility.kind === 'emergency' ||
        facility.emergency === 'yes'
    );
  }

  return facilities;
}

function getErrorMessage(error) {
  if (error?.kind === 'location') {
    const messages = {
      denied: 'Location permission denied. Allow location access in your browser settings.',
      timeout: 'Finding your location took too long. Please try again.',
      unsupported: 'Your browser does not support location access.',
      unavailable: 'Your device could not determine your location. Check location services.',
      insecure: 'Location requires HTTPS or localhost.',
    };

    return messages[error.code] || messages.unavailable;
  }

  if (error?.code === 'network') {
    return 'Could not connect to the hospital data service. Check your internet.';
  }

  if (error?.code === 'rate_limit') {
    return 'The hospital data service is busy. Please wait and try again.';
  }

  return 'The hospital search failed. Please try again.';
}

function HospitalCard({ facility, origin, mode }) {
  const Icon =
    facility.kind === 'clinic'
      ? Stethoscope
      : facility.kind === 'emergency'
        ? Ambulance
        : Hospital;

  const ownership =
    facility.kind !== 'hospital'
      ? facility.kindLabel
      : facility.hospitalType === 'government'
        ? 'Government hospital'
        : facility.hospitalType === 'private'
          ? 'Private hospital'
          : 'Ownership not listed';

  const directionsUrl = buildDirectionsUrl({
    facility,
    origin,
    mode,
  });

  const locationUrl = buildHospitalLocationUrl(facility);

  return (
    <article className="ss-hosp-card">
      <div className={`ss-hosp-card-icon ${facility.kind}`}>
        <Icon size={24} />
      </div>

      <div className="ss-hosp-card-body">
        <span className="ss-hosp-type">{ownership}</span>

        <h3>{facility.name}</h3>

        <p className="ss-hosp-address">
          <MapPin size={16} />
          <span>
            {facility.address || 'Address not listed in map data'}
          </span>
        </p>

        <div className="ss-hosp-details">
          <span>
            <Navigation size={15} />
            {formatDistance(facility.distanceMeters)} away
          </span>

          {facility.phone && (
            <a href={`tel:${facility.phone.split(/[;,]/)[0].trim()}`}>
              <Phone size={15} /> Call
            </a>
          )}

          {facility.openingHours && (
            <span>
              <Clock size={15} />
              {facility.openingHours}
            </span>
          )}
        </div>

        {facility.emergency === 'yes' && (
          <p className="ss-hosp-emergency-tag">
            <ShieldCheck size={14} />
            Listed as providing emergency services
          </p>
        )}

        <p className="ss-hosp-disclaimer">
          Community-maintained map data may be incomplete or outdated.
          Please verify details before travelling.
        </p>
      </div>

      <div className="ss-hosp-card-actions">
        <span className="ss-hosp-distance">
          {formatDistance(facility.distanceMeters)}
        </span>

        <a
          className="ss-hosp-directions"
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Navigation size={16} />
          Get Directions
        </a>

        <a
          className="ss-hosp-location-link"
          href={locationUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MapPin size={16} />
          Get Location
          <ExternalLink size={13} />
        </a>
      </div>
    </article>
  );
}

export default function HospitalsPage() {
  const [status, setStatus] = useState('idle');
  const [origin, setOrigin] = useState(null);
  const [result, setResult] = useState(null);
  const [category, setCategory] = useState('all');
  const [mode, setMode] = useState('driving');
  const [errorMessage, setErrorMessage] = useState('');
  const [radiusTrying, setRadiusTrying] = useState(5000);

  const busyRef = useRef(false);
  const abortRef = useRef(null);
  const originRef = useRef(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const busy = status === 'locating' || status === 'searching';
  const facilities = result?.facilities || [];
  const filtered = filterFacilities(facilities, category);

  async function findHospitals() {
    if (busyRef.current) return;

    busyRef.current = true;
    setErrorMessage('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let location = originRef.current;

      if (!location) {
        setStatus('locating');
        location = await getCurrentPosition();

        if (controller.signal.aborted) return;

        originRef.current = location;
        setOrigin(location);
      }

      setStatus('searching');

      const data = await searchNearbyFacilities({
        lat: location.lat,
        lng: location.lng,
        signal: controller.signal,
        onRadius: setRadiusTrying,
      });

      if (controller.signal.aborted) return;

      setResult(data);
      setCategory('all');
      setStatus('done');
    } catch (error) {
      if (controller.signal.aborted) return;

      setErrorMessage(getErrorMessage(error));
      setStatus('error');
    } finally {
      busyRef.current = false;
    }
  }

  return (
    <div className="ss-hosp">
      <header className="ss-hosp-header">
        <div className="ss-hosp-header-inner">
          <Link to="/dashboard" className="ss-hosp-brand">
            <span className="ss-hosp-brand-mark">
              <HeartPulse size={23} />
            </span>
            <span>Sehat <b>Saathi</b></span>
          </Link>

          <Link to="/dashboard" className="ss-hosp-back">
            <ArrowLeft size={17} /> Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="ss-hosp-main">
        <section className="ss-hosp-hero">
          <span className="ss-hosp-overline">CARE NEAR YOU</span>
          <h1>Find the right care, closer to home.</h1>
          <p>
            Discover nearby government hospitals, private hospitals,
            clinics and emergency facilities.
          </p>
        </section>

        <div className="ss-hosp-emergency-notice">
          <AlertTriangle size={21} />
          <p>
            <b>Medical emergency?</b> Call your local emergency number.
            In India, dial <strong>112</strong>. Do not wait for this search.
          </p>
        </div>

        <section className="ss-hosp-search-box">
          <div className="ss-hosp-search-icon">
            <LocateFixed size={27} />
          </div>

          <div className="ss-hosp-search-copy">
            <h2>Hospitals around you</h2>
            <p>
              {status === 'locating'
                ? 'Waiting for location permission…'
                : status === 'searching'
                  ? `Searching within ${radiusTrying / 1000} km…`
                  : origin
                    ? 'Using your current location.'
                    : 'Share your location to find nearby medical facilities.'}
            </p>
            <small>
              Your location is used for this search and is not saved
              to your account by this page.
            </small>
          </div>

          <button
            className="ss-hosp-find"
            type="button"
            onClick={findHospitals}
            disabled={busy}
          >
            {busy ? (
              <>
                <span className="ss-hosp-spinner" />
                {status === 'locating' ? 'Locating…' : 'Searching…'}
              </>
            ) : (
              <>
                {origin ? <RefreshCw size={18} /> : <LocateFixed size={18} />}
                {origin ? 'Search Again' : 'Find Hospitals'}
              </>
            )}
          </button>
        </section>

        {status === 'idle' && (
          <section className="ss-hosp-info-panel">
            <h2>How it works</h2>
            <div className="ss-hosp-info-steps">
              <div><span>1</span><p>Share your current location.</p></div>
              <div><span>2</span><p>Choose a hospital category.</p></div>
              <div><span>3</span><p>Open its location or route in Google Maps.</p></div>
            </div>
          </section>
        )}

        {busy && (
          <section className="ss-hosp-state-panel">
            <span className="ss-hosp-spinner ss-hosp-spinner-large" />
            <h2>
              {status === 'locating'
                ? 'Finding your location'
                : 'Finding medical facilities'}
            </h2>
            <p>
              {status === 'locating'
                ? 'Allow location access when your browser asks.'
                : 'Searching available map data…'}
            </p>
          </section>
        )}

        {status === 'error' && (
          <section className="ss-hosp-state-panel ss-hosp-error-panel">
            <WifiOff size={30} />
            <h2>We couldn't complete the search</h2>
            <p>{errorMessage}</p>

            <button
              className="ss-hosp-find"
              type="button"
              onClick={findHospitals}
            >
              <RefreshCw size={17} /> Try Again
            </button>

            <a
              href={buildFallbackSearchUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="ss-hosp-location-link"
            >
              Search Google Maps instead <ExternalLink size={14} />
            </a>
          </section>
        )}

        {status === 'done' && (
          <>
            <section className="ss-hosp-category-section">
              <span className="ss-hosp-overline">CHOOSE YOUR CARE</span>
              <h2>What type of facility do you need?</h2>

              <div className="ss-hosp-categories">
                {CATEGORIES.map((item) => {
                  const Icon = item.icon;
                  const count = filterFacilities(facilities, item.id).length;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`ss-hosp-category ${
                        category === item.id ? 'is-active' : ''
                      }`}
                      onClick={() => setCategory(item.id)}
                      aria-pressed={category === item.id}
                    >
                      <span className="ss-hosp-category-icon">
                        <Icon size={22} />
                      </span>

                      <span className="ss-hosp-category-label">
                        {item.label}
                        <small>
                          {count} {count === 1 ? 'facility' : 'facilities'}
                        </small>
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="ss-hosp-category-note">
                Government and private labels depend on ownership tags in
                map data. Unclassified hospitals appear under All Facilities.
              </p>
            </section>

            <section className="ss-hosp-results">
              <div className="ss-hosp-results-header">
                <div>
                  <span className="ss-hosp-overline">NEAR YOUR LOCATION</span>
                  <h2>
                    {CATEGORIES.find((item) => item.id === category)?.label}
                  </h2>
                  <p>
                    {filtered.length} matching facilities. Distances are
                    straight-line estimates, not road distances.
                  </p>
                </div>

                <div className="ss-hosp-mode">
                  <button
                    type="button"
                    className={mode === 'driving' ? 'is-active' : ''}
                    aria-pressed={mode === 'driving'}
                    onClick={() => setMode('driving')}
                  >
                    <Car size={16} /> Driving
                  </button>

                  <button
                    type="button"
                    className={mode === 'walking' ? 'is-active' : ''}
                    aria-pressed={mode === 'walking'}
                    onClick={() => setMode('walking')}
                  >
                    <Footprints size={16} /> Walking
                  </button>
                </div>
              </div>

              {origin?.accuracy > 1000 && (
                <p className="ss-hosp-accuracy">
                  <AlertTriangle size={16} />
                  Your device reported an approximate location.
                </p>
              )}

              {filtered.length > 0 ? (
                <div className="ss-hosp-list">
                  {filtered.map((facility) => (
                    <HospitalCard
                      key={facility.id}
                      facility={facility}
                      origin={origin}
                      mode={mode}
                    />
                  ))}
                </div>
              ) : (
                <div className="ss-hosp-state-panel">
                  <MapPin size={30} />
                  <h2>No matching facilities found</h2>
                  <p>
                    Map data may not contain facilities in this category.
                    Try All Facilities or search Google Maps.
                  </p>

                  <button
                    className="ss-hosp-find"
                    type="button"
                    onClick={() => setCategory('all')}
                  >
                    Show All Facilities
                  </button>

                  <a
                    className="ss-hosp-location-link"
                    href={buildFallbackSearchUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Search Google Maps <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </section>
          </>
        )}

        <footer className="ss-hosp-footer">
          Facility data ©{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenStreetMap contributors
          </a>.
          Listings may be incomplete or outdated. Call ahead when possible.
          Do not rely on this page for emergencies.
        </footer>
      </main>
    </div>
  );
}
