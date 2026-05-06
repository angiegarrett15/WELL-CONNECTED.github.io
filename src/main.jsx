import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Baby,
  BookOpen,
  Car,
  CheckCircle2,
  ClipboardList,
  Database,
  Filter,
  HandHeart,
  HeartPulse,
  Home,
  Landmark,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Wrench,
  XCircle
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'well-connected-mvp-state-v2';

const HEALTH_DOMAINS = ['All Domains', 'Behavioral Health', 'Substance Use', 'Maternal and Child Health', 'Chronic Disease', 'Housing Stability', 'Food Security', 'Transportation', 'Criminal Justice', 'Rural Health', 'Health Care Access', 'Education', 'Employment', 'Environmental Health', 'Community Safety', 'Other'];
const TOPIC_TYPES = ['Health Concern', 'Research Request', 'Resource Need', 'General Discussion'];
const TOPIC_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const TOPIC_DOMAINS = HEALTH_DOMAINS.slice(1);
const COUNTIES = ['All Counties', 'Adams', 'Alcorn', 'Amite', 'Attala', 'Benton', 'Bolivar', 'Calhoun', 'Carroll', 'Chickasaw', 'Choctaw', 'Claiborne', 'Clarke', 'Clay', 'Coahoma', 'Copiah', 'Covington', 'DeSoto', 'Forrest', 'Franklin', 'George', 'Greene', 'Grenada', 'Hancock', 'Harrison', 'Hinds', 'Holmes', 'Humphreys', 'Issaquena', 'Itawamba', 'Jackson', 'Jasper', 'Jefferson', 'Jones', 'Kemper', 'Lafayette', 'Lamar', 'Lauderdale', 'Lawrence', 'Leake', 'Lee', 'Leflore', 'Lincoln', 'Lowndes', 'Madison', 'Marion', 'Marshall', 'Monroe', 'Montgomery', 'Neshoba', 'Newton', 'Noxubee', 'Oktibbeha', 'Panola', 'Pearl River', 'Perry', 'Pike', 'Pontotoc', 'Prentiss', 'Quitman', 'Rankin', 'Scott', 'Sharkey', 'Simpson', 'Smith', 'Stone', 'Sunflower', 'Tallahatchie', 'Tate', 'Tippah', 'Tishomingo', 'Tunica', 'Union', 'Walthall', 'Warren', 'Washington', 'Wayne', 'Webster', 'Wilkinson', 'Winston', 'Yalobusha', 'Yazoo'];

const categoryIcons = {
  Housing: Home,
  'Food & Essentials': HandHeart,
  'Childcare & Family': Baby,
  Transportation: Car,
  'Recovery & Wellness': HeartPulse,
  'Community Skills': Wrench,
  'Research Hub': BookOpen,
  Policy: Landmark,
  Advocacy: ShieldCheck
};

const initialResources = [
  { id: 1, title: 'Emergency Housing Intake', category: 'Housing', description: 'Central intake placeholder for emergency housing, shelter referral, and short-term stabilization needs.', contact: 'housing@example.org', phone: '555-0101', location: 'Jackson Metro', county: 'Hinds', status: 'approved', source: 'Admin seeded', tags: ['shelter', 'utility help', 'stabilization'], notes: 'Verify eligibility, hours, and referral pathway before public launch.' },
  { id: 2, title: 'Community Food Pantry', category: 'Food & Essentials', description: 'Food box and household essentials distribution. Replace with verified local schedule and eligibility details.', contact: 'pantry@example.org', phone: '555-0102', location: 'Hinds County', county: 'Hinds', status: 'approved', source: 'Admin seeded', tags: ['food', 'household goods'], notes: 'Add operating days and documentation requirements.' },
  { id: 3, title: 'Shade Tree Mechanic Referral', category: 'Community Skills', description: 'Community-level service placeholder for low-cost vehicle repair referrals after admin verification.', contact: 'mechanic@example.org', phone: '555-0103', location: 'Byram / South Jackson', county: 'Hinds', status: 'pending', source: 'Participant suggestion', tags: ['transportation', 'local skill', 'repair'], notes: 'Contact provider, confirm pricing, safety, and service boundaries.' },
  { id: 4, title: 'Plain-Language Research Briefs', category: 'Research Hub', description: 'Research findings translated into short community-facing explanations with practical meaning and limitations.', contact: 'research@example.org', phone: '', location: 'Online', county: 'All Counties', status: 'approved', source: 'Admin seeded', tags: ['research translation', 'public health'], notes: 'Add citation fields when backend is connected.' }
];

