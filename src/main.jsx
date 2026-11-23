import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Geolocation } from '@capacitor/geolocation';
import { Camera as NativeCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Network } from '@capacitor/network';
import { Share } from '@capacitor/share';
import {
  ArrowRight, BadgeDollarSign, Building2, Camera, Check, ChevronDown, CircleHelp, Compass,
  Crosshair, FileText, Hammer, MapPin, Menu, Plus, Ruler, Save, ScanLine, Search,
  Settings2, ShieldCheck, Sparkles, Trash2, UserRound, X
} from 'lucide-react';
import './styles.css';

const APP_VERSION = '1.2.0';

const defaultCatalog = {
  shingle: [
    { id: 'owens-duration', brand: 'Owens Corning', name: 'Duration® Architectural', color: 'Estate Gray', packSize: 3, unit: 'bundle', price: 39.98 },
    { id: 'owens-duration-flex', brand: 'Owens Corning', name: 'Duration FLEX®', color: 'Onyx Black', packSize: 3, unit: 'bundle', price: 43.98 },
    { id: 'owens-trudefinition', brand: 'Owens Corning', name: 'Oakridge® TruDefinition®', color: 'Driftwood', packSize: 3, unit: 'bundle', price: 34.98 },
    { id: 'owens-sure-nail', brand: 'Owens Corning', name: 'Supreme®', color: 'Brownwood', packSize: 3, unit: 'bundle', price: 29.98 },
    { id: 'gaf-hdz', brand: 'GAF', name: 'Timberline HDZ®', color: 'Charcoal', packSize: 3, unit: 'bundle', price: 37.5 },
    { id: 'gaf-hdz-rs', brand: 'GAF', name: 'Timberline HDZ® RS', color: 'Weathered Wood', packSize: 3, unit: 'bundle', price: 39.5 },
    { id: 'gaf-solaris', brand: 'GAF', name: 'Timberline® UHDZ with Solaris', color: 'Charcoal', packSize: 3, unit: 'bundle', price: 49.5 },
    { id: 'gaf-royal-sovereign', brand: 'GAF', name: 'Royal Sovereign®', color: 'Slate', packSize: 3, unit: 'bundle', price: 26.5 },
    { id: 'certainteed-landmark', brand: 'CertainTeed', name: 'Landmark® Pro', color: 'Weathered Wood', packSize: 3, unit: 'bundle', price: 44.25 },
    { id: 'certainteed-landmark-sbd', brand: 'CertainTeed', name: 'Landmark®', color: 'Moire Black', packSize: 3, unit: 'bundle', price: 37.25 },
    { id: 'tamko-titan', brand: 'TAMKO', name: 'Titan XT®', color: 'Weathered Wood', packSize: 3, unit: 'bundle', price: 41.5 },
    { id: 'tamko-heritage', brand: 'TAMKO', name: 'Heritage®', color: 'Black Walnut', packSize: 3, unit: 'bundle', price: 33.5 },
    { id: 'iko-cambridge', brand: 'IKO', name: 'Cambridge®', color: 'Dual Black', packSize: 3, unit: 'bundle', price: 35.75 },
    { id: 'iko-dynasty', brand: 'IKO', name: 'Dynasty®', color: 'Summit Grey', packSize: 3, unit: 'bundle', price: 43.75 },
    { id: 'atlas-pinnacle', brand: 'Atlas', name: 'Pinnacle® Pristine', color: 'Heathered Black', packSize: 3, unit: 'bundle', price: 40.25 },
    { id: 'malarkey-warranty', brand: 'Malarkey', name: 'Vista® AR', color: 'Natural Wood', packSize: 3, unit: 'bundle', price: 42.5 },
    { id: 'bp-yukon', brand: 'BP', name: 'Yukon® SB', color: 'Charcoal', packSize: 3, unit: 'bundle', price: 36.75 },
  ],
  underlayment: [
    { id: 'synthetic', name: 'Synthetic underlayment', detail: '10 squares / roll', coverage: 10, unit: 'roll', price: 74.95 },
    { id: 'gaf-tiger-paw', brand: 'GAF', name: 'Tiger Paw®', detail: '10 squares / roll', coverage: 10, unit: 'roll', price: 79.95 },
    { id: 'owens-rhino-yth', brand: 'Owens Corning', name: 'RhinoRoof® U20', detail: '10 squares / roll', coverage: 10, unit: 'roll', price: 84.95 },
    { id: 'certainteed-flintlastic', brand: 'CertainTeed', name: 'Flintlastic® SA', detail: '10 squares / roll', coverage: 10, unit: 'roll', price: 89.95 },
    { id: 'tamko-pro', brand: 'TAMKO', name: 'Titanium® PSU30', detail: '10 squares / roll', coverage: 10, unit: 'roll', price: 82.95 },
    { id: 'felt', name: '15 lb felt', detail: '4 squares / roll', coverage: 4, unit: 'roll', price: 32.5 },
    { id: 'felt-30', name: '30 lb felt', detail: '2 squares / roll', coverage: 2, unit: 'roll', price: 48.5 },
  ],
  ice: [
    { id: 'ice-standard', name: 'Ice & water shield', detail: '2 squares / roll', coverage: 2, unit: 'roll', price: 69.95 },
    { id: 'gaf-weatherwatch', brand: 'GAF', name: 'WeatherWatch®', detail: '2 squares / roll', coverage: 2, unit: 'roll', price: 74.95 },
    { id: 'gaf-leak-barrier', brand: 'GAF', name: 'Leak Barrier', detail: '2 squares / roll', coverage: 2, unit: 'roll', price: 81.95 },
    { id: 'owens-weatherlock', brand: 'Owens Corning', name: 'WeatherLock® Self-Seal', detail: '2 squares / roll', coverage: 2, unit: 'roll', price: 78.95 },
    { id: 'certainteed-winterguard', brand: 'CertainTeed', name: 'WinterGuard®', detail: '2 squares / roll', coverage: 2, unit: 'roll', price: 77.95 },
    { id: 'ice-premium', name: 'High-temp ice & water shield', detail: '2 squares / roll', coverage: 2, unit: 'roll', price: 91.25 },
  ],
  ridge: [
    { id: 'ridge-hip', name: 'Hip & ridge cap shingles', detail: '30 linear ft / bundle', coverage: 30, unit: 'bundle', price: 58.5 },
    { id: 'gaf-pro', brand: 'GAF', name: 'Pro-Start® / TimberTex®', detail: '20 linear ft / bundle', coverage: 20, unit: 'bundle', price: 62.5 },
    { id: 'owens-proedge', brand: 'Owens Corning', name: 'ProEdge® Ridge', detail: '35 linear ft / bundle', coverage: 35, unit: 'bundle', price: 64.5 },
    { id: 'certainteed-shadow', brand: 'CertainTeed', name: 'Shadow Ridge®', detail: '30 linear ft / bundle', coverage: 30, unit: 'bundle', price: 66.5 },
    { id: 'tamko-ridge', brand: 'TAMKO', name: 'MTX® hip & ridge', detail: '30 linear ft / bundle', coverage: 30, unit: 'bundle', price: 60.5 },
    { id: 'ridge-caps', name: 'High-profile ridge caps', detail: '25 linear ft / bundle', coverage: 25, unit: 'bundle', price: 72 },
  ],
  starter: [
    { id: 'starter-gaf', brand: 'GAF', name: 'WeatherBlocker® Starter', detail: '120 linear ft / bundle', coverage: 120, unit: 'bundle', price: 48.5 },
    { id: 'starter-owens', brand: 'Owens Corning', name: 'Starter Strip Plus', detail: '105 linear ft / bundle', coverage: 105, unit: 'bundle', price: 46.5 },
    { id: 'starter-certainteed', brand: 'CertainTeed', name: 'SwiftStart®', detail: '120 linear ft / bundle', coverage: 120, unit: 'bundle', price: 51.5 },
    { id: 'starter-universal', name: 'Universal starter strip', detail: '120 linear ft / bundle', coverage: 120, unit: 'bundle', price: 42.5 },
  ],
  flashing: [
    { id: 'drip-edge-galvanized', name: 'Galvanized drip edge — 5"', detail: '10 ft piece', coverage: 10, unit: 'piece', price: 8.95 },
    { id: 'drip-edge-aluminum', name: 'Aluminum drip edge — 5"', detail: '10 ft piece', coverage: 10, unit: 'piece', price: 12.95 },
    { id: 'step-flashing', name: 'Step flashing — 2" × 3" × 7"', detail: '10 pcs / bundle', coverage: 10, unit: 'bundle', price: 29.95 },
    { id: 'valley-aluminum', name: 'Aluminum valley flashing — 24"', detail: '10 ft piece', coverage: 10, unit: 'piece', price: 38.95 },
    { id: 'valley-woven', name: 'Woven valley membrane', detail: '75 ft roll', coverage: 75, unit: 'roll', price: 129.95 },
  ],
  fasteners: [
    { id: 'nails-coil', name: '1¼" roofing coil nails', detail: '7,200 nails / carton', coverage: 7200, unit: 'carton', price: 74.95 },
    { id: 'nails-coil-15', name: '1½" roofing coil nails', detail: '7,200 nails / carton', coverage: 7200, unit: 'carton', price: 79.95 },
    { id: 'staples', name: 'Underlayment staples', detail: '5,000 pcs / box', coverage: 5000, unit: 'box', price: 44.95 },
  ],
  ventilation: [
    { id: 'ridge-vent-12', name: '12" shingle-over ridge vent', detail: '4 ft section', coverage: 4, unit: 'section', price: 24.95 },
    { id: 'ridge-vent-9', name: '9" shingle-over ridge vent', detail: '4 ft section', coverage: 4, unit: 'section', price: 19.95 },
    { id: 'box-vent', name: 'Aluminum box vent', detail: 'Per vent', coverage: 1, unit: 'vent', price: 18.95 },
    { id: 'turtle-vent', name: 'Turtle vent', detail: 'Per vent', coverage: 1, unit: 'vent', price: 21.95 },
  ],
};

