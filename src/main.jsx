import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight, BadgeDollarSign, Building2, Check, ChevronDown, CircleHelp, Compass,
  Crosshair, FileText, Hammer, MapPin, Menu, Plus, Ruler, Save, ScanLine, Search,
  Settings2, ShieldCheck, Sparkles, Trash2, UserRound, X
} from 'lucide-react';
import './styles.css';

const defaultCatalog = {
  shingle: [
    { id: 'owens-duration', brand: 'Owens Corning', name: 'Duration® Architectural', color: 'Estate Gray', packSize: 3, unit: 'bundle', price: 39.98 },
    { id: 'gaf-hdz', brand: 'GAF', name: 'Timberline HDZ®', color: 'Charcoal', packSize: 3, unit: 'bundle', price: 37.5 },
    { id: 'certainteed-landmark', brand: 'CertainTeed', name: 'Landmark® Pro', color: 'Weathered Wood', packSize: 3, unit: 'bundle', price: 44.25 },
  ],
  underlayment: [
    { id: 'synthetic', name: 'Synthetic underlayment', detail: '10 squares / roll', coverage: 10, unit: 'roll', price: 74.95 },
    { id: 'felt', name: '15 lb felt', detail: '4 squares / roll', coverage: 4, unit: 'roll', price: 32.5 },
  ],
  ice: [
    { id: 'ice-standard', name: 'Ice & water shield', detail: '2 squares / roll', coverage: 2, unit: 'roll', price: 69.95 },
    { id: 'ice-premium', name: 'High-temp ice & water shield', detail: '2 squares / roll', coverage: 2, unit: 'roll', price: 91.25 },
  ],
  ridge: [
    { id: 'ridge-hip', name: 'Hip & ridge cap shingles', detail: '30 linear ft / bundle', coverage: 30, unit: 'bundle', price: 58.5 },
    { id: 'ridge-caps', name: 'High-profile ridge caps', detail: '25 linear ft / bundle', coverage: 25, unit: 'bundle', price: 72 },
  ],
};

const sampleAddresses = [
  '1428 Oak Ridge Drive, Denver, CO',
  '88 Willow Creek Lane, Austin, TX',
  '4108 Pinecrest Avenue, Charlotte, NC',
  '1750 Harbor View Road, Tampa, FL',
];