const initialPolicies = [
  { id: 1, title: 'Beneficial Policy Example', type: 'Beneficial', summary: 'Policies that increase access, reduce stigma, or improve service connection belong here.', status: 'approved' },
  { id: 2, title: 'Harmful Policy Example', type: 'Harmful', summary: 'Policies or practices that create barriers, stigma, unnecessary punishment, or exclusion belong here.', status: 'approved' },
  { id: 3, title: 'Missing Policy Example', type: 'Missing', summary: 'Community needs with no adequate policy, program, or referral pathway belong here.', status: 'pending' }
];

const initialTopics = [
  { id: 1, title: 'Need updated transportation resources', type: 'Resource Need', priority: 'High', domain: 'Transportation', county: 'Hinds', body: 'Community members need reliable low-cost transportation options and repair referrals.', status: 'pending' },
  { id: 2, title: 'Plain-language overdose grief resources', type: 'Research Request', priority: 'Medium', domain: 'Behavioral Health', county: 'All Counties', body: 'Request for plain-language research summaries and support resources for families affected by overdose loss.', status: 'approved' }
];

const categories = Object.keys(categoryIcons);

function loadState() { try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : null; } catch { return null; } }
function EmptyState({ text }) { return <div className='empty-state'>{text}</div>; }

function ResourceCard({ item, isAdmin, onApprove, onReject, onDelete, onUpdate }) {
  const Icon = categoryIcons[item.category] || ClipboardList;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ ...item, tags: item.tags.join(', ') });
  useEffect(() => { setDraft({ ...item, tags: item.tags.join(', ') }); }, [item]);
  function saveEdits() { onUpdate(item.id, { ...draft, tags: draft.tags.split(',').map((tag) => tag.trim()).filter(Boolean) }); setIsEditing(false); }
  if (isEditing) return <article className='resource-card edit-card'><div className='form-grid compact'><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /><select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select><select value={draft.county || 'All Counties'} onChange={(e) => setDraft({ ...draft, county: e.target.value })}>{COUNTIES.map((county) => <option key={county}>{county}</option>)}</select><input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder='Location' /><input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder='Phone' /><input value={draft.contact} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} placeholder='Email/contact' /><input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} placeholder='Tags' /></div><textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /><textarea value={draft.notes || ''} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder='Admin notes' /><div className='actions'><button onClick={saveEdits}><Save size={16} /> Save</button><button className='ghost' onClick={() => setIsEditing(false)}>Cancel</button></div></article>;
  return <article className='resource-card'><div className='resource-topline'><span className={`status ${item.status}`}>{item.status}</span><span className='category-chip'><Icon size={15} /> {item.category}</span></div><h3>{item.title}</h3><p>{item.description}</p><div className='meta-grid'>{item.location && <span><MapPin size={15} /> {item.location}</span>}{item.county && <span><MapPin size={15} /> {item.county}</span>}{item.phone && <span><Phone size={15} /> {item.phone}</span>}{item.contact && <span><Mail size={15} /> {item.contact}</span>}</div><div className='tags'>{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>{isAdmin && item.notes && <p className='admin-note'>Admin note: {item.notes}</p>}{isAdmin && <div className='actions'>{item.status === 'pending' && <button onClick={() => onApprove(item.id)}><CheckCircle2 size={16} /> Approve</button>}{item.status === 'pending' && <button className='danger' onClick={() => onReject(item.id)}><XCircle size={16} /> Reject</button>}<button className='ghost' onClick={() => setIsEditing(true)}>Edit</button><button className='ghost danger-text' onClick={() => onDelete(item.id)}><Trash2 size={16} /> Delete</button></div>}</article>;
}