const newEstimate = () => ({
  id: `job-${Date.now()}`,
  customer: '',
  phone: '',
  address: '',
  status: 'draft',
  updatedAt: new Date().toISOString(),
  measurementMode: 'property',
  propertyLoaded: false,
  planes: [],
  waste: 12,
  tearOff: 0,
  disposal: 0,
  permit: 0,
  laborRate: 165,
  markup: 15,
  tax: 0,
  selected: {
    shingle: defaultCatalog.shingle[0].id,
    underlayment: defaultCatalog.underlayment[0].id,
    ice: defaultCatalog.ice[0].id,
    ridge: defaultCatalog.ridge[0].id,
  },
});

const money = (value) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const quantity = (value) => Math.max(0, Math.ceil(value));
const readStorage = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
};
const readCatalog = () => {
  const saved = readStorage('roofline-catalog', defaultCatalog);
  return Object.fromEntries(Object.keys(defaultCatalog).map((type) => {
    const savedItems = Array.isArray(saved[type]) ? saved[type] : [];
    const extras = savedItems.filter((item) => item.id?.startsWith('custom-'));
    const mergedDefaults = defaultCatalog[type].map((item) => savedItems.find((savedItem) => savedItem.id === item.id) || item);
    return [type, [...extras, ...mergedDefaults]];
  }));
};

