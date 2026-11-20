import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Crown,
  Users,
  CalendarDays,
  Ticket,
  RefreshCw,
  LogOut,
  Search,
  Phone,
  MessageCircle,
  Mail,
  ExternalLink,
  Copy,
  X,
  Download,
  AlertTriangle,
  ChevronRight,
  Check,
  Ban,
  EyeOff,
  Trash2,
} from "lucide-react";
import {
  adminFetch,
  getToken,
  setToken,
  STATUS,
  USER_STATUS,
  EVENT_STATUS,
  bookingStatus,
  rupees,
  date,
} from "../../admin/adminApi";
import "../../css/Admin.css";

// ==========================================
// SMALL PIECES
// ==========================================

function Pill({ meta }) {
  return <span className={`adm-pill adm-${meta.tone}`}>{meta.label}</span>;
}

function Avatar({ text, image }) {
  const [broken, setBroken] = useState(false);
  if (image && !broken)
    return <img className="adm-avatar adm-avatar-img" src={image} alt="" loading="lazy" onError={() => setBroken(true)} />;
  return <span className="adm-avatar">{(text || "?")[0].toUpperCase()}</span>;
}

function Empty({ children }) {
  return <p className="adm-empty">{children}</p>;
}

// One list row: a card on phones, a table row on desktop
function Row({ row, onOpen, cols }) {
  return (
    <button type="button" className="adm-row" style={{ "--cols": cols }} onClick={onOpen}>
      <Avatar text={row.title} image={row.image} />
      <span className="adm-row-main">
        <strong>{row.title}</strong>
        <small>{row.sub}</small>
      </span>
      {row.cells.map((c, i) => (
        <span key={i} className="adm-cell">
          {c}
        </span>
      ))}
      <span className="adm-cell-pill">
        <Pill meta={row.pill} />
      </span>
      <ChevronRight size={18} className="adm-chev" />
    </button>
  );
}

function ContactActions({ phone, email, extra }) {
  const digits = (phone || "").replace(/\D/g, "");
  const wa = digits.length === 10 ? "91" + digits : digits;
  return (
    <div className="adm-actions">
      {digits && (
        <a className="adm-action" href={`tel:${phone}`}>
          <Phone size={20} /> Call
        </a>
      )}
      {digits && (
        <a className="adm-action" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
          <MessageCircle size={20} /> WhatsApp
        </a>
      )}
      {email && (
        <a className="adm-action" href={`mailto:${email}`}>
          <Mail size={20} /> Email
        </a>
      )}
      {extra}
    </div>
  );
}

