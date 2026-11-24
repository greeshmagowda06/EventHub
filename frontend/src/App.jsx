import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, CalendarDays, Ticket, ChartNoAxesCombined, Plus,
  Search, Bell, Settings, UserCircle, Clock3, MapPin, Pencil, Trash2,
  LogOut, X, Menu, Sparkles, ArrowUpRight, CalendarCheck, CheckCircle2
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const sampleEvents = [
  {
    _id: 'demo-1',
    name: 'AI Innovation Summit',
    date: '2026-11-28',
    time: '10:00',
    venue: 'Bengaluru',
    category: 'Technology',
    description: 'Explore the future of artificial intelligence.'
  },
  {
    _id: 'demo-2',
    name: 'Campus Cultural Fest',
    date: '2026-12-05',
    time: '17:00',
    venue: 'Atria University',
    category: 'Cultural',
    description: 'A celebration of music, art and campus life.'
  },
  {
    _id: 'demo-3',
    name: 'Cybersecurity Workshop',
    date: '2026-12-12',
    time: '11:00',
    venue: 'Bengaluru',
    category: 'Workshop',
    description: 'Hands-on learning about application security.'
  }
];

const eventImages = {
  Technology: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85',
  Cultural: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=85',
  Workshop: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=85',
  Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=85',
  Other: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85',
};

const getEventImage = (event) =>
  eventImages[event.category] || eventImages.Other;

const emptyForm = {
  name: '',
  date: '',
  time: '',
  venue: '',
  category: 'Technology',
  description: ''
};