const newEstimate = () => ({
  id: `job-${Date.now()}`,
  customer: '',
  phone: '',
  address: '',
  status: 'draft',
  updatedAt: new Date().toISOString(),
  measurementMode: 'property',
  propertyLoaded: false,
  planes: [{ id: 1, name: 'Main roof', area: 2420, pitch: 6 }],
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

function App() {
  const [catalog, setCatalog] = useState(() => readStorage('roofline-catalog', defaultCatalog));
  const [jobs, setJobs] = useState(() => readStorage('roofline-jobs', []));
  const [job, setJob] = useState(() => newEstimate());
  const [activeTab, setActiveTab] = useState('estimate');
  const [addressFocused, setAddressFocused] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState('');
  const [proposalOpen, setProposalOpen] = useState(false);
  const [catalogType, setCatalogType] = useState('shingle');
  const [catalogForm, setCatalogForm] = useState({ name: '', brand: '', price: '', coverage: '1', unit: 'bundle' });

  useEffect(() => localStorage.setItem('roofline-catalog', JSON.stringify(catalog)), [catalog]);
  useEffect(() => localStorage.setItem('roofline-jobs', JSON.stringify(jobs)), [jobs]);
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(''), 2800); return () => clearTimeout(timer); }, [toast]);

  const updateJob = (patch) => setJob((current) => ({ ...current, ...patch, updatedAt: new Date().toISOString() }));
  const filteredAddresses = sampleAddresses.filter((item) => item.toLowerCase().includes(job.address.toLowerCase()));
  const totals = useMemo(() => calculateEstimate(job, catalog), [job, catalog]);

  const chooseAddress = (address) => updateJob({ address, propertyLoaded: true, measurementMode: 'property', planes: [{ id: 1, name: 'Main roof', area: 2420, pitch: 6 }, { id: 2, name: 'Garage', area: 480, pitch: 5 }] });
  const saveDraft = (status = 'draft') => {
    const saved = { ...job, status, updatedAt: new Date().toISOString(), customer: job.customer || 'Unnamed customer' };
    setJobs((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
    setJob(saved);
    setToast(status === 'proposal' ? 'Proposal saved to Jobs.' : 'Draft saved locally.');
  };
  const startNew = () => { setJob(newEstimate()); setActiveTab('estimate'); setToast('New estimate started.'); };
  const loadJob = (saved) => { setJob(saved); setActiveTab('estimate'); setToast('Job loaded.'); };
  const useLocation = () => {
    if (!navigator.geolocation) { setToast('Location is not available on this device.'); return; }
    navigator.geolocation.getCurrentPosition(() => chooseAddress('Current location · property lookup ready'), () => setToast('Location permission was denied.'));
  };
  const updatePlane = (id, patch) => updateJob({ planes: job.planes.map((plane) => plane.id === id ? { ...plane, ...patch } : plane) });
  const addPlane = () => updateJob({ planes: [...job.planes, { id: Date.now(), name: `Roof plane ${job.planes.length + 1}`, area: 0, pitch: 6 }] });
  const removePlane = (id) => updateJob({ planes: job.planes.length > 1 ? job.planes.filter((plane) => plane.id !== id) : job.planes });
  const addProduct = (event) => {
    event.preventDefault();
    const price = Number(catalogForm.price);
    const coverage = Number(catalogForm.coverage);
    if (!catalogForm.name.trim() || !Number.isFinite(price) || price < 0 || !Number.isFinite(coverage) || coverage <= 0) {
      setToast('Enter a product name, valid price, and coverage.'); return;
    }
    const product = { id: `custom-${Date.now()}`, name: catalogForm.name.trim(), brand: catalogForm.brand.trim(), price, coverage, unit: catalogForm.unit, packSize: 3, detail: `${coverage} squares / unit` };
    setCatalog((current) => ({ ...current, [catalogType]: [product, ...current[catalogType]] }));
    setCatalogForm({ name: '', brand: '', price: '', coverage: '1', unit: 'bundle' });
    setToast('Product added to your catalog.');
  };
  const removeProduct = (type, id) => setCatalog((current) => ({ ...current, [type]: current[type].filter((product) => product.id !== id) }));

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={startNew}><span className="brand-mark"><Hammer size={19} /></span><span>roof<span className="brand-accent">line</span></span></button>
        <nav className={mobileMenu ? 'nav-links open' : 'nav-links'}>
          <NavButton active={activeTab === 'estimate'} onClick={() => setActiveTab('estimate')}>New estimate</NavButton>
          <NavButton active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')}>Jobs <span className="nav-pill">{jobs.length}</span></NavButton>
          <NavButton active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')}>Catalog</NavButton>
        </nav>
        <div className="top-actions"><span className="sync-status"><span className="sync-dot" /> Saved on this device</span><button className="avatar">JM</button><button className="menu-toggle" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X size={20} /> : <Menu size={20} />}</button></div>
      </header>

      <main className="page">
        <div className="page-heading">
          <div><div className="eyebrow"><Sparkles size={14} /> FIELD ESTIMATOR</div><h1>{activeTab === 'estimate' ? 'Build an estimate' : activeTab === 'jobs' ? 'Your jobs' : 'Product catalog'}</h1><p>{activeTab === 'estimate' ? 'Measure the roof. Select the products. Know your number.' : activeTab === 'jobs' ? 'Drafts and proposals, ready when you are.' : 'Your prices, your suppliers, your margins.'}</p></div>
          <button className="secondary-button" onClick={() => setToast('Preferences will be available in the next release.')}><Settings2 size={16} /> Preferences</button>
        </div>

        {activeTab === 'jobs' && <Jobs jobs={jobs} onNew={startNew} onLoad={loadJob} onDelete={(id) => setJobs((current) => current.filter((item) => item.id !== id))} />}
        {activeTab === 'catalog' && <Catalog catalog={catalog} type={catalogType} setType={setCatalogType} form={catalogForm} setForm={setCatalogForm} onAdd={addProduct} onDelete={removeProduct} />}
        {activeTab === 'estimate' && <div className="workspace">
          <section className="main-column">
            <div className="step-card">
              <StepNumber number="01" />
              <div className="card-content">
                <CardHeading title="Job details" description="Keep the customer and job address attached to every estimate." icon={<UserRound size={20} />} />
                <div className="job-fields"><label>Customer name<input value={job.customer} onChange={(e) => updateJob({ customer: e.target.value })} placeholder="e.g. Alex Morgan" /></label><label>Phone <input value={job.phone} onChange={(e) => updateJob({ phone: e.target.value })} placeholder="(555) 000-0000" /></label></div>
                <div className="address-wrap"><MapPin size={18} /><input value={job.address} onChange={(event) => { updateJob({ address: event.target.value, propertyLoaded: false }); setAddressFocused(true); }} onFocus={() => setAddressFocused(true)} placeholder="Enter job address" />{job.address && <button className="clear-button" onClick={() => updateJob({ address: '', propertyLoaded: false })}><X size={16} /></button>}<button className="location-button" onClick={useLocation}><Crosshair size={15} /> Use my location</button>{addressFocused && job.address && filteredAddresses.length > 0 && <div className="suggestions">{filteredAddresses.map((item) => <button key={item} onMouseDown={() => { chooseAddress(item); setAddressFocused(false); }}><MapPin size={15} /><span>{item}</span><span className="suggestion-type">Property data</span></button>)}</div>}</div>
                <div className="mode-toggle"><ModeButton active={job.measurementMode === 'property'} onClick={() => updateJob({ measurementMode: 'property' })} icon={<Building2 size={16} />} title="Property lookup" detail="Satellite + roof data" /><ModeButton active={job.measurementMode === 'manual'} onClick={() => updateJob({ measurementMode: 'manual' })} icon={<ScanLine size={16} />} title="Manual / AR measure" detail="New build or verify" /></div>
                {job.measurementMode === 'manual' ? <div className="ar-callout"><div className="ar-icon"><Ruler size={21} /></div><div><b>Manual measurement workspace</b><p>Trace each roof plane with a native AR camera, then enter the verified area and pitch below.</p></div><button className="outline-button" onClick={() => setToast('AR camera handoff is ready for native mobile integration.')}>Start AR <ArrowRight size={15} /></button></div> : <div className={job.propertyLoaded ? 'lookup-success' : 'lookup-hint'}>{job.propertyLoaded ? <><Check size={16} /><span><b>Property data loaded</b> · verify every plane before ordering</span></> : <><CircleHelp size={16} /><span>Existing home? Search it. New build? Choose manual / AR measure.</span></>}</div>}
              </div>
            </div>

            <div className="step-card"><StepNumber number="02" /><div className="card-content"><CardHeading title="Verify roof planes" description="Every plane can have its own area and pitch. The estimate uses the sum." icon={<Compass size={20} />} /><div className="plane-list">{job.planes.map((plane, index) => <div className="plane-row" key={plane.id}><div className="plane-index">{index + 1}</div><input className="plane-name" value={plane.name} onChange={(e) => updatePlane(plane.id, { name: e.target.value })} aria-label="Roof plane name" /><div className="mini-field"><input type="number" min="0" value={plane.area} onChange={(e) => updatePlane(plane.id, { area: Math.max(0, Number(e.target.value) || 0) })} /><span>sq ft</span></div><div className="mini-field pitch-field"><input type="number" min="0" max="24" value={plane.pitch} onChange={(e) => updatePlane(plane.id, { pitch: Math.min(24, Math.max(0, Number(e.target.value) || 0)) })} /><span>/ 12</span></div><button className="delete-plane" onClick={() => removePlane(plane.id)} disabled={job.planes.length === 1} aria-label={`Remove ${plane.name}`}><Trash2 size={15} /></button></div>)}</div><button className="add-plane" onClick={addPlane}><Plus size={15} /> Add roof plane</button><div className="input-grid compact-grid"><label>Waste factor<div className="input-with-unit"><input type="number" min="0" max="40" value={job.waste} onChange={(e) => updateJob({ waste: Math.min(40, Math.max(0, Number(e.target.value) || 0)) })} /><span>%</span></div></label><div className="measurement-stat"><span>Surface area</span><b>{Math.round(totals.surfaceArea).toLocaleString()} sq ft</b></div><div className="measurement-stat"><span>Order quantity</span><b>{totals.adjustedSquares.toFixed(1)} squares</b></div></div></div></div>

            <div className="step-card"><StepNumber number="03" /><div className="card-content"><CardHeading title="Select products" description="Use the actual product and price you plan to install." icon={<BadgeDollarSign size={20} />} /><ProductSelect label="Roofing system" value={job.selected.shingle} options={catalog.shingle} onChange={(value) => updateJob({ selected: { ...job.selected, shingle: value } })} isShingle /><ProductSelect label="Underlayment" value={job.selected.underlayment} options={catalog.underlayment} onChange={(value) => updateJob({ selected: { ...job.selected, underlayment: value } })} /><ProductSelect label="Ice & water shield" value={job.selected.ice} options={catalog.ice} onChange={(value) => updateJob({ selected: { ...job.selected, ice: value } })} /><ProductSelect label="Hip & ridge" value={job.selected.ridge} options={catalog.ridge} onChange={(value) => updateJob({ selected: { ...job.selected, ridge: value } })} /><button className="catalog-link" onClick={() => setActiveTab('catalog')}>Manage your product catalog <ArrowRight size={15} /></button></div></div>

            <div className="step-card"><StepNumber number="04" /><div className="card-content"><CardHeading title="Add project costs" description="Make labor, tear-off, disposal, permits, and tax visible instead of hiding them in markup." icon={<FileText size={20} />} /><div className="input-grid cost-grid"><CostInput label="Labor / square" value={job.laborRate} prefix="$" suffix="/ sq" onChange={(value) => updateJob({ laborRate: value })} /><CostInput label="Tear-off" value={job.tearOff} prefix="$" onChange={(value) => updateJob({ tearOff: value })} /><CostInput label="Disposal" value={job.disposal} prefix="$" onChange={(value) => updateJob({ disposal: value })} /><CostInput label="Permit / misc." value={job.permit} prefix="$" onChange={(value) => updateJob({ permit: value })} /><CostInput label="Sales tax" value={job.tax} suffix="%" onChange={(value) => updateJob({ tax: Math.min(30, Math.max(0, value)) })} /><CostInput label="Markup" value={job.markup} suffix="%" onChange={(value) => updateJob({ markup: Math.min(100, Math.max(0, value)) })} /></div></div></div>
          </section>

          <EstimatePanel job={job} totals={totals} onUpdate={updateJob} onSave={saveDraft} onProposal={() => setProposalOpen(true)} />
        </div>}
      </main>
      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
      {proposalOpen && <ProposalModal job={job} totals={totals} onClose={() => setProposalOpen(false)} onSave={() => { saveDraft('proposal'); setProposalOpen(false); }} />}
    </div>
  );
}