function Details({ rows }) {
  return (
    <dl className="adm-details">
      {rows
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
    </dl>
  );
}

// Two-step confirm for anything destructive
function Confirm({ text, yes, onYes, onNo, busy, children }) {
  return (
    <div className="adm-confirm">
      <p>{text}</p>
      {children}
      <div className="adm-confirm-btns">
        <button type="button" className="adm-btn adm-btn-ghost" onClick={onNo} disabled={busy}>
          Go back
        </button>
        <button type="button" className="adm-btn adm-btn-danger" onClick={onYes} disabled={busy}>
          {busy ? "Working…" : yes}
        </button>
      </div>
    </div>
  );
}

// Bottom sheet on phones, side panel on desktop
function Sheet({ onClose, children }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="adm-sheet-grip" />
        <button type="button" className="adm-icon-btn adm-sheet-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

// Loads one item for a sheet
function useItem(path, toast, onClose) {
  const [item, setItem] = useState(null);
  useEffect(() => {
    let alive = true;
    adminFetch(path)
      .then((d) => alive && setItem(d))
      .catch((e) => {
        toast(e.message, true);
        onClose();
      });
    return () => {
      alive = false;
    };
  }, [path, toast, onClose]);
  return [item, setItem];
}

// ==========================================
// GENERIC LIST SCREEN (search + filters + rows + load more + export)
// ==========================================

function ListScreen({ path, filters, segments, headers, toRow, onOpen, reloadKey, toast, initialFilter, exportPath, noun }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState(initialFilter || filters[0][0]);
  const [segment, setSegment] = useState(segments ? segments.options[0][0] : "");
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const timer = useRef();

  useEffect(() => {
    if (initialFilter) setFilter(initialFilter);
  }, [initialFilter]);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams({ status: filter, q, page });
      if (segments) params.set(segments.param, segment);
      try {
        const res = await adminFetch(`${path}?${params}`);
        setData((prev) => (page > 1 ? { ...res, items: [...prev.items, ...res.items] } : res));
      } catch (e) {
        toast(e.message, true);
      } finally {
        setLoading(false);
      }
    },
    [path, filter, q, segment, segments, toast]
  );

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => load(1), 250);
    return () => clearTimeout(timer.current);
  }, [load, reloadKey]);

  const exportCsv = async () => {
    try {
      const params = new URLSearchParams({ status: filter, q });
      if (segments) params.set(segments.param, segment);
      const res = await adminFetch(`${exportPath}?${params}`, { raw: true });
      const url = URL.createObjectURL(await res.blob());
      Object.assign(document.createElement("a"), { href: url, download: "stallora-export.csv" }).click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast(e.message, true);
    }
  };

  const cols = headers.length;

  return (
    <>
      <div className="adm-toolbar">
        <label className="adm-search">
          <Search size={18} />
          <input type="search" placeholder={`Search ${noun}…`} value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="adm-chips" role="tablist">
          {filters.map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={filter === key} className={filter === key ? "on" : ""} onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
        </div>
        {segments && (
          <div className="adm-seg">
            {segments.options.map(([key, label]) => (
              <button key={key} type="button" className={segment === key ? "on" : ""} onClick={() => setSegment(key)}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <section className="adm-card adm-list">
        <div className="adm-card-head">
          <h2>
            {data.total} {data.total === 1 ? noun.replace(/s$/, "") : noun}
          </h2>
          {exportPath && (
            <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={exportCsv}>
              <Download size={16} /> Export
            </button>
          )}
        </div>

        <div className="adm-thead" style={{ "--cols": cols }}>
          <span />
          {["Name", ...headers, "Status"].map((h) => (
            <span key={h}>{h}</span>
          ))}
          <span />
        </div>

        {data.items.map((item) => (
          <Row key={item._id || item.id} row={toRow(item)} cols={cols} onOpen={() => onOpen(item._id || item.id)} />
        ))}
        {!loading && !data.items.length && <Empty>Nothing here yet.</Empty>}
        {loading && <div className="adm-skeleton adm-skeleton-sm" />}
        {!loading && data.page < data.pages && (
          <button type="button" className="adm-btn adm-btn-ghost adm-btn-block" onClick={() => load(data.page + 1)}>
            Load more
          </button>
        )}
      </section>
    </>
  );
}

// ==========================================
// ROW SHAPES
// ==========================================

const memberRow = (m) => ({
  title: m.name || m.email,
  sub: `${m.planName} · ${m.role === "vendor" ? "Vendor" : "Organiser"}${m.currentEnd ? ` · till ${date(m.currentEnd)}` : ""}`,
  cells: [`${m.planName} · ${m.role === "vendor" ? "Vendor" : "Organiser"}`, m.price != null ? `${rupees(m.price)} ${m.period}` : "—", date(m.currentEnd)],
  pill: STATUS[m.status] || { label: m.status, tone: "muted" },
});

const userRow = (u) => ({
  title: u.name,
  sub: `${u.role === "vendor" ? "Vendor" : "Organiser"} · ${u.email}`,
  cells: [u.email, u.role === "vendor" ? "Vendor" : "Organiser", date(u.createdAt)],
  pill: USER_STATUS[u.status],
});

const eventRow = (e) => ({
  title: e.title,
  image: e.image,
  sub: `${e.date || "No date"} · ${e.city || "—"} · ${e.organiserName}`,
  cells: [e.date || "—", e.city || "—", e.organiserName + (e.isDemo ? " (demo)" : "")],
  pill: EVENT_STATUS[e.approvalStatus] || { label: e.approvalStatus, tone: "muted" },
});

const bookingRow = (b) => ({
  title: b.vendorName || b.email,
  sub: `${b.eventTitle}${b.stall?.id ? ` · Stall ${b.stall.id}` : ""} · ${rupees(b.total)}`,
  cells: [b.eventTitle, b.stall?.id ? `Stall ${b.stall.id}` : "Enquiry", rupees(b.total)],
  pill: bookingStatus(b),
});

// ==========================================
// OVERVIEW
// ==========================================

function Overview({ stats, onOpen, go }) {
  if (!stats) return <div className="adm-skeleton" />;
  const tiles = [
    { label: "Active members", value: stats.live, sub: `${stats.organisers} organisers · ${stats.vendors} vendors`, go: ["members", "live"] },
    { label: "Membership revenue", value: rupees(stats.mrr), sub: "per month, estimated", go: ["members", "live"] },
    { label: "Stall bookings paid", value: rupees(stats.bookings?.revenue || 0), sub: `${stats.bookings?.paid || 0} bookings · ${stats.bookings?.thisMonth || 0} new this month`, go: ["bookings", "paid"] },
    { label: "Accounts", value: (stats.users?.vendors || 0) + (stats.users?.organisers || 0), sub: `${stats.users?.vendors || 0} vendors · ${stats.users?.organisers || 0} organisers`, go: ["users", "all"] },
  ];

  const todo = [
    stats.events?.pending > 0 && { text: `${stats.events.pending} event${stats.events.pending > 1 ? "s" : ""} waiting for approval`, go: ["events", "pending"], tone: "warn" },
    stats.issues > 0 && { text: `${stats.issues} membership payment${stats.issues > 1 ? "s" : ""} failing`, go: ["members", "issues"], tone: "bad" },
  ].filter(Boolean);

  return (
    <>
      <div className="adm-tiles">
        {tiles.map((t) => (
          <button key={t.label} type="button" className="adm-tile" onClick={() => go(...t.go)}>
            <span>{t.label}</span>
            <strong>{t.value}</strong>
            <small>{t.sub}</small>
          </button>
        ))}
      </div>

      {todo.length > 0 && (
        <section className="adm-card adm-todo">
          <h2>
            <AlertTriangle size={18} /> To do
          </h2>
          {todo.map((t) => (
            <button key={t.text} type="button" className={`adm-todo-item adm-todo-${t.tone}`} onClick={() => go(...t.go)}>
              {t.text}
              <ChevronRight size={18} />
            </button>
          ))}
        </section>
      )}

      <div className="adm-two">
        <div className="adm-col">
          {stats.attention.length > 0 && (
            <section className="adm-card adm-card-alert">
              <h2>
                <AlertTriangle size={18} /> Failed membership payments
              </h2>
              <p className="adm-muted">Contact the member or cancel their plan.</p>
              {stats.attention.map((m) => (
                <Row key={m.id} row={memberRow(m)} cols={0} onOpen={() => onOpen("member", m.id)} />
              ))}
            </section>
          )}
          <section className="adm-card">
            <h2>Latest members</h2>
            {stats.recent.length ? stats.recent.map((m) => <Row key={m.id} row={memberRow(m)} cols={0} onOpen={() => onOpen("member", m.id)} />) : <Empty>No paid members yet.</Empty>}
          </section>
        </div>

        <div className="adm-col">
          <section className="adm-card">
            <h2>Membership plans</h2>
            <div className="adm-plans">
              {stats.plans.map((p) => (
                <div key={p.key} className="adm-plan">
                  <div>
                    <strong>{p.name}</strong>
                    <small>
                      {p.role === "vendor" ? "Vendor" : "Organiser"} · {p.price == null ? <em>plan id missing in .env</em> : `${rupees(p.price)} ${p.period}`}
                    </small>
                  </div>
                  <span className="adm-plan-count">{p.members}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="adm-card">
            <h2>Events</h2>
            <div className="adm-plans">
              <button type="button" className="adm-plan adm-plan-link" onClick={() => go("events", "approved")}>
                <div>
                  <strong>Live on the site</strong>
                </div>
                <span className="adm-plan-count">{stats.events?.live || 0}</span>
              </button>
              <button type="button" className="adm-plan adm-plan-link" onClick={() => go("events", "pending")}>
                <div>
                  <strong>Waiting for approval</strong>
                </div>
                <span className="adm-plan-count">{stats.events?.pending || 0}</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

// ==========================================
// DETAIL SHEETS
// ==========================================

function MemberSheet({ id, onClose, onChanged, toast }) {
  const [m, setM] = useItem(`/subscriptions/${id}`, toast, onClose);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const cancel = async () => {
    setBusy(true);
    try {
      const updated = await adminFetch(`/subscriptions/${id}/cancel`, { method: "POST", body: JSON.stringify({ immediately: confirm === "now" }) });
      setM((prev) => ({ ...prev, ...updated }));
      setConfirm(null);
      toast(confirm === "now" ? "Subscription cancelled" : "Will cancel at end of paid period");
      onChanged();
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusy(false);
    }
  };

  if (!m) return <div className="adm-skeleton" />;
  const canCancel = ["active", "authenticated", "pending", "halted", "created"].includes(m.status);

  return (
    <>
      <div className="adm-sheet-head">
        <Avatar text={m.name || m.email} />
        <div>
          <h2>{m.name || "No name"}</h2>
          <p className="adm-muted">
            {m.planName} · {m.role === "vendor" ? "Vendor" : "Organiser"}
          </p>
          <Pill meta={STATUS[m.status] || { label: m.status, tone: "muted" }} />
        </div>
      </div>

      <ContactActions
        phone={m.phone}
        email={m.email}
        extra={
          <a className="adm-action" href={`https://dashboard.razorpay.com/app/subscriptions/${m.id}`} target="_blank" rel="noreferrer">
            <ExternalLink size={20} /> Razorpay
          </a>
        }
      />

      <Details
        rows={[
          ["Email", m.email],
          ["Phone", m.phone || "—"],
          ["Price", m.price != null ? `${rupees(m.price)} ${m.period}` : "—"],
          [m.status === "active" ? "Renews on" : "Paid until", date(m.currentEnd)],
          ["Payments made", m.paidCount],
          ["Joined", date(m.createdAt)],
          ["Cancelled", m.cancelledAt ? `${date(m.cancelledAt)} by ${m.cancelledBy}` : ""],
          [
            "Razorpay ID",
            <button key="c" type="button" className="adm-copy" onClick={() => navigator.clipboard?.writeText(m.id).then(() => toast("Copied"))}>
              {m.id} <Copy size={14} />
            </button>,
          ],
        ]}
      />

      <h3 className="adm-sub">Payment history</h3>
      {m.payments?.length ? (
        <ul className="adm-payments">
          {m.payments.map((p, i) => (
            <li key={i}>
              <span>{date(p.date)}</span>
              <strong>{rupees(p.amount)}</strong>
              <Pill meta={p.status === "paid" ? { label: "Paid", tone: "good" } : p.status === "issued" ? { label: "Due", tone: "warn" } : { label: p.status, tone: "muted" }} />
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No payments yet.</Empty>
      )}

      {canCancel && (
        <div className="adm-danger">
          {!confirm ? (
            <>
              {m.status === "active" && (
                <button type="button" className="adm-btn adm-btn-ghost adm-btn-block" onClick={() => setConfirm("end")}>
                  Cancel at end of paid period
                </button>
              )}
              <button type="button" className="adm-btn adm-btn-danger-ghost adm-btn-block" onClick={() => setConfirm("now")}>
                Cancel immediately
              </button>
            </>
          ) : (
            <Confirm
              text={confirm === "now" ? "Stop this membership now? No more charges, and it ends today." : `Stop renewing? They keep access until ${date(m.currentEnd)}, then no more charges.`}
              yes="Yes, cancel"
              onYes={cancel}
              onNo={() => setConfirm(null)}
              busy={busy}
            />
          )}
        </div>
      )}
    </>
  );
}

function UserSheet({ id, onClose, onChanged, toast, onOpen }) {
  const [u, setU] = useItem(`/users/${id}`, toast, onClose);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const setStatus = async (status) => {
    setBusy(true);
    try {
      const updated = await adminFetch(`/users/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setU((prev) => ({ ...prev, ...updated }));
      setConfirm(false);
      toast(status === "blocked" ? "Account blocked" : "Account unblocked");
      onChanged();
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusy(false);
    }
  };

  if (!u) return <div className="adm-skeleton" />;

  return (
    <>
      <div className="adm-sheet-head">
        <Avatar text={u.name} />
        <div>
          <h2>{u.name}</h2>
          <p className="adm-muted">
            {u.role === "vendor" ? "Vendor" : "Organiser"}
            {u.company && ` · ${u.company}`}
          </p>
          <Pill meta={USER_STATUS[u.status]} />
        </div>
      </div>

      <ContactActions phone={u.phone} email={u.email} />

      <Details
        rows={[
          ["Email", u.email],
          ["Phone", u.phone || "—"],
          ["Membership", u.membership ? `${u.membership.name} · till ${date(u.membership.expiresAt)}` : "None"],
          ["Location", u.location],
          ["Website", u.website],
          ["Instagram", u.instagram],
          ["Joined", date(u.createdAt)],
          ["Last login", date(u.lastLoginAt)],
        ]}
      />

      {u.events?.length > 0 && (
        <>
          <h3 className="adm-sub">Events ({u.events.length})</h3>
          {u.events.map((e) => (
            <Row key={e.id} row={eventRow(e)} cols={0} onOpen={() => onOpen("event", e._id)} />
          ))}
        </>
      )}

      {u.bookings?.length > 0 && (
        <>
          <h3 className="adm-sub">{u.role === "vendor" ? "Bookings" : "Vendor requests"} ({u.bookings.length})</h3>
          {u.bookings.map((b) => (
            <Row key={b.id} row={bookingRow(b)} cols={0} onOpen={() => onOpen("booking", b.id)} />
          ))}
        </>
      )}

      <div className="adm-danger">
        {u.status === "blocked" ? (
          <button type="button" className="adm-btn adm-btn-primary adm-btn-block" onClick={() => setStatus("active")} disabled={busy}>
            <Check size={18} /> Unblock account
          </button>
        ) : !confirm ? (
          <button type="button" className="adm-btn adm-btn-danger-ghost adm-btn-block" onClick={() => setConfirm(true)}>
            <Ban size={18} /> Block account
          </button>
        ) : (
          <Confirm text="Block this account? They won't be able to log in until you unblock them." yes="Yes, block" onYes={() => setStatus("blocked")} onNo={() => setConfirm(false)} busy={busy} />
        )}
      </div>
    </>
  );
}

function EventSheet({ id, onClose, onChanged, toast }) {
  const [data, setData] = useItem(`/events/${id}`, toast, onClose);
  const [confirm, setConfirm] = useState(null); // "reject" | "delete"
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const setStatus = async (status) => {
    setBusy(true);
    try {
      const updated = await adminFetch(`/events/${id}`, { method: "PATCH", body: JSON.stringify({ status, reason }) });
      setData((prev) => ({ ...prev, event: updated }));
      setConfirm(null);
      toast({ approved: "Event is live", rejected: "Event rejected", hidden: "Event hidden from the site", pending: "Moved back to review" }[status]);
      onChanged();
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await adminFetch(`/events/${id}`, { method: "DELETE" });
      toast("Event deleted");
      onChanged();
      onClose();
    } catch (e) {
      toast(e.message, true);
      setBusy(false);
    }
  };

  if (!data) return <div className="adm-skeleton" />;
  const e = data.event;
  const d = data.details;
  const paid = data.bookings?.find((b) => b._id === "paid");
  const stallsLeft = d.stalls.filter((s) => s.available).length;

  return (
    <>
      {e.image && <img className="adm-cover" src={e.image} alt="" onError={(ev) => (ev.currentTarget.style.display = "none")} />}
      <div className="adm-sheet-head adm-sheet-head-plain">
        <div>
          <h2>{e.title}</h2>
          <p className="adm-muted">
            by {e.organiserName}
            {e.isDemo && " · demo event"}
          </p>
          <Pill meta={EVENT_STATUS[e.approvalStatus]} />
        </div>
      </div>

      <ContactActions
        phone={e.contactPhone}
        email={e.contactEmail}
        extra={
          e.approvalStatus === "approved" && (
            <a className="adm-action" href={`/event/${e.id}`} target="_blank" rel="noreferrer">
              <ExternalLink size={20} /> View
            </a>
          )
        }
      />

      <Details
        rows={[
          ["Date", [e.date, e.time].filter(Boolean).join(" · ")],
          ["Venue", e.venue],
          ["Address", e.address],
          ["City", [e.city, e.state].filter(Boolean).join(", ")],
          ["Category", (e.category || []).join(", ")],
          ["Stall price", e.price != null ? `from ${rupees(e.price)}` : ""],
          ["Stalls", `${stallsLeft} of ${d.stalls.length} available`],
          ["Paid bookings", paid ? `${paid.n} · ${rupees(paid.paid)}` : "0"],
          ["Submitted", date(e.createdAt)],
          ["Rejection reason", e.approvalStatus === "rejected" ? e.rejectionReason : ""],
        ]}
      />

      {e.description && (
        <>
          <h3 className="adm-sub">Description</h3>
          <p className="adm-text">{e.description}</p>
        </>
      )}

      <div className="adm-danger">
        {confirm === "reject" ? (
          <Confirm text="Reject this event? The organiser will see it as rejected." yes="Reject event" onYes={() => setStatus("rejected")} onNo={() => setConfirm(null)} busy={busy}>
            <input className="adm-input" placeholder="Reason (optional, shown to organiser)" value={reason} onChange={(ev) => setReason(ev.target.value)} />
          </Confirm>
        ) : confirm === "delete" ? (
          <Confirm text="Delete this event permanently? This can't be undone." yes="Delete" onYes={remove} onNo={() => setConfirm(null)} busy={busy} />
        ) : (
          <>
            {e.approvalStatus !== "approved" && (
              <button type="button" className="adm-btn adm-btn-primary adm-btn-block" onClick={() => setStatus("approved")} disabled={busy}>
                <Check size={18} /> {e.approvalStatus === "hidden" ? "Show on site again" : "Approve & publish"}
              </button>
            )}
            <div className="adm-btn-row">
              {e.approvalStatus === "pending" && (
                <button type="button" className="adm-btn adm-btn-danger-ghost" onClick={() => setConfirm("reject")}>
                  <X size={18} /> Reject
                </button>
              )}
              {e.approvalStatus === "approved" && (
                <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setStatus("hidden")} disabled={busy}>
                  <EyeOff size={18} /> Hide from site
                </button>
              )}
              <button type="button" className="adm-btn adm-btn-danger-ghost" onClick={() => setConfirm("delete")}>
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function BookingSheet({ id, onClose, onChanged, toast }) {
  const [b, setB] = useItem(`/bookings/${id}`, toast, onClose);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const setStatus = async (status) => {
    setBusy(true);
    try {
      const updated = await adminFetch(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setB((prev) => ({ ...prev, ...updated }));
      setConfirm(false);
      toast(`Booking ${status}`);
      onChanged();
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusy(false);
    }
  };

  if (!b) return <div className="adm-skeleton" />;

  return (
    <>
      <div className="adm-sheet-head">
        <Avatar text={b.vendorName || b.email} />
        <div>
          <h2>{b.vendorName}</h2>
          <p className="adm-muted">{b.businessName || "No brand name"}</p>
          <Pill meta={bookingStatus(b)} />
        </div>
      </div>

      <ContactActions
        phone={b.phone}
        email={b.email}
        extra={
          b.razorpayPaymentId && (
            <a className="adm-action" href={`https://dashboard.razorpay.com/app/payments/${b.razorpayPaymentId}`} target="_blank" rel="noreferrer">
              <ExternalLink size={20} /> Payment
            </a>
          )
        }
      />

      <Details
        rows={[
          ["Event", b.eventTitle],
          ["Event date", b.eventDate],
          ["Type", b.kind === "booking" ? `Stall ${b.stall?.id} · ${b.stall?.type}${b.stall?.size ? ` (${b.stall.size})` : ""}` : "Enquiry (no stall picked)"],
          ["Category", b.category],
          ["Products", b.products],
          ["Stall price", rupees(b.originalPrice)],
          ["Discount", b.discountAmount ? `− ${rupees(b.discountAmount)}${b.membershipName ? ` (${b.membershipName} member)` : ""}` : ""],
          ["Booking fee", b.bookingFee ? rupees(b.bookingFee) : ""],
          ["Total", rupees(b.total)],
          ["Paid", b.amountPaid ? `${rupees(b.amountPaid)} on ${date(b.paidAt)}` : "Nothing yet"],
          ["Still due", b.remainingAmount ? rupees(b.remainingAmount) : ""],
          ["Requested", date(b.createdAt)],
          ["Note", b.note],
        ]}
      />

      {!["cancelled", "rejected"].includes(b.status) && (
        <div className="adm-danger">
          {confirm ? (
            <Confirm
              text={b.paymentStatus === "paid" ? "Reject this paid booking? Remember to refund them from the Razorpay dashboard." : "Reject this request?"}
              yes="Reject"
              onYes={() => setStatus("rejected")}
              onNo={() => setConfirm(false)}
              busy={busy}
            />
          ) : (
            <>
              {b.status !== "approved" && (
                <button type="button" className="adm-btn adm-btn-primary adm-btn-block" onClick={() => setStatus("approved")} disabled={busy}>
                  <Check size={18} /> Approve
                </button>
              )}
              <button type="button" className="adm-btn adm-btn-danger-ghost adm-btn-block" onClick={() => setConfirm(true)}>
                <X size={18} /> Reject
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ==========================================
// PANEL
// ==========================================

const TABS = [
  ["overview", "Overview", LayoutDashboard],
  ["members", "Members", Crown],
  ["events", "Events", CalendarDays],
  ["bookings", "Bookings", Ticket],
  ["users", "Accounts", Users],
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [initialFilter, setInitialFilter] = useState(null);
  const [stats, setStats] = useState(null);
  const [open, setOpen] = useState(null); // { kind, id }
  const [syncing, setSyncing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [note, setNote] = useState(null);
  const noteTimer = useRef();

  const toast = useCallback((text, bad = false) => {
    clearTimeout(noteTimer.current);
    setNote({ text, bad });
    noteTimer.current = setTimeout(() => setNote(null), 2800);
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    adminFetch("/stats")
      .then(setStats)
      .catch((e) => toast(e.message, true));
  }, [toast, reloadKey]);

  const closeSheet = useCallback(() => setOpen(null), []);
  const changed = useCallback(() => setReloadKey((k) => k + 1), []);
  const openItem = useCallback((kind, id) => setOpen({ kind, id }), []);

  if (!getToken()) return <Navigate to="/admin/login" replace />;

  const sync = async () => {
    setSyncing(true);
    try {
      const r = await adminFetch("/sync", { method: "POST" });
      toast(`Updated ${r.updated} of ${r.checked} memberships from Razorpay`);
      changed();
    } catch (e) {
      toast(e.message, true);
    } finally {
      setSyncing(false);
    }
  };

  const logout = () => {
    setToken(null);
    navigate("/admin/login", { replace: true });
  };

  const go = (t, filter) => {
    setInitialFilter(filter || null);
    setTab(t);
    window.scrollTo(0, 0);
  };

  const badge = { members: stats?.issues, events: stats?.events?.pending };
  const shared = { reloadKey, toast, initialFilter };

  return (
    <div className="adm adm-shell">
      <aside className="adm-side">
        <div className="adm-brand">
          Stallora<span>Admin</span>
        </div>
        <nav className="adm-nav">
          {TABS.map(([key, label, Icon]) => (
            <button key={key} type="button" className={tab === key ? "on" : ""} onClick={() => go(key)}>
              <Icon size={20} /> <span>{label}</span>
              {badge[key] > 0 && <i className="adm-dot">{badge[key]}</i>}
            </button>
          ))}
        </nav>
        <button type="button" className="adm-side-logout" onClick={logout}>
          <LogOut size={18} /> Log out
        </button>
      </aside>

      <div className="adm-main">
        <header className="adm-top">
          <h1>{TABS.find((t) => t[0] === tab)[1]}</h1>
          <div className="adm-top-btns">
            <button type="button" className="adm-icon-btn" onClick={sync} disabled={syncing} aria-label="Refresh from Razorpay" title="Refresh memberships from Razorpay">
              <RefreshCw size={20} className={syncing ? "adm-spin" : ""} />
            </button>
            <button type="button" className="adm-icon-btn adm-top-logout" onClick={logout} aria-label="Log out" title="Log out">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="adm-content">
          {tab === "overview" && <Overview stats={stats} onOpen={openItem} go={go} />}
          {tab === "members" && (
            <ListScreen
              key="members"
              {...shared}
              noun="members"
              path="/subscriptions"
              exportPath="/export.csv"
              filters={[["live", "Active"], ["issues", "Payment issues"], ["unpaid", "Not paid"], ["ended", "Ended"], ["all", "All"]]}
              segments={{ param: "role", options: [["all", "Everyone"], ["organiser", "Organisers"], ["vendor", "Vendors"]] }}
              headers={["Plan", "Price", "Paid until"]}
              toRow={memberRow}
              onOpen={(id) => openItem("member", id)}
            />
          )}
          {tab === "events" && (
            <ListScreen
              key="events"
              {...shared}
              noun="events"
              path="/events"
              filters={[["pending", "Needs approval"], ["approved", "Live"], ["rejected", "Rejected"], ["hidden", "Hidden"], ["all", "All"]]}
              segments={{ param: "demo", options: [["show", "All events"], ["hide", "Hide demo events"]] }}
              headers={["Date", "City", "Organiser"]}
              toRow={eventRow}
              onOpen={(id) => openItem("event", id)}
            />
          )}
          {tab === "bookings" && (
            <ListScreen
              key="bookings"
              {...shared}
              noun="bookings"
              path="/bookings"
              filters={[["all", "All"], ["paid", "Paid"], ["pending", "Waiting"], ["approved", "Approved"], ["awaiting", "Not paid"], ["rejected", "Rejected"]]}
              headers={["Event", "Stall", "Total"]}
              toRow={bookingRow}
              onOpen={(id) => openItem("booking", id)}
            />
          )}
          {tab === "users" && (
            <ListScreen
              key="users"
              {...shared}
              noun="accounts"
              path="/users"
              filters={[["all", "All"], ["active", "Active"], ["blocked", "Blocked"]]}
              segments={{ param: "role", options: [["all", "Everyone"], ["vendor", "Vendors"], ["organiser", "Organisers"]] }}
              headers={["Email", "Type", "Joined"]}
              toRow={userRow}
              onOpen={(id) => openItem("user", id)}
            />
          )}
        </main>
      </div>

      {open && (
        <Sheet onClose={closeSheet}>
          {open.kind === "member" && <MemberSheet key={open.id} id={open.id} onClose={closeSheet} onChanged={changed} toast={toast} />}
          {open.kind === "user" && <UserSheet key={open.id} id={open.id} onClose={closeSheet} onChanged={changed} toast={toast} onOpen={openItem} />}
          {open.kind === "event" && <EventSheet key={open.id} id={open.id} onClose={closeSheet} onChanged={changed} toast={toast} />}
          {open.kind === "booking" && <BookingSheet key={open.id} id={open.id} onClose={closeSheet} onChanged={changed} toast={toast} />}
        </Sheet>
      )}

      {note && (
        <div className={`adm-toast ${note.bad ? "adm-toast-bad" : ""}`} role="status">
          {note.text}
        </div>
      )}
    </div>
  );
}