function SubmissionForm({ onSubmit, activeCategory, isAdmin }) {
  const [form, setForm] = useState({ title: '', category: activeCategory || 'Community Skills', description: '', contact: '', phone: '', location: '', county: 'Hinds', tags: '' });
  const [message, setMessage] = useState('');
  useEffect(() => { if (activeCategory && activeCategory !== 'All') setForm((current) => ({ ...current, category: activeCategory })); }, [activeCategory]);
  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }
  function submit(event) { event.preventDefault(); if (!form.title.trim() || !form.description.trim() || !form.location.trim()) { setMessage('Resource name, location, and description are required.'); return; } if (!form.contact.trim() && !form.phone.trim()) { setMessage('Add at least one contact method so admin can verify the recommendation.'); return; } onSubmit({ ...form, id: Date.now(), title: form.title.trim(), description: form.description.trim(), status: isAdmin ? 'approved' : 'pending', source: isAdmin ? 'Admin added' : 'Participant suggestion', tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean), notes: isAdmin ? 'Added directly by admin.' : 'Needs verification before public display.' }); setForm({ title: '', category: activeCategory || 'Community Skills', description: '', contact: '', phone: '', location: '', county: 'Hinds', tags: '' }); setMessage(isAdmin ? 'Resource added.' : 'Submitted for admin review.'); }
  return <form className='submission-form' onSubmit={submit}><h2>{isAdmin ? 'Add or Seed a Resource' : 'Recommend a Community Resource'}</h2><p>Use this for resources the platform would miss without community knowledge, including informal local services.</p><div className='form-grid'><input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder='Resource name' /><select value={form.category} onChange={(e) => update('category', e.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select><select value={form.county} onChange={(e) => update('county', e.target.value)}>{COUNTIES.map((county) => <option key={county}>{county}</option>)}</select><input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder='Location or service area' /><input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder='Phone number' /><input value={form.contact} onChange={(e) => update('contact', e.target.value)} placeholder='Email or contact method' /><input value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder='Tags, separated by commas' /></div><textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder='What does this resource provide? What should admin verify?' />{message && <p className='form-message'>{message}</p>}<button type='submit'><Plus size={16} /> {isAdmin ? 'Add Resource' : 'Submit for Review'}</button></form>;
}

function TopicBoard({ topics, setTopics, isAdmin }) {
  const [countyFilter, setCountyFilter] = useState('All Counties');
  const [domainFilter, setDomainFilter] = useState('All Domains');
  const [draft, setDraft] = useState({ title: '', type: 'Resource Need', priority: 'Medium', domain: 'Behavioral Health', county: 'Hinds', body: '' });
  function addTopic(event) { event.preventDefault(); if (!draft.title.trim() || !draft.body.trim()) return; setTopics((items) => [{ ...draft, id: Date.now(), status: isAdmin ? 'approved' : 'pending' }, ...items]); setDraft({ title: '', type: 'Resource Need', priority: 'Medium', domain: 'Behavioral Health', county: 'Hinds', body: '' }); }
  function approve(id) { setTopics((items) => items.map((item) => item.id === id ? { ...item, status: 'approved' } : item)); }
  function remove(id) { setTopics((items) => items.filter((item) => item.id !== id)); }
  const visibleTopics = topics.filter((topic) => (isAdmin || topic.status === 'approved') && (countyFilter === 'All Counties' || topic.county === countyFilter || topic.county === 'All Counties') && (domainFilter === 'All Domains' || topic.domain === domainFilter));
  return <section className='panel'><div className='section-heading'><MessageSquare /><div><h2>Community Topics</h2><p>Topics can be routed by type, priority, health domain, and Mississippi county.</p></div></div><form className='inline-form' onSubmit={addTopic}><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder='Topic title' /><select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>{TOPIC_TYPES.map((item) => <option key={item}>{item}</option>)}</select><select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })}>{TOPIC_PRIORITIES.map((item) => <option key={item}>{item}</option>)}</select><select value={draft.domain} onChange={(e) => setDraft({ ...draft, domain: e.target.value })}>{TOPIC_DOMAINS.map((item) => <option key={item}>{item}</option>)}</select><select value={draft.county} onChange={(e) => setDraft({ ...draft, county: e.target.value })}>{COUNTIES.map((item) => <option key={item}>{item}</option>)}</select><input value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder='Describe concern, request, or discussion topic' /><button type='submit'>Add Topic</button></form><div className='toolbar mini'><select value={countyFilter} onChange={(e) => setCountyFilter(e.target.value)}>{COUNTIES.map((county) => <option key={county}>{county}</option>)}</select><select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>{HEALTH_DOMAINS.map((domain) => <option key={domain}>{domain}</option>)}</select></div><div className='brief-grid'>{visibleTopics.length ? visibleTopics.map((topic) => <article className='brief-card' key={topic.id}><div className='resource-topline'><span className={`priority ${topic.priority.toLowerCase()}`}>{topic.priority}</span><span className={`status ${topic.status}`}>{topic.status}</span></div><h3>{topic.title}</h3><p>{topic.body}</p><div className='tags'><span>{topic.type}</span><span>{topic.domain}</span><span>{topic.county}</span></div>{isAdmin && <div className='actions'>{topic.status === 'pending' && <button onClick={() => approve(topic.id)}>Approve</button>}<button className='ghost danger-text' onClick={() => remove(topic.id)}>Delete</button></div>}</article>) : <EmptyState text='No matching topics found.' />}</div></section>;
}