function calculateEstimate(job, catalog) {
  const planes = job.planes.filter((plane) => Number.isFinite(plane.area) && plane.area >= 0);
  const surfaceArea = planes.reduce((total, plane) => total + plane.area * Math.sqrt(1 + Math.pow(plane.pitch / 12, 2)), 0);
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
  return { surfaceArea, squares, adjustedSquares, selected, quantities, materialCost, laborCost, tax, directCost, subtotal, total: subtotal * (1 + job.markup / 100) };
}

function NavButton({ active, onClick, children }) { return <button className={active ? 'nav-link active' : 'nav-link'} onClick={onClick}>{children}</button>; }
function StepNumber({ number }) { return <div className="step-number">{number}</div>; }
function CardHeading({ title, description, icon }) { return <div className="card-title-row"><div><h2>{title}</h2><p>{description}</p></div><span className="title-icon">{icon}</span></div>; }
function ModeButton({ active, onClick, icon, title, detail }) { return <button className={active ? 'mode active' : 'mode'} onClick={onClick}>{icon}<span><b>{title}</b><small>{detail}</small></span>{active && <Check size={16} />}</button>; }
function CostInput({ label, value, prefix, suffix, onChange }) { return <label>{label}<div className="input-with-unit">{prefix && <span>{prefix}</span>}<input type="number" min="0" value={value} onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))} />{suffix && <span>{suffix}</span>}</div></label>; }
function ProductSelect({ label, value, options, onChange, isShingle }) { const selected = options.find((option) => option.id === value) || options[0]; return <label className="product-row"><span className="product-label">{label}</span><div className="product-select"><div className={isShingle ? 'product-swatch shingle-swatch' : 'product-swatch'} /><select value={selected.id} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option value={option.id} key={option.id}>{option.brand ? `${option.brand} · ${option.name} · ${option.color}` : option.name}</option>)}</select><ChevronDown size={16} /><span className="product-price">{money(selected.price)}</span></div></label>; }
function EstimateLine({ name, quantityText, cost }) { return <div className="estimate-line"><div><b>{name}</b><span>{quantityText}</span></div><strong>{money(cost)}</strong></div>; }
function EstimatePanel({ job, totals, onUpdate, onSave, onProposal }) { return <aside className="estimate-panel"><div className="estimate-top"><div><span className="estimate-label">ESTIMATE PREVIEW</span><h2>{job.customer || 'New job'}</h2></div><button className="icon-button" onClick={() => onSave()}><Save size={15} /></button></div><div className="estimate-address"><MapPin size={15} /> <span>{job.address || 'No address selected'}</span><span className={job.propertyLoaded || job.measurementMode === 'manual' ? 'confidence good' : 'confidence'}>{job.propertyLoaded || job.measurementMode === 'manual' ? 'Verified' : 'Draft'}</span></div><div className="total-block"><span>Estimated project total</span><strong>{money(totals.total)}</strong><small>Includes {job.markup}% markup · {job.tax}% tax</small></div><div className="breakdown"><div className="breakdown-heading"><b>Materials</b><span>{money(totals.materialCost)}</span></div><EstimateLine name={totals.selected.shingle.name} quantityText={`${totals.quantities.shingle} bundles`} cost={totals.quantities.shingle * totals.selected.shingle.price} /><EstimateLine name={totals.selected.underlayment.name} quantityText={`${totals.quantities.underlayment} rolls`} cost={totals.quantities.underlayment * totals.selected.underlayment.price} /><EstimateLine name={totals.selected.ice.name} quantityText={`${totals.quantities.ice} rolls`} cost={totals.quantities.ice * totals.selected.ice.price} /><EstimateLine name={totals.selected.ridge.name} quantityText={`${totals.quantities.ridge} bundles`} cost={totals.quantities.ridge * totals.selected.ridge.price} /><div className="breakdown-heading labor"><b>Labor + project costs</b><span>{money(totals.laborCost + job.tearOff + job.disposal + job.permit + totals.tax)}</span></div><EstimateLine name="Installation labor" quantityText={`${totals.squares.toFixed(1)} squares`} cost={totals.laborCost} /></div><div className="estimate-footer"><div><span>Subtotal</span><b>{money(totals.subtotal)}</b></div><button className="primary-button" onClick={onProposal}>Create proposal <ArrowRight size={16} /></button><button className="save-button" onClick={() => onSave()}><Save size={16} /> Save draft</button></div><div className="accuracy-note"><ShieldCheck size={16} /><span>Confirm plane measurements, product coverage, and supplier pricing before ordering.</span></div></aside>; }