function App() {
  const [token, setToken] = useState(
    localStorage.getItem('eventhub_token') || ''
  );

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('eventhub_user') || 'null')
  );

  const [events, setEvents] = useState(sampleEvents);
  const [apiReady, setApiReady] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = events.filter(e => e.date >= today).length;
  const completed = events.length - upcoming;

  const categoryCounts = useMemo(
    () => ['Technology', 'Cultural', 'Workshop', 'Sports', 'Other'].map(category => ({
      category,
      count: events.filter(e => e.category === category).length
    })),
    [events]
  );

  const visibleEvents = events.filter(e =>
    `${e.name} ${e.category} ${e.venue}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  async function loadEvents(currentToken = token) {
    if (!currentToken) return;

    try {
      const response = await fetch(`${API}/events`, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Could not load events');
      }

      const data = await response.json();

      setEvents(data.events || []);
      setApiReady(true);

    } catch {
      setApiReady(false);
      setNotice(
        'Backend is not connected. Demo events are shown until the backend is running.'
      );
    }
  }

  useEffect(() => {
    if (token) loadEvents(token);
  }, [token]);

  async function handleAuth(e) {
    e.preventDefault();

    try {
      const data = await request(`/auth/${authMode}`, {
        method: 'POST',
        body: JSON.stringify(authForm)
      });

      localStorage.setItem('eventhub_token', data.token);
      localStorage.setItem('eventhub_user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setNotice('Welcome to EventHub!');

    } catch (err) {
      setNotice(err.message);
    }
  }

  function logout() {
    localStorage.removeItem('eventhub_token');
    localStorage.removeItem('eventhub_user');

    setToken('');
    setUser(null);
    setEvents(sampleEvents);
    setApiReady(false);
    setNotice('You have logged out.');
  }

  async function handleSave(e) {
    e.preventDefault();

    try {
      if (!token) {
        throw new Error('Please log in to save events to the database.');
      }

      if (editingId) {
        await request(`/events/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });

        setNotice('Event updated successfully.');

      } else {
        await request('/events', {
          method: 'POST',
          body: JSON.stringify(form)
        });

        setNotice('Event created successfully.');
      }

      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);

      loadEvents();

    } catch (err) {
      setNotice(err.message);
    }
  }

  function editEvent(event) {
    setForm({
      name: event.name,
      date: event.date?.slice(0, 10),
      time: event.time,
      venue: event.venue,
      category: event.category,
      description: event.description || ''
    });

    setEditingId(event._id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  async function deleteEvent(id) {
    if (!window.confirm('Delete this event?')) return;

    try {
      if (!token) {
        throw new Error('Log in to delete database events.');
      }

      await request(`/events/${id}`, {
        method: 'DELETE'
      });

      setNotice('Event deleted.');
      loadEvents();

    } catch (err) {
      setNotice(err.message);
    }
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  if (!token) {
    return (
      <div className="auth-shell">
        <div className="auth-card">

          <div className="brand">
            <span className="brand-mark">E</span>
            {' '}Event<span>Hub</span>
          </div>

          <div className="auth-copy">
            <p className="eyebrow">
              EVENT MANAGEMENT PLATFORM
            </p>

            <h1>
              {authMode === 'login'
                ? 'Welcome back.'
                : 'Create your account.'}
            </h1>

            <p>
              Plan, organize and manage every event in one place.
            </p>
          </div>

          <form onSubmit={handleAuth} className="auth-form">

            {authMode === 'register' && (
              <label>
                Full name
                <input
                  required
                  value={authForm.name}
                  onChange={e =>
                    setAuthForm({
                      ...authForm,
                      name: e.target.value
                    })
                  }
                  placeholder="Your name"
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                required
                value={authForm.email}
                onChange={e =>
                  setAuthForm({
                    ...authForm,
                    email: e.target.value
                  })
                }
                placeholder="you@example.com"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                minLength="8"
                required
                value={authForm.password}
                onChange={e =>
                  setAuthForm({
                    ...authForm,
                    password: e.target.value
                  })
                }
                placeholder="At least 8 characters"
              />
            </label>

            <button className="btn-primary full" type="submit">
              {authMode === 'login'
                ? 'Sign in'
                : 'Create account'}
            </button>

          </form>

          <p className="switch-auth">
            {authMode === 'login'
              ? "Don't have an account?"
              : 'Already registered?'}

            {' '}

            <button
              onClick={() =>
                setAuthMode(
                  authMode === 'login' ? 'register' : 'login'
                )
              }
            >
              {authMode === 'login'
                ? 'Create account'
                : 'Sign in'}
            </button>
          </p>

          {notice && <p className="notice">{notice}</p>}

          <p className="auth-foot">
            EventHub · A secure event management starter
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">

      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>

        <div className="brand">
          <span className="brand-mark">E</span>
          {' '}Event<span>Hub</span>
        </div>

        <div className="side-label">WORKSPACE</div>

        <nav>
          {[
            ['Dashboard', LayoutDashboard],
            ['Events', CalendarDays],
            ['Calendar', CalendarCheck],
            ['Bookings', Ticket],
            ['Analytics', ChartNoAxesCombined]
          ].map(([label, Icon]) => (
            <button
              key={label}
              className={`nav-item ${
                activeNav === label ? 'active' : ''
              }`}
              onClick={() => {
                setActiveNav(label);
                setMobileNav(false);
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="side-label management-label">
          MANAGEMENT
        </div>

        <button className="nav-item" onClick={openCreate}>
          <Plus size={18} />
          <span>Create Event</span>
        </button>

        <div className="sidebar-help">
          <Sparkles size={20} />
          <strong>Make every moment count.</strong>
          <span>Bring your next great event to life.</span>
        </div>

        <button className="nav-item logout" onClick={logout}>
          <LogOut size={18} />
          <span>Log out</span>
        </button>

      </aside>

      <main className="main-area">

        <header className="topbar">

          <button
            className="mobile-menu"
            onClick={() => setMobileNav(!mobileNav)}
          >
            <Menu />
          </button>

          <div>
            <h1>{activeNav}</h1>
            <p>
              Welcome back
              {user?.name
                ? `, ${user.name.split(' ')[0]}`
                : ''}!
              Here's what's happening with your events.
            </p>
          </div>

          <div className="top-actions">

            <div className="searchbox">
              <Search size={17} />

              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search events..."
              />
            </div>

            <button className="icon-btn" aria-label="Notifications">
              <Bell size={18} />
              <i />
            </button>

            <button className="icon-btn" aria-label="Settings">
              <Settings size={18} />
            </button>

            <div className="profile">
              <div className="avatar">
                {user?.name?.[0]?.toUpperCase() || 'G'}
              </div>

              <div>
                <strong>{user?.name || 'Guest'}</strong>
                <small>Member</small>
              </div>
            </div>

          </div>
        </header>

        <div className="content">

          {notice && (
            <div className="notice-bar">
              {notice}
              <button onClick={() => setNotice('')}>
                <X size={16} />
              </button>
            </div>
          )}

          {!apiReady && (
            <div className="demo-banner">
              Preview mode: start the backend and sign in to save events in MongoDB.
            </div>
          )}

          <section className="stats-grid">

            <Stat
              icon={<CalendarDays />}
              label="Total Events"
              value={events.length}
              tone="orange"
              note="All registered events"
            />

            <Stat
              icon={<Clock3 />}
              label="Upcoming Events"
              value={upcoming}
              tone="purple"
              note="Scheduled events"
            />

            <Stat
              icon={<CheckCircle2 />}
              label="Completed Events"
              value={completed}
              tone="blue"
              note="Past events"
            />

          </section>

          {showForm && (
            <section className="panel event-form-panel">

              <div className="panel-heading">
                <div>
                  <h2>
                    {editingId ? 'Edit event' : 'Create a new event'}
                  </h2>
                  <p>Enter the details for your event.</p>
                </div>

                <button
                  className="icon-plain"
                  onClick={() => setShowForm(false)}
                >
                  <X />
                </button>
              </div>

              <form className="event-form" onSubmit={handleSave}>

                <label>
                  Event name
                  <input
                    required
                    maxLength="100"
                    value={form.name}
                    onChange={e =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g. AI Innovation Summit"
                  />
                </label>

                <label>
                  Event date
                  <input
                    type="date"
                    min={today}
                    required
                    value={form.date}
                    onChange={e =>
                      setForm({ ...form, date: e.target.value })
                    }
                  />
                </label>

                <label>
                  Event time
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={e =>
                      setForm({ ...form, time: e.target.value })
                    }
                  />
                </label>

                <label>
                  Venue
                  <input
                    required
                    maxLength="120"
                    value={form.venue}
                    onChange={e =>
                      setForm({ ...form, venue: e.target.value })
                    }
                    placeholder="Enter venue"
                  />
                </label>

                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={e =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {[
                      'Technology',
                      'Cultural',
                      'Workshop',
                      'Sports',
                      'Other'
                    ].map(x => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>

                <label className="wide">
                  Description
                  <textarea
                    rows="3"
                    maxLength="500"
                    value={form.description}
                    onChange={e =>
                      setForm({
                        ...form,
                        description: e.target.value
                      })
                    }
                    placeholder="Tell people about your event"
                  />
                </label>

                <div className="form-actions wide">

                  <button
                    type="button"
                    className="btn-light"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>

                  <button className="btn-primary" type="submit">
                    {editingId ? 'Save changes' : 'Create event'}
                  </button>

                </div>

              </form>
            </section>
          )}

          <section className="dashboard-grid">

            <div className="panel category-panel">

              <div className="panel-heading">
                <div>
                  <h2>Event categories</h2>
                  <p>Distribution of your events</p>
                </div>

                <span className="pill">Overview</span>
              </div>

              <div className="donut-wrap">
                <div
                  className="donut"
                  style={{ '--p': events.length ? 100 : 0 }}
                >
                  <div>
                    <strong>{events.length}</strong>
                    <span>Total events</span>
                  </div>
                </div>
              </div>

              <div className="category-legend">
                {categoryCounts
                  .filter(x => x.count)
                  .map((x, i) => (
                    <div key={x.category}>
                      <span className={`dot dot-${i % 4}`} />
                      {x.category}
                      <strong>{x.count}</strong>
                    </div>
                  ))}
              </div>

            </div>

            <div className="panel overview-panel">

              <div className="panel-heading">
                <div>
                  <h2>Event overview</h2>
                  <p>Your event activity</p>
                </div>

                <span className="pill">All time</span>
              </div>

              <div className="bar-list">
                {categoryCounts.map((x, i) => (
                  <div className="bar-row" key={x.category}>
                    <span>{x.category}</span>

                    <div className="bar-track">
                      <i
                        className={`bar bar-${i % 4}`}
                        style={{
                          width: `${
                            events.length
                              ? Math.max(4, x.count / events.length * 100)
                              : 0
                          }%`
                        }}
                      />
                    </div>

                    <strong>{x.count}</strong>
                  </div>
                ))}
              </div>

              <div className="chart-foot">
                <span>
                  <i className="dot dot-0" />
                  Events by category
                </span>

                <span>{events.length} total events</span>
              </div>

            </div>

            <div className="panel featured-panel">

              <div className="panel-heading">
                <div>
                  <h2>Featured event</h2>
                  <p>Spotlight on what's next</p>
                </div>

                <ArrowUpRight size={18} />
              </div>

              {events[0] ? (
                <div
                  className="featured-art photo-art"
                  style={{
                    backgroundImage: `linear-gradient(180deg,#17152a18,#17152a25),url("${getEventImage(events[0])}")`
                  }}
                >
                  <span>{events[0].category}</span>
                </div>
              ) : (
                <div className="empty-feature">
                  Your next event will appear here.
                </div>
              )}

              {events[0] && (
                <div className="featured-copy">
                  <h3>{events[0].name}</h3>

                  <p>
                    {events[0].description ||
                      'Discover an exciting upcoming event.'}
                  </p>

                  <small>
                    <CalendarDays size={14} />
                    {events[0].date} · {events[0].time}
                  </small>
                </div>
              )}

            </div>

          </section>

          <section className="events-section">

            <div className="section-heading">
              <div>
                <h2>All events</h2>
                <p>Manage and keep track of your events.</p>
              </div>

              <button className="btn-primary" onClick={openCreate}>
                <Plus size={17} />
                Create event
              </button>
            </div>

            <div className="event-grid">

              {visibleEvents.map(event => (
                <article className="event-card" key={event._id}>

                  <div
                    className={`event-art photo-art art-${
                      ['orange', 'purple', 'blue', 'pink'][
                        Math.abs((event.name || '').length) % 4
                      ]
                    }`}
                    style={{
                      backgroundImage: `linear-gradient(180deg,#17152a12,#17152a30),url("${getEventImage(event)}")`
                    }}
                  >
                    <span>{event.category}</span>
                  </div>

                  <div className="event-card-body">

                    <div className="event-date">
                      <CalendarDays size={14} />
                      {event.date}
                    </div>

                    <h3>{event.name}</h3>

                    <p>
                      {event.description ||
                        'An event organized with EventHub.'}
                    </p>

                    <div className="event-meta">
                      <span>
                        <Clock3 size={14} />
                        {event.time}
                      </span>

                      <span>
                        <MapPin size={14} />
                        {event.venue}
                      </span>
                    </div>

                    <div className="card-actions">

                      <button onClick={() => editEvent(event)}>
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        className="danger"
                        onClick={() => deleteEvent(event._id)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>

                    </div>

                  </div>
                </article>
              ))}

              {!visibleEvents.length && (
                <div className="empty-state">
                  <CalendarDays size={30} />
                  <h3>No events found</h3>
                  <p>Create an event or change your search.</p>

                  <button className="btn-primary" onClick={openCreate}>
                    <Plus size={16} />
                    Create event
                  </button>
                </div>
              )}

            </div>
          </section>

          <footer>
            © 2026 EventHub · Atria University Cybersecurity Sprint 1
          </footer>

        </div>
      </main>
    </div>
  );
}

function Stat({ icon, label, value, tone, note }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </div>
  );
}

export default App;