function PolicyBoard({ policies, setPolicies, isAdmin }) {
  const [draft, setDraft] = useState({ title: '', type: 'Beneficial', summary: '' });
  function addPolicy(event) { event.preventDefault(); if (!draft.title.trim() || !draft.summary.trim()) return; setPolicies((items) => [{ ...draft, id: Date.now(), status: isAdmin ? 'approved' : 'pending' }, ...items]); setDraft({ title: '', type: 'Beneficial', summary: '' }); }
  function approve(id) { setPolicies((items) => items.map((item) => item.id === id ? { ...item, status: 'approved' } : item)); }
  function remove(id) { setPolicies((items) => items.filter((item) => item.id !== id)); }
  const visiblePolicies = isAdmin ? policies : policies.filter((policy) => policy.status === 'approved');
  return <section className='panel'><div className='section-heading'><Landmark /><div><h2>Policy Tracker</h2><p>Sort policies into beneficial, harmful, and missing categories for review and community education.</p></div></div><form className='inline-form' onSubmit={addPolicy}><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder='Policy or barrier title' /><select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}><option>Beneficial</option><option>Harmful</option><option>Missing</option></select><input value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} placeholder='Brief description' /><button type='submit'>Add Policy</button></form><div className='policy-grid'>{['Beneficial', 'Harmful', 'Missing'].map((type) => <div className='policy-column' key={type}><h3>{type}</h3>{visiblePolicies.filter((policy) => policy.type === type).map((policy) => <div className='policy-card' key={policy.id}><span className={`status ${policy.status}`}>{policy.status}</span><h4>{policy.title}</h4><p>{policy.summary}</p>{isAdmin && <div className='actions'>{policy.status === 'pending' && <button onClick={() => approve(policy.id)}>Approve</button>}<button className='ghost danger-text' onClick={() => remove(policy.id)}>Delete</button></div>}</div>)}</div>)}</div></section>;
}

function ResearchHub({ isAdmin }) {
  const [briefs, setBriefs] = useState([{ id: 1, title: 'What the research says', text: 'Plain-language summaries should state what was studied, who was studied, what was found, and what the limits are.' }, { id: 2, title: 'Community meaning', text: 'This section turns technical findings into usable information for clinics, communities, and local decision makers.' }, { id: 3, title: 'Evidence upload queue', text: 'Future backend feature: admin uploads briefs, community members request topics, and staff review before publication.' }]);
  const [draft, setDraft] = useState({ title: '', text: '' });
  function addBrief(event) { event.preventDefault(); if (!draft.title.trim() || !draft.text.trim()) return; setBriefs((items) => [{ id: Date.now(), ...draft }, ...items]); setDraft({ title: '', text: '' }); }
  return <section className='panel'><div className='section-heading'><BookOpen /><div><h2>Research Hub</h2><p>Where participants find research findings translated into practical, plain-language public health information.</p></div></div>{isAdmin && <form className='inline-form' onSubmit={addBrief}><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder='Brief title' /><input value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} placeholder='Plain-language research finding' /><button type='submit'>Add Brief</button></form>}<div className='brief-grid'>{briefs.map((brief) => <div className='brief-card' key={brief.id}><h3>{brief.title}</h3><p>{brief.text}</p></div>)}</div></section>;
}