function Jobs({ jobs, onNew, onLoad, onDelete }) { return <div className="jobs-panel"><div className="jobs-toolbar"><div className="search-box"><Search size={16} /><input placeholder="Search jobs" /></div><button className="primary-button compact-button" onClick={onNew}><Plus size={16} /> New estimate</button></div>{jobs.length === 0 ? <EmptyState icon={<FileText size={26} />} title="No saved jobs yet" text="Save a draft from the estimate screen and it will appear here on this device." action="Start an estimate" onClick={onNew} /> : <div className="jobs-list">{jobs.map((item) => <div className="job-row" key={item.id}><div className="job-icon"><Building2 size={18} /></div><div className="job-main"><b>{item.customer || 'Unnamed customer'}</b><span>{item.address || 'No address'} · {new Date(item.updatedAt).toLocaleDateString()}</span></div><span className={item.status === 'proposal' ? 'job-status proposal' : 'job-status'}>{item.status}</span><button className="outline-button" onClick={() => onLoad(item)}>Open</button><button className="delete-plane" onClick={() => onDelete(item.id)} aria-label="Delete saved job"><Trash2 size={15} /></button></div>)}</div>}</div>; }
function Catalog({ catalog, type, setType, form, setForm, onAdd, onDelete }) { const labels = { shingle: 'Shingles', underlayment: 'Underlayment', ice: 'Ice & water', ridge: 'Hip & ridge' }; return <div className="catalog-panel"><div className="catalog-tabs">{Object.keys(labels).map((key) => <button className={type === key ? 'catalog-tab active' : 'catalog-tab'} key={key} onClick={() => setType(key)}>{labels[key]} <span>{catalog[key].length}</span></button>)}</div><div className="catalog-content"><form className="add-product" onSubmit={onAdd}><h2>Add a product</h2><div className="product-form-grid"><input placeholder="Product name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /><input type="number" min="0" step="0.01" placeholder="Price *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /><input type="number" min="0.1" step="0.1" placeholder={type === 'shingle' ? 'Bundles / square' : 'Coverage'} value={form.coverage} onChange={(e) => setForm({ ...form, coverage: e.target.value })} /><button className="primary-button" type="submit"><Plus size={16} /> Add product</button></div><p>Coverage is used by the estimator to calculate order quantities.</p></form><div className="catalog-list">{catalog[type].map((item) => <div className="catalog-item" key={item.id}><div className="product-swatch shingle-swatch" /><div><b>{item.brand ? `${item.brand} · ` : ''}{item.name}</b><span>{item.detail || `${item.packSize} bundles / square`}</span></div><strong>{money(item.price)}</strong><button className="delete-plane" onClick={() => onDelete(type, item.id)} aria-label={`Delete ${item.name}`}><Trash2 size={15} /></button></div>)}</div></div></div>; }
function EmptyState({ icon, title, text, action, onClick }) { return <div className="empty-panel"><div className="empty-icon">{icon}</div><h2>{title}</h2><p>{text}</p><button className="primary-button" onClick={onClick}>{action} <ArrowRight size={16} /></button></div>; }
function ProposalModal({ job, totals, onClose, onSave }) { return <div className="modal-backdrop" onMouseDown={onClose}><div className="proposal-modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-header"><div><span className="estimate-label">PROPOSAL PREVIEW</span><h2>{job.customer || 'Customer proposal'}</h2></div><button className="icon-button" onClick={onClose}><X size={16} /></button></div><div className="proposal-meta"><span><UserRound size={14} /> {job.customer || 'Customer name not entered'}</span><span><MapPin size={14} /> {job.address || 'Address not entered'}</span></div><div className="proposal-total"><span>Project total</span><b>{money(totals.total)}</b></div><p className="proposal-note">This proposal includes measured roofing surface, selected products, installation labor, project costs, tax, and contractor markup. Confirm field conditions before final ordering.</p><div className="modal-actions"><button className="outline-button" onClick={onClose}>Keep editing</button><button className="primary-button" onClick={onSave}><Save size={16} /> Save proposal</button></div></div></div>; }

export default App;

createRoot(document.getElementById('root')).render(<App />);