function App() {
  const [catalog, setCatalog] = useState(readCatalog);
  const [jobs, setJobs] = useState(() => readStorage('roofline-jobs', []));
  const [job, setJob] = useState(() => newEstimate());
  const [activeTab, setActiveTab] = useState('estimate');
  const [addressFocused, setAddressFocused] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState('');
  const [proposalOpen, setProposalOpen] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressLookupLoading, setAddressLookupLoading] = useState(false);
  const [addressLookupError, setAddressLookupError] = useState('');
  const [catalogType, setCatalogType] = useState('shingle');
  const [isOnline, setIsOnline] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [sensorPitch, setSensorPitch] = useState(null);
  const [pitchListening, setPitchListening] = useState(false);
  const [selectedPlaneId, setSelectedPlaneId] = useState(null);
  const [jobsSearch, setJobsSearch] = useState('');
  const [catalogForm, setCatalogForm] = useState({ name: '', brand: '', price: '', coverage: '1', unit: 'bundle' });

  useEffect(() => localStorage.setItem('roofline-catalog', JSON.stringify(catalog)), [catalog]);
  useEffect(() => localStorage.setItem('roofline-jobs', JSON.stringify(jobs)), [jobs]);
  useEffect(() => {
    const draft = readStorage('roofline-current-draft', null);
    if (draft) setJob((current) => ({ ...current, ...draft }));
  }, []);
  useEffect(() => { localStorage.setItem('roofline-current-draft', JSON.stringify(job)); }, [job]);
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(''), 2800); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    let removeListener;
    Network.getStatus().then(({ connected }) => setIsOnline(connected)).catch(() => setIsOnline(navigator.onLine));
    Network.addListener('networkStatusChange', ({ connected }) => setIsOnline(connected)).then((listener) => { removeListener = listener.remove; }).catch(() => {});
    return () => { if (removeListener) removeListener(); };
  }, []);
  useEffect(() => {
    const query = job.address.trim();
    if (query.length < 5 || job.propertyLoaded) {
      setAddressSuggestions([]);
      return undefined;
    }
    setAddressLookupLoading(true);
    setAddressLookupError('');
    const timeout = setTimeout(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      try {
        if (!/\d/.test(query)) {
          setAddressSuggestions([]);
          setAddressLookupError('Enter a house or building number to search.');
          setAddressLookupLoading(false);
          clearTimeout(timeoutId);
          return;
        }
        const censusResponse = await fetch(`https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(query)}&benchmark=Public_AR_Current&format=json`, { signal: controller.signal });
        if (!censusResponse.ok) throw new Error('Census address lookup unavailable');
        const census = await censusResponse.json();
        let suggestions = (census.result?.addressMatches || []).slice(0, 8).map((match) => ({
          label: match.matchedAddress,
          lat: match.coordinates?.y,
          lon: match.coordinates?.x,
        })).filter((item) => /^\d/.test(item.label));

        if (!suggestions.length) {
          const photonResponse = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=en&osm_tag=place%3Ahouses`, { signal: controller.signal });
          if (photonResponse.ok) {
            const photon = await photonResponse.json();
            suggestions = (photon.features || []).map((feature) => {
              const p = feature.properties || {};
              const parts = [p.housenumber, p.street, p.city || p.town || p.village, p.state, p.postcode].filter(Boolean);
              return { label: [...new Set(parts)].join(', '), lat: feature.geometry?.coordinates?.[1], lon: feature.geometry?.coordinates?.[0] };
            }).filter((item) => /^\d/.test(item.label));
          }
        }
        setAddressSuggestions(suggestions);
        if (!suggestions.length) setAddressLookupError('No street address found. Include the house number, street, city, state, and ZIP if known.');
      } catch (error) {
        setAddressSuggestions([]);
        setAddressLookupError(error.name === 'AbortError' ? 'Address lookup timed out.' : 'Address lookup is unavailable. You can enter the exact address manually.');
      } finally {
        clearTimeout(timeoutId);
        setAddressLookupLoading(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [job.address, job.propertyLoaded]);

  const updateJob = (patch) => setJob((current) => ({ ...current, ...patch, updatedAt: new Date().toISOString() }));
  const totals = useMemo(() => calculateEstimate(job, catalog), [job, catalog]);

  const chooseAddress = (address) => {
    updateJob({ address: typeof address === 'string' ? address : address.label, propertyLoaded: false, measurementMode: 'property', lookupResolved: true, planes: [] });
    setAddressSuggestions([]);
    setAddressLookupError('');
  };
  const saveDraft = (status = 'draft') => {
    const saved = { ...job, status, updatedAt: new Date().toISOString(), customer: job.customer.trim() || 'Unnamed customer' };
    setJobs((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
    setJob(saved);
    setToast(status === 'proposal' ? 'Proposal saved to Jobs.' : 'Draft saved locally.');
  };
  const startNew = () => { setJob(newEstimate()); setActiveTab('estimate'); setToast('New estimate started.'); };
  const loadJob = (saved) => { setJob(saved); setActiveTab('estimate'); setToast('Job loaded.'); };
  const useLocation = () => {
    const resolve = async ({ coords }) => {
      setAddressLookupLoading(true);
      setAddressLookupError('');
      try {
        if (!Number.isFinite(coords?.latitude) || !Number.isFinite(coords?.longitude)) throw new Error('GPS coordinates unavailable');
        if (coords.accuracy && coords.accuracy > 500) throw new Error('GPS is too inaccurate');

        const candidates = [];
        const esriUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location=${coords.longitude},${coords.latitude}&distance=100&outSR=4326&langCode=en&f=json`;
        try {
          const esriResponse = await fetch(esriUrl);
          if (esriResponse.ok) {
            const esri = await esriResponse.json();
            const address = esri.address || {};
            const match = address.Match_addr || address.LongLabel;
            if (match) candidates.push(match);
            const parts = [address.Address, address.Neighborhood, address.City, address.Region, address.Postal].filter(Boolean);
            if (parts.length) candidates.push(parts.join(', '));
          }
        } catch {}

        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${coords.latitude}&lon=${coords.longitude}`;
        try {
          const nominatimResponse = await fetch(nominatimUrl, { headers: { 'Accept-Language': 'en-US,en;q=0.9' } });
          if (nominatimResponse.ok) {
            const nominatim = await nominatimResponse.json();
            const p = nominatim.address || {};
            const house = p.house_number;
            const street = p.road || p.pedestrian || p.path;
            if (house && street) {
              candidates.push([house, street, p.city || p.town || p.village || p.municipality, p.state, p.postcode].filter(Boolean).join(', '));
            }
          }
        } catch {}

        const exactLabel = candidates.map((label) => label.replace(/\s+/g, ' ').trim()).find((label) => /^\d+/.test(label));
        if (!exactLabel) throw new Error('Exact street address unavailable');
        chooseAddress(exactLabel);
        setToast('Street address resolved from your location.');
      } catch {
        setAddressLookupError('Could not resolve an exact street address. Move to the street address or enter it manually.');
      } finally {
        setAddressLookupLoading(false);
      }
    };
    if (window.Capacitor?.isNativePlatform?.()) {
      Promise.all([Geolocation.checkPermissions(), Geolocation.requestPermissions({ permissions: ['location'] })])
        .then(() => Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 12000 }))
        .then((position) => resolve({ coords: position.coords }))
        .catch(() => setToast('Location permission was denied or unavailable.'));
      return;
    }
    if (!navigator.geolocation) { setToast('Location is not available on this device.'); return; }
    navigator.geolocation.getCurrentPosition(resolve, () => setToast('Location permission was denied.'));
  };
  const updatePlane = (id, patch) => updateJob({ planes: job.planes.map((plane) => plane.id === id ? { ...plane, ...patch } : plane) });
  const addPlane = () => updateJob({ planes: [...job.planes, { id: Date.now(), name: `Roof plane ${job.planes.length + 1}`, length: 0, width: 0, pitch: 0, area: 0, verified: false }] });
  const removePlane = (id) => updateJob({ planes: job.planes.filter((plane) => plane.id !== id) });
  const readPitch = async () => {
    if (!window.DeviceOrientationEvent) { setToast('Pitch sensing is unavailable on this device.'); return; }
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') { setToast('Motion permission is required for pitch sensing.'); return; }
      }
      if (!job.planes.length) addPlane();
      setPitchListening(true);
      setSelectedPlaneId(job.planes[0]?.id || null);
      setToast('Hold the phone against the roof slope. The pitch is updating live.');
      window.addEventListener('deviceorientation', readPitchAngle, { passive: true });
    } catch {
      setToast('Pitch sensing is unavailable. Enter pitch manually.');
    }
  };
  const readPitchAngle = (event) => {
    const beta = Number(event.beta);
    const gamma = Number(event.gamma);
    if (!Number.isFinite(beta) || !Number.isFinite(gamma)) return;
    const angle = Math.min(90, Math.max(0, Math.round(Math.abs(gamma) || Math.abs(beta))));
    const rise = Math.tan(angle * Math.PI / 180) * 12;
    setSensorPitch({ angle, pitch: Math.round(rise * 10) / 10 });
  };
  const applyPitch = () => {
    if (!sensorPitch || !selectedPlaneId) { setToast('Start pitch sensing and select a roof plane first.'); return; }
    updatePlane(selectedPlaneId, { pitch: sensorPitch.pitch });
    window.removeEventListener('deviceorientation', readPitchAngle);
    setPitchListening(false);
    setToast(`Pitch applied: ${sensorPitch.pitch}/12.`);
  };
  const capturePhoto = async () => {
    try {
      const photo = await NativeCamera.getPhoto({ quality: 82, resultType: CameraResultType.DataUrl, source: CameraSource.Camera, allowEditing: false });
      setPhotos((current) => [...current, photo.dataUrl].slice(-12));
      setToast('Roof photo captured.');
    } catch (error) {
      if (error?.message?.toLower !== 'user cancelled photos') setToast('Camera permission was denied or unavailable.');
    }
  };
  const shareEstimate = async () => {
    try {
      await Share.share({
        title: `Roofline estimate — ${job.customer || 'New job'}`,
        text: `${job.customer || 'Customer'}\n${job.address || 'Address not entered'}\nProject total: ${money(totals.total)}\nRoof surface: ${Math.round(totals.surfaceArea)} sq ft\nOrder quantity: ${totals.adjustedSquares.toFixed(1)} squares`,
      });
    } catch {
      setToast('Sharing is unavailable on this device.');
    }
  };
  const addProduct = (event) => {
    event.preventDefault();
    const fallbackPrice = { shingle: 39.95, underlayment: 74.95, ice: 69.95, ridge: 58.5, starter: 46.5, flashing: 12.95, fasteners: 74.95, ventilation: 24.95 }[catalogType];
    const fallbackCoverage = { shingle: 3, underlayment: 10, ice: 2, ridge: 30, starter: 120, flashing: 10, fasteners: 7200, ventilation: 1 }[catalogType];
    const price = catalogForm.price === '' ? fallbackPrice : Number(catalogForm.price);
    const coverage = catalogForm.coverage === '' ? fallbackCoverage : Number(catalogForm.coverage);
    if (!catalogForm.name.trim() || !Number.isFinite(price) || price < 0 || !Number.isFinite(coverage) || coverage <= 0) {
      setToast('Enter a product name and valid coverage.'); return;
    }
    const product = { id: `custom-${Date.now()}`, name: catalogForm.name.trim(), brand: catalogForm.brand.trim(), price, coverage, unit: catalogForm.unit, packSize: 3, detail: `${coverage} squares / unit` };
    setCatalog((current) => ({ ...current, [catalogType]: [product, ...current[catalogType]] }));
    setCatalogForm({ name: '', brand: '', price: '', coverage: '1', unit: 'bundle' });
    setToast('Product added to your catalog.');
  };
  const removeProduct = (type, id) => setCatalog((current) => ({ ...current, [type]: current[type].filter((product) => product.id !== id) }));
  const updateCatalogPrice = (type, id, price) => setCatalog((current) => ({
    ...current,
    [type]: current[type].map((product) => product.id === id ? { ...product, price: Math.max(0, Number(price) || 0) } : product),
  }));
  const resetCatalog = () => { setCatalog(defaultCatalog); setToast('Catalog reset to standard product list.'); };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={startNew}><span className="brand-mark"><Hammer size={19} /></span><span>roof<span className="brand-accent">line</span></span></button>
        <nav className={mobileMenu ? 'nav-links open' : 'nav-links'}>
          <NavButton active={activeTab === 'estimate'} onClick={() => setActiveTab('estimate')}>New estimate</NavButton>
          <NavButton active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')}>Jobs <span className="nav-pill">{jobs.length}</span></NavButton>
          <NavButton active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')}>Catalog</NavButton>
        </nav>
        <div className="top-actions"><span className="sync-status"><span className={isOnline ? 'sync-dot' : 'sync-dot offline'} /> {isOnline ? `Connected · v${APP_VERSION}` : `Offline · v${APP_VERSION}`}</span><button className="avatar">JM</button><button className="menu-toggle" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X size={20} /> : <Menu size={20} />}</button></div>
      </header>

      <main className="page">
        <div className="page-heading">
          <div><div className="eyebrow"><Sparkles size={14} /> FIELD ESTIMATOR</div><h1>{activeTab === 'estimate' ? 'Build an estimate' : activeTab === 'jobs' ? 'Your jobs' : 'Product catalog'}</h1><p>{activeTab === 'estimate' ? 'Measure the roof. Select the products. Know your number.' : activeTab === 'jobs' ? 'Drafts and proposals, ready when you are.' : 'Your prices, your suppliers, your margins.'}</p></div>
          <button className="secondary-button" onClick={() => setToast('Preferences will be available in the next release.')}><Settings2 size={16} /> Preferences</button>
        </div>

        {activeTab === 'jobs' && <Jobs jobs={jobs} onNew={startNew} onLoad={loadJob} onDelete={(id) => setJobs((current) => current.filter((item) => item.id !== id))} />}
        {activeTab === 'catalog' && <Catalog catalog={catalog} type={catalogType} setType={setCatalogType} form={catalogForm} setForm={setCatalogForm} onAdd={addProduct} onDelete={removeProduct} onPriceChange={updateCatalogPrice} onReset={resetCatalog} />}
        {activeTab === 'estimate' && <div className="workspace">
          <section className="main-column">
            <div className="step-card">
              <StepNumber number="01" />
              <div className="card-content">
                <CardHeading title="Job details" description="Keep the customer and job address attached to every estimate." icon={<UserRound size={20} />} />
                <div className="job-fields"><label>Customer name<input value={job.customer} onChange={(e) => updateJob({ customer: e.target.value })} placeholder="e.g. Alex Morgan" /></label><label>Phone <input value={job.phone} onChange={(e) => updateJob({ phone: e.target.value })} placeholder="(555) 000-0000" /></label></div>
                <div className="address-wrap"><MapPin size={18} /><input value={job.address} onChange={(event) => { updateJob({ address: event.target.value, propertyLoaded: false, lookupResolved: false }); setAddressFocused(true); }} onFocus={() => setAddressFocused(true)} placeholder="Enter job address" />{job.address && <button className="clear-button" onClick={() => updateJob({ address: '', propertyLoaded: false, lookupResolved: false })}><X size={16} /></button>}<button className="location-button" onClick={useLocation}><Crosshair size={15} /> Use my location</button>{addressFocused && (addressLookupLoading || addressSuggestions.length > 0 || addressLookupError) && <div className="suggestions">{addressLookupLoading ? <div className="lookup-loading">Searching addresses...</div> : addressSuggestions.map((item) => <button key={`${item.lat}-${item.lon}-${item.label}`} onMouseDown={() => { chooseAddress(item); setAddressFocused(false); }}><MapPin size={15} /><span>{item.label}</span><span className="suggestion-type">Address match</span></button>)}{addressLookupError && <div className="lookup-loading error">{addressLookupError}</div>}</div>}</div>
                <div className="mode-toggle"><ModeButton active={job.measurementMode === 'property'} onClick={() => updateJob({ measurementMode: 'property' })} icon={<Building2 size={16} />} title="Property lookup" detail="Satellite + roof data" /><ModeButton active={job.measurementMode === 'manual'} onClick={() => updateJob({ measurementMode: 'manual' })} icon={<ScanLine size={16} />} title="Manual / AR measure" detail="New build or verify" /></div>
                {job.measurementMode === 'manual' ? <div className="ar-callout"><div className="ar-icon"><Ruler size={21} /></div><div><b>Manual measurement workspace</b><p>Capture roof photos or trace each plane, then enter the verified area and pitch below.</p></div><button className="outline-button" onClick={capturePhoto}><Camera size={15} /> Capture photo</button></div> : <div className={job.lookupResolved ? 'lookup-success' : 'lookup-hint'}>{job.lookupResolved ? <><Check size={16} /><span><b>Address resolved</b> · Enter and verify roof planes below</span></> : <><CircleHelp size={16} /><span>Existing home? Search it. New build? Choose manual / AR measure.</span></>}</div>}
                {photos.length > 0 && <div className="photo-strip">{photos.map((photo, index) => <img key={`${index}-${photo.slice(-20)}`} src={photo} alt={`Roof photo ${index + 1}`} />)}</div>}
              </div>
            </div>

            <div className="step-card"><StepNumber number="02" /><div className="card-content"><CardHeading title="Measure roof planes" description="Enter each plane's true eave-to-ridge length and width, then verify its pitch." icon={<Compass size={20} />} /><button className="add-plane pitch-tool" onClick={readPitch}><Compass size={15} /> {pitchListening ? 'Pitch sensor active' : 'Use pitch sensor'}</button>{pitchListening && <div className="pitch-live"><div><span>Measured angle</span><b>{sensorPitch ? `${sensorPitch.angle}°` : 'Reading...'}</b></div><div><span>Roof pitch</span><b>{sensorPitch ? `${sensorPitch.pitch}/12` : '—'}</b></div><select value={selectedPlaneId || ''} onChange={(event) => setSelectedPlaneId(Number(event.target.value))}>{job.planes.map((plane) => <option value={plane.id} key={plane.id}>{plane.name}</option>)}</select><button className="primary-button compact-button" onClick={applyPitch}>Apply pitch</button></div>}<div className="plane-list">{job.planes.map((plane, index) => {
              const length = Number(plane.length) || 0;
              const width = Number(plane.width) || 0;
              const pitch = Number(plane.pitch) || 0;
              const area = length * width * Math.sqrt(1 + Math.pow(pitch / 12, 2));
              return <div className="plane-row" key={plane.id}><div className="plane-index">{index + 1}</div><input className="plane-name" value={plane.name} onChange={(e) => updatePlane(plane.id, { name: e.target.value })} aria-label="Roof plane name" /><div className="mini-field"><input type="number" min="0" step="0.1" value={plane.length || ''} onChange={(e) => updatePlane(plane.id, { length: Math.max(0, Number(e.target.value) || 0) })} /><span>ft long</span></div><div className="mini-field"><input type="number" min="0" step="0.1" value={plane.width || ''} onChange={(e) => updatePlane(plane.id, { width: Math.max(0, Number(e.target.value) || 0) })} /><span>ft wide</span></div><div className="mini-field pitch-field"><input type="number" min="0" max="24" value={plane.pitch || ''} onChange={(e) => updatePlane(plane.id, { pitch: Math.min(24, Math.max(0, Number(e.target.value) || 0)) })} /><span>/ 12</span></div><button className={plane.verified ? 'verify-plane verified' : 'verify-plane'} onClick={() => updatePlane(plane.id, { verified: length > 0 && width > 0 && pitch > 0 })} type="button">{plane.verified ? <Check size={14} /> : 'Verify'}<span>{Math.round(area)} sq ft</span></button><button className="delete-plane" onClick={() => removePlane(plane.id)} aria-label={`Remove ${plane.name}`}><Trash2 size={15} /></button></div>;
            })}{job.planes.length === 0 && <div className="empty-measurement"><Ruler size={20} /><div><b>No roof planes measured</b><span>Address lookup finds the property only. Measure each roof plane below.</span></div></div>}</div><button className="add-plane" onClick={addPlane}><Plus size={15} /> Add roof plane</button><div className="input-grid compact-grid"><label>Waste factor<div className="input-with-unit"><input type="number" min="0" max="40" value={job.waste} onChange={(e) => updateJob({ waste: Math.min(40, Math.max(0, Number(e.target.value) || 0)) })} /><span>%</span></div></label><div className="measurement-stat"><span>Surface area</span><b>{Math.round(totals.surfaceArea).toLocaleString()} sq ft</b></div><div className="measurement-stat"><span>Order quantity</span><b>{totals.adjustedSquares.toFixed(1)} squares</b></div></div></div></div>

            <div className="step-card"><StepNumber number="03" /><div className="card-content"><CardHeading title="Select products" description="Use the actual product and price you plan to install." icon={<BadgeDollarSign size={20} />} /><ProductSelect label="Roofing system" value={job.selected.shingle} options={catalog.shingle} onChange={(value) => updateJob({ selected: { ...job.selected, shingle: value } })} isShingle /><ProductSelect label="Underlayment" value={job.selected.underlayment} options={catalog.underlayment} onChange={(value) => updateJob({ selected: { ...job.selected, underlayment: value } })} /><ProductSelect label="Ice & water shield" value={job.selected.ice} options={catalog.ice} onChange={(value) => updateJob({ selected: { ...job.selected, ice: value } })} /><ProductSelect label="Hip & ridge" value={job.selected.ridge} options={catalog.ridge} onChange={(value) => updateJob({ selected: { ...job.selected, ridge: value } })} /><button className="catalog-link" onClick={() => setActiveTab('catalog')}>Manage your product catalog <ArrowRight size={15} /></button></div></div>

            <div className="step-card"><StepNumber number="04" /><div className="card-content"><CardHeading title="Add project costs" description="Make labor, tear-off, disposal, permits, and tax visible instead of hiding them in markup." icon={<FileText size={20} />} /><div className="input-grid cost-grid"><CostInput label="Labor / square" value={job.laborRate} prefix="$" suffix="/ sq" onChange={(value) => updateJob({ laborRate: value })} /><CostInput label="Tear-off" value={job.tearOff} prefix="$" onChange={(value) => updateJob({ tearOff: value })} /><CostInput label="Disposal" value={job.disposal} prefix="$" onChange={(value) => updateJob({ disposal: value })} /><CostInput label="Permit / misc." value={job.permit} prefix="$" onChange={(value) => updateJob({ permit: value })} /><CostInput label="Sales tax" value={job.tax} suffix="%" onChange={(value) => updateJob({ tax: Math.min(30, Math.max(0, value)) })} /><CostInput label="Markup" value={job.markup} suffix="%" onChange={(value) => updateJob({ markup: Math.min(100, Math.max(0, value)) })} /></div></div></div>
          </section>

          <EstimatePanel job={job} totals={totals} onUpdate={updateJob} onSave={saveDraft} onProposal={() => {
            if (!job.address.trim()) { setToast('Enter a job address before creating a proposal.'); return; }
            if (!totals.ready) { setToast('Add and verify every roof plane before creating a proposal.'); return; }
            setProposalOpen(true);
          }} onShare={shareEstimate} />
        </div>}
      </main>
      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
      {proposalOpen && <ProposalModal job={job} totals={totals} onClose={() => setProposalOpen(false)} onSave={() => { saveDraft('proposal'); setProposalOpen(false); }} />}
    </div>
  );
}

function calculateEstimate(job, catalog) {
  const planes = job.planes.filter((plane) => {
    const length = Number(plane.length) || 0;
    const width = Number(plane.width) || 0;
    return length > 0 && width > 0;
  }).map((plane) => {
    const length = Number(plane.length) || 0;
    const width = Number(plane.width) || 0;
    const pitch = Number(plane.pitch) || 0;
    const pitchFactor = Math.sqrt(1 + Math.pow(pitch / 12, 2));
    const area = length * width * pitchFactor;
    return { ...plane, area };
  });
  const surfaceArea = planes.reduce((total, plane) => total + plane.area, 0);
  const squares = surfaceArea / 100;
  const adjustedSquares = squares * (1 + job.waste / 100);
  const selected = {
    shingle: catalog.shingle.find((item) => item.id === job.selected.shingle) || catalog.shingle[0],
    underlayment: catalog.underlayment.find((item) => item.id === job.selected.underlayment) || catalog.underlayment[0],
    ice: catalog.ice.find((item) => item.id === job.selected.ice) || catalog.ice[0],
    ridge: catalog.ridge.find((item) => item.id === job.selected.ridge) || catalog.ridge[0],
  };
  const quantities = {
    shingle: quantity(adjustedSquares * (selected.shingle?.packSize || 3)),
    underlayment: quantity(adjustedSquares / (selected.underlayment?.coverage || 10)),
    ice: quantity((adjustedSquares * 0.3) / (selected.ice?.coverage || 2)),
    ridge: quantity((Math.sqrt(Math.max(0, surfaceArea)) * 1.8) / (selected.ridge?.coverage || 30)),
  };
  const materialCost = quantities.shingle * selected.shingle.price + quantities.underlayment * selected.underlayment.price + quantities.ice * selected.ice.price + quantities.ridge * selected.ridge.price;
  const laborCost = squares * job.laborRate;
  const directCost = materialCost + laborCost + job.tearOff + job.disposal + job.permit;
  const tax = (materialCost + job.permit) * (job.tax / 100);
  const subtotal = directCost + tax;
  const verifiedPlanes = job.planes.filter((plane) => plane.verified && (Number(plane.length) || 0) > 0 && (Number(plane.width) || 0) > 0);
  const ready = verifiedPlanes.length > 0 && planes.length === job.planes.length;
  return { surfaceArea, squares, adjustedSquares, selected, quantities, materialCost, laborCost, tax, directCost, subtotal, total: ready ? subtotal * (1 + job.markup / 100) : 0, ready };
}

function NavButton({ active, onClick, children }) { return <button className={active ? 'nav-link active' : 'nav-link'} onClick={onClick}>{children}</button>; }
function StepNumber({ number }) { return <div className="step-number">{number}</div>; }
function CardHeading({ title, description, icon }) { return <div className="card-title-row"><div><h2>{title}</h2><p>{description}</p></div><span className="title-icon">{icon}</span></div>; }
function ModeButton({ active, onClick, icon, title, detail }) { return <button className={active ? 'mode active' : 'mode'} onClick={onClick}>{icon}<span><b>{title}</b><small>{detail}</small></span>{active && <Check size={16} />}</button>; }
function CostInput({ label, value, prefix, suffix, onChange }) { return <label>{label}<div className="input-with-unit">{prefix && <span>{prefix}</span>}<input type="number" min="0" value={value} onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))} />{suffix && <span>{suffix}</span>}</div></label>; }
function ProductSelect({ label, value, options, onChange, isShingle }) {
  const selected = options.find((option) => option.id === value) || options[0];
  const brands = isShingle ? Array.from(new Set(options.map((item) => item.brand).filter(Boolean))) : [];
  return <label className="product-row"><span className="product-label">{label}</span><div className="product-select"><div className={isShingle ? 'product-swatch shingle-swatch' : 'product-swatch'} /><select value={selected.id} onChange={(e) => onChange(e.target.value)}>
    {isShingle ? brands.map((brand) => <optgroup label={brand} key={brand}>{options.filter((option) => option.brand === brand).map((option) => <option value={option.id} key={option.id}>{option.name}{option.color ? ` · ${option.color}` : ''}</option>)}</optgroup>) : options.map((option) => <option value={option.id} key={option.id}>{option.brand ? `${option.brand} · ${option.name}` : option.name}</option>)}
  </select><ChevronDown size={16} /><span className="product-price">{money(selected.price)}</span></div></label>;
}
function EstimateLine({ name, quantityText, cost }) { return <div className="estimate-line"><div><b>{name}</b><span>{quantityText}</span></div><strong>{money(cost)}</strong></div>; }
function ShareIcon() { return <ArrowRight size={14} />; }
function EstimatePanel({ job, totals, onUpdate, onSave, onProposal, onShare }) { return <aside className="estimate-panel"><div className="estimate-top"><div><span className="estimate-label">ESTIMATE PREVIEW</span><h2>{job.customer || 'New job'}</h2></div><div className="estimate-actions"><button className="icon-button" onClick={onShare} aria-label="Share estimate"><ShareIcon /></button><button className="icon-button" onClick={() => onSave()} aria-label="Save draft"><Save size={15} /></button></div></div><div className="estimate-address"><MapPin size={15} /> <span>{job.address || 'No address selected'}</span><span className={job.propertyLoaded || job.measurementMode === 'manual' ? 'confidence good' : 'confidence'}>{job.propertyLoaded || job.measurementMode === 'manual' ? 'Verified' : 'Draft'}</span></div><div className="total-block"><span>Estimated project total</span><strong>{money(totals.total)}</strong><small>Includes {job.markup}% markup · {job.tax}% tax</small></div><div className="breakdown"><div className="breakdown-heading"><b>Materials</b><span>{money(totals.materialCost)}</span></div><EstimateLine name={totals.selected.shingle.name} quantityText={`${totals.quantities.shingle} bundles`} cost={totals.quantities.shingle * totals.selected.shingle.price} /><EstimateLine name={totals.selected.underlayment.name} quantityText={`${totals.quantities.underlayment} rolls`} cost={totals.quantities.underlayment * totals.selected.underlayment.price} /><EstimateLine name={totals.selected.ice.name} quantityText={`${totals.quantities.ice} rolls`} cost={totals.quantities.ice * totals.selected.ice.price} /><EstimateLine name={totals.selected.ridge.name} quantityText={`${totals.quantities.ridge} bundles`} cost={totals.quantities.ridge * totals.selected.ridge.price} /><div className="breakdown-heading labor"><b>Labor + project costs</b><span>{money(totals.laborCost + job.tearOff + job.disposal + job.permit + totals.tax)}</span></div><EstimateLine name="Installation labor" quantityText={`${totals.squares.toFixed(1)} squares`} cost={totals.laborCost} /></div><div className="estimate-footer"><div><span>Subtotal</span><b>{money(totals.subtotal)}</b></div><button className="primary-button" onClick={onProposal}>Create proposal <ArrowRight size={16} /></button><button className="save-button" onClick={() => onSave()}><Save size={16} /> Save draft</button></div><div className="accuracy-note"><ShieldCheck size={16} /><span>Confirm plane measurements, product coverage, and supplier pricing before ordering.</span></div></aside>; }

function Jobs({ jobs, onNew, onLoad, onDelete }) {
  const [search, setSearch] = useState('');
  const visible = jobs.filter((item) => `${item.customer || ''} ${item.address || ''}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="jobs-panel"><div className="jobs-toolbar"><div className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer or address" /></div><button className="primary-button compact-button" onClick={onNew}><Plus size={16} /> New estimate</button></div>{visible.length === 0 ? <EmptyState icon={<FileText size={26} />} title={jobs.length ? 'No matching jobs' : 'No saved jobs yet'} text={jobs.length ? 'Try another customer or address.' : 'Save a draft from the estimate screen and it will appear here on this device.'} action="Start an estimate" onClick={onNew} /> : <div className="jobs-list">{visible.map((item) => <div className="job-row" key={item.id}><div className="job-icon"><Building2 size={18} /></div><div className="job-main"><b>{item.customer || 'Unnamed customer'}</b><span>{item.address || 'No address'} · {new Date(item.updatedAt).toLocaleDateString()}</span></div><span className={item.status === 'proposal' ? 'job-status proposal' : 'job-status'}>{item.status}</span><button className="outline-button" onClick={() => onLoad(item)}>Open</button><button className="delete-plane" onClick={() => { if (window.confirm(`Delete ${item.customer || 'this job'}?`)) onDelete(item.id); }} aria-label="Delete saved job"><Trash2 size={15} /></button></div>)}</div>}</div>;
}
function Catalog({ catalog, type, setType, form, setForm, onAdd, onDelete, onPriceChange, onReset }) {
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('All brands');
  const labels = { shingle: 'Shingles', underlayment: 'Underlayment', ice: 'Ice & water', ridge: 'Hip & ridge', starter: 'Starter strips', flashing: 'Flashing & valleys', fasteners: 'Nails & fasteners', ventilation: 'Roof ventilation' };
  const brands = ['All brands', ...Array.from(new Set(catalog[type].map((item) => item.brand).filter(Boolean))).sort()];
  const visible = catalog[type].filter((item) => {
    const matchesText = `${item.brand || ''} ${item.name}`.toLowerCase().includes(search.toLowerCase());
    return matchesText && (brand === 'All brands' || item.brand === brand);
  });
  return <div className="catalog-panel">
    <div className="catalog-tabs">{Object.keys(labels).map((key) => <button className={type === key ? 'catalog-tab active' : 'catalog-tab'} key={key} onClick={() => { setType(key); setSearch(''); setBrand('All brands'); }}>{labels[key]} <span>{catalog[key].length}</span></button>)}</div>
    <div className="catalog-content">
      <div className="catalog-search-row"><div className="search-box"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brand or product" /></div>{type === 'shingle' || brands.length > 2 ? <select className="brand-select" value={brand} onChange={(e) => setBrand(e.target.value)}>{brands.map((item) => <option key={item}>{item}</option>)}</select> : null}<button className="secondary-button" onClick={onReset}>Reset catalog</button></div>
      <form className="add-product" onSubmit={onAdd}>
        <h2>Add a product</h2>
        <div className="product-form-grid">
          <input placeholder="Product name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <input type="number" min="0" step="0.01" placeholder="Price (optional)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input type="number" min="0.1" step="0.1" placeholder={type === 'shingle' ? 'Bundles / square' : 'Coverage'} value={form.coverage} onChange={(e) => setForm({ ...form, coverage: e.target.value })} />
          <button className="primary-button" type="submit"><Plus size={16} /> Add product</button>
        </div>
        <p>Standard coverage and a starting price are applied automatically when left blank.</p>
      </form>
      <div className="catalog-list">{visible.map((item) => <div className="catalog-item" key={item.id}><div className="product-swatch shingle-swatch" /><div><b>{item.brand ? `${item.brand} · ` : ''}{item.name}</b><span>{item.detail || `${item.packSize} bundles / square`}</span></div><label className="catalog-price"><span>My price</span><div><b>$</b><input type="number" min="0" step="0.01" value={item.price} onChange={(e) => onPriceChange(type, item.id, e.target.value)} /></div></label>{item.id.startsWith('custom-') ? <button className="delete-plane" onClick={() => onDelete(type, item.id)} aria-label={`Delete ${item.name}`}><Trash2 size={15} /></button> : null}</div>)}</div>
    </div>
  </div>;
}
function EmptyState({ icon, title, text, action, onClick }) { return <div className="empty-panel"><div className="empty-icon">{icon}</div><h2>{title}</h2><p>{text}</p><button className="primary-button" onClick={onClick}>{action} <ArrowRight size={16} /></button></div>; }
function ProposalModal({ job, totals, onClose, onSave }) { return <div className="modal-backdrop" onMouseDown={onClose}><div className="proposal-modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-header"><div><span className="estimate-label">PROPOSAL PREVIEW</span><h2>{job.customer || 'Customer proposal'}</h2></div><button className="icon-button" onClick={onClose}><X size={16} /></button></div><div className="proposal-meta"><span><UserRound size={14} /> {job.customer || 'Customer name not entered'}</span><span><MapPin size={14} /> {job.address || 'Address not entered'}</span></div><div className="proposal-total"><span>Project total</span><b>{money(totals.total)}</b></div><p className="proposal-note">This proposal includes measured roofing surface, selected products, installation labor, project costs, tax, and contractor markup. Confirm field conditions before final ordering.</p><div className="modal-actions"><button className="outline-button" onClick={onClose}>Keep editing</button><button className="primary-button" onClick={onSave}><Save size={16} /> Save proposal</button></div></div></div>; }

export default App;

createRoot(document.getElementById('root')).render(<App />);