function App() {
  const saved = loadState();
  const [isAdmin, setIsAdmin] = useState(saved?.isAdmin ?? true);
  const [resources, setResources] = useState(saved?.resources ?? initialResources);
  const [policies, setPolicies] = useState(saved?.policies ?? initialPolicies);
  const [topics, setTopics] = useState(saved?.topics ?? initialTopics);
  const [activeCategory, setActiveCategory] = useState(saved?.activeCategory ?? 'All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [countyFilter, setCountyFilter] = useState(saved?.countyFilter ?? 'All Counties');
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ isAdmin, resources, policies, topics, activeCategory, countyFilter })); }, [isAdmin, resources, policies, topics, activeCategory, countyFilter]);
  const filteredResources = useMemo(() => resources.filter((item) => { const participantCanSee = isAdmin || item.status === 'approved'; const categoryMatch = activeCategory === 'All' || item.category === activeCategory; const countyMatch = countyFilter === 'All Counties' || item.county === countyFilter || item.county === 'All Counties'; const pendingMatch = !showPendingOnly || item.status === 'pending'; const haystack = `${item.title} ${item.category} ${item.description} ${item.location} ${item.county || ''} ${item.tags.join(' ')}`.toLowerCase(); const searchMatch = haystack.includes(searchTerm.toLowerCase()); return participantCanSee && categoryMatch && countyMatch && pendingMatch && searchMatch; }), [resources, isAdmin, activeCategory, countyFilter, showPendingOnly, searchTerm]);
  function addResource(resource) { setResources((items) => [resource, ...items]); }
  function approveResource(id) { setResources((items) => items.map((item) => item.id === id ? { ...item, status: 'approved' } : item)); }
  function rejectResource(id) { setResources((items) => items.map((item) => item.id === id ? { ...item, status: 'rejected' } : item)); }
  function deleteResource(id) { setResources((items) => items.filter((item) => item.id !== id)); }
  function updateResource(id, updates) { setResources((items) => items.map((item) => item.id === id ? { ...item, ...updates } : item)); }
  function resetDemoData() { setResources(initialResources); setPolicies(initialPolicies); setTopics(initialTopics); setActiveCategory('All'); setCountyFilter('All Counties'); setSearchTerm(''); setShowPendingOnly(false); }
  const pendingCount = resources.filter((item) => item.status === 'pending').length + policies.filter((item) => item.status === 'pending').length + topics.filter((item) => item.status === 'pending').length;
  const approvedCount = resources.filter((item) => item.status === 'approved').length;
  return <div className='app-shell'><aside className='sidebar'><div className='brand'><div className='brand-mark'>WC</div><div><h1>Well Connected</h1><p>Research, resources, policy, and community knowledge.</p></div></div><button className='role-toggle' onClick={() => setIsAdmin((value) => !value)}><UserCog size={18} /> View: {isAdmin ? 'Admin' : 'Participant'}</button><button className='role-toggle secondary' onClick={resetDemoData}><RotateCcw size={18} /> Reset Demo Data</button><nav><button className={activeCategory === 'All' ? 'active' : ''} onClick={() => setActiveCategory('All')}>All Sections</button>{categories.map((category) => { const Icon = categoryIcons[category]; return <button key={category} className={activeCategory === category ? 'active' : ''} onClick={() => setActiveCategory(category)}><Icon size={17} /> {category}</button>; })}</nav></aside><main className='workspace'><header className='hero'><div><span className='eyebrow'><Megaphone size={16} /> Community-informed public health infrastructure</span><h2>Find resources. Recommend what is missing. Translate research into action.</h2><p>Participants can view approved resources, submit recommendations, and create county-routed topics. Admins can review, approve, reject, edit, and remove community-submitted content.</p></div><div className='stat-card'><strong>{pendingCount}</strong><span>Items waiting for admin review</span></div><div className='stat-card'><strong>{approvedCount}</strong><span>Approved resources visible to participants</span></div></header><section className='system-note'><Database size={18} /> This MVP saves changes in the browser with localStorage. A production release needs Firebase, Supabase, or another backend for shared accounts, secure moderation, and permanent data.</section><section className='toolbar'><label><Search size={18} /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder='Search resources, counties, locations, tags...' /></label><select value={countyFilter} onChange={(e) => setCountyFilter(e.target.value)}>{COUNTIES.map((county) => <option key={county}>{county}</option>)}</select>{isAdmin && <button className={showPendingOnly ? 'active-filter' : ''} onClick={() => setShowPendingOnly((value) => !value)}><Filter size={16} /> Pending Only</button>}</section><SubmissionForm onSubmit={addResource} activeCategory={activeCategory === 'All' ? 'Community Skills' : activeCategory} isAdmin={isAdmin} /><TopicBoard topics={topics} setTopics={setTopics} isAdmin={isAdmin} /><section className='resource-section'><div className='section-heading'><ClipboardList /><div><h2>{activeCategory === 'All' ? 'Resource Directory' : activeCategory}</h2><p>{isAdmin ? 'Admin view includes approved, pending, and rejected content.' : 'Participant view shows approved community resources only.'}</p></div></div><div className='resource-grid'>{filteredResources.length ? filteredResources.map((item) => <ResourceCard key={item.id} item={item} isAdmin={isAdmin} onApprove={approveResource} onReject={rejectResource} onDelete={deleteResource} onUpdate={updateResource} />) : <EmptyState text='No matching resources found.' />}</div></section><PolicyBoard policies={policies} setPolicies={setPolicies} isAdmin={isAdmin} /><ResearchHub isAdmin={isAdmin} /></main></div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
