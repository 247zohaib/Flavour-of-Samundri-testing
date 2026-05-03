import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LogOut,
  RefreshCw,
  Phone,
  MapPin,
  Bike,
  Store,
  Mail,
  TrendingUp,
  ShoppingBag,
  Clock,
  Inbox,
  Download,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "ready_for_pickup", label: "Ready for Pickup" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS = {
  pending: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  confirmed: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  preparing: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  out_for_delivery: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  ready_for_pickup: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-300 border-red-500/30",
};

const fmtMoney = (v) => `Rs ${(v || 0).toLocaleString("en-PK")}`;
const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const StatCard = ({ icon: Icon, label, value, sub, testid }) => (
  <div data-testid={testid} className="chalk-card p-6">
    <div className="flex items-center justify-between">
      <div>
        <div className="section-eyebrow mb-1">{label}</div>
        <div className="font-heading text-5xl text-white">{value}</div>
        {sub && <div className="font-body text-xs text-white/50 mt-1">{sub}</div>}
      </div>
      <Icon className="text-[#D97706]" size={28} />
    </div>
  </div>
);

const OrderCard = ({ order, onUpdateStatus }) => {
  const [busy, setBusy] = useState(false);
  const handleChange = async (e) => {
    const status = e.target.value;
    if (status === order.status) return;
    setBusy(true);
    try {
      await onUpdateStatus(order.id, status);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div data-testid={`admin-order-${order.id}`} className="chalk-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="font-body text-xs text-white/45 tracking-wide">
            #{order.id.slice(0, 8)} • {fmtDate(order.created_at)}
          </div>
          <div className="font-heading text-3xl text-white mt-1">{order.customer_name}</div>
          <div className="flex flex-wrap items-center gap-3 text-sm font-body text-white/70 mt-2">
            <span className="inline-flex items-center gap-1">
              <Phone size={14} className="text-[#D97706]" /> {order.phone}
            </span>
            <span className="inline-flex items-center gap-1">
              {order.order_type === "pickup" ? (
                <><Store size={14} className="text-[#D97706]" /> Pickup</>
              ) : (
                <><Bike size={14} className="text-[#D97706]" /> Delivery</>
              )}
            </span>
            {order.address && (
              <span className="inline-flex items-start gap-1">
                <MapPin size={14} className="text-[#D97706] mt-0.5" /> {order.address}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="font-heading text-3xl text-[#F59E0B]">{fmtMoney(order.total)}</div>
          <select
            data-testid={`admin-order-status-${order.id}`}
            value={order.status}
            onChange={handleChange}
            disabled={busy}
            className={`text-xs uppercase tracking-[0.15em] font-semibold px-3 py-1.5 border rounded-sm bg-transparent ${
              STATUS_COLORS[order.status] || "border-white/20 text-white/70"
            }`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#1a1a1a] text-white">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="border-t border-white/10 pt-4">
        <div className="section-eyebrow mb-2">Items</div>
        <ul className="space-y-1 font-body text-sm text-white/80">
          {order.items.map((it, idx) => (
            <li key={idx} className="flex items-center justify-between">
              <span>
                {it.name} <span className="text-white/45">× {it.quantity}</span>
              </span>
              <span className="text-white/70">{fmtMoney(it.price * it.quantity)}</span>
            </li>
          ))}
        </ul>
        {order.notes && (
          <p className="font-body text-xs text-white/55 mt-3 border-l-2 border-white/15 pl-3">
            <span className="text-white/75">Notes:</span> {order.notes}
          </p>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, logout, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("orders");
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const headers = useMemo(() => authHeaders(), [authHeaders]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, o, m] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers }),
        axios.get(`${API}/admin/orders`, { headers }),
        axios.get(`${API}/admin/messages`, { headers }),
      ]);
      setStats(s.data);
      setOrders(o.data);
      setMessages(m.data);
    } catch (e) {
      if (e.response?.status === 401) {
        toast.error("Session expired. Please sign in.");
        logout();
        navigate("/admin/login");
      } else {
        toast.error("Failed to load dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await axios.patch(
        `${API}/admin/orders/${id}`,
        { status },
        { headers }
      );
      setOrders((prev) => prev.map((o) => (o.id === id ? res.data : o)));
      toast.success(`Order updated to ${status.replace(/_/g, " ")}.`);
      // refresh stats
      axios.get(`${API}/admin/stats`, { headers }).then((r) => setStats(r.data)).catch(() => {});
    } catch (e) {
      toast.error("Could not update order.");
    }
  };

  const markMessageRead = async (id) => {
    try {
      await axios.patch(`${API}/admin/messages/${id}/read`, {}, { headers });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
    } catch {}
  };

  const filteredOrders = useMemo(
    () => (statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter)),
    [orders, statusFilter]
  );

  const exportCSV = () => {
    const rows = [
      ["Order ID", "Date", "Customer", "Phone", "Type", "Address", "Items", "Total (PKR)", "Status"],
      ...orders.map((o) => [
        o.id,
        o.created_at,
        o.customer_name,
        o.phone,
        o.order_type,
        o.address || "",
        o.items.map((i) => `${i.name} x${i.quantity}`).join("; "),
        o.total,
        o.status,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flavors-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#111] chalk-bg chalk-noise">
      {/* top bar */}
      <header className="sticky top-0 z-40 bg-[#0e0e0e]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div>
            <div className="section-eyebrow">Owner Portal</div>
            <h1 className="font-heading text-3xl text-white leading-none">
              Flavors of Samundri
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              data-testid="admin-refresh"
              onClick={fetchAll}
              className="inline-flex items-center justify-center w-10 h-10 border border-white/20 hover:border-white/50 text-white/80"
              aria-label="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              data-testid="admin-export-csv"
              onClick={exportCSV}
              className="hidden sm:inline-flex items-center gap-2 px-4 h-10 border border-white/20 hover:border-[#D97706] hover:text-[#F59E0B] text-white/85 text-xs uppercase tracking-[0.2em]"
            >
              <Download size={14} /> Export CSV
            </button>
            <span className="hidden sm:block font-body text-xs text-white/55">{user?.email}</span>
            <button
              data-testid="admin-logout"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 h-10 border border-white/20 hover:border-[#C53030] hover:text-[#C53030] text-white/85 text-xs uppercase tracking-[0.2em]"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            testid="stat-revenue"
            icon={TrendingUp}
            label="Total Revenue"
            value={fmtMoney(stats?.total_revenue)}
            sub={`${stats?.total_orders || 0} orders all time`}
          />
          <StatCard
            testid="stat-today"
            icon={Clock}
            label="Today"
            value={fmtMoney(stats?.today_revenue)}
            sub={`${stats?.today_orders || 0} orders today`}
          />
          <StatCard
            testid="stat-pending"
            icon={ShoppingBag}
            label="Pending"
            value={stats?.by_status?.pending || 0}
            sub="awaiting confirmation"
          />
          <StatCard
            testid="stat-messages"
            icon={Inbox}
            label="Unread Messages"
            value={stats?.unread_messages || 0}
            sub="from contact form"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/10">
          {[
            { id: "orders", label: `Orders (${orders.length})` },
            { id: "messages", label: `Messages (${messages.length})` },
          ].map((t) => (
            <button
              key={t.id}
              data-testid={`admin-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 font-body text-xs uppercase tracking-[0.25em] border-b-2 transition-colors ${
                tab === t.id
                  ? "border-[#D97706] text-white"
                  : "border-transparent text-white/55 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "orders" && (
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="section-eyebrow">Filter</span>
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 text-xs uppercase tracking-[0.2em] border ${
                  statusFilter === "all"
                    ? "bg-[#D97706] border-[#D97706] text-black"
                    : "border-white/20 text-white/70 hover:border-white/50"
                }`}
              >
                All
              </button>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  data-testid={`admin-filter-${s.value}`}
                  onClick={() => setStatusFilter(s.value)}
                  className={`px-3 py-1.5 text-xs uppercase tracking-[0.2em] border ${
                    statusFilter === s.value
                      ? "bg-[#D97706] border-[#D97706] text-black"
                      : "border-white/20 text-white/70 hover:border-white/50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="font-body text-white/55 text-center py-10">Loading orders…</p>
            ) : filteredOrders.length === 0 ? (
              <div className="chalk-card p-12 text-center">
                <ShoppingBag className="mx-auto text-white/35" size={36} />
                <p className="font-heading text-3xl text-white/85 mt-3">No orders to show.</p>
                <p className="font-body text-white/55">Orders will appear here as customers place them.</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-5">
                {filteredOrders.map((o) => (
                  <OrderCard key={o.id} order={o} onUpdateStatus={updateOrderStatus} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "messages" && (
          <div>
            {loading ? (
              <p className="font-body text-white/55 text-center py-10">Loading messages…</p>
            ) : messages.length === 0 ? (
              <div className="chalk-card p-12 text-center">
                <Mail className="mx-auto text-white/35" size={36} />
                <p className="font-heading text-3xl text-white/85 mt-3">Inbox is empty.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m) => (
                  <div key={m.id} data-testid={`admin-message-${m.id}`} className="chalk-card p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="font-body text-xs text-white/45">{fmtDate(m.created_at)}</div>
                        <div className="font-heading text-3xl text-white mt-1">{m.name}</div>
                        <div className="font-body text-sm text-white/70 mt-1">
                          <a href={`mailto:${m.email}`} className="hover:text-[#F59E0B]">{m.email}</a>
                          {m.phone && <span className="ml-3">• {m.phone}</span>}
                        </div>
                      </div>
                      {!m.read ? (
                        <button
                          data-testid={`admin-message-mark-read-${m.id}`}
                          onClick={() => markMessageRead(m.id)}
                          className="px-3 py-1.5 text-xs uppercase tracking-[0.2em] border border-[#D97706] text-[#F59E0B] hover:bg-[#D97706] hover:text-black"
                        >
                          Mark read
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 text-xs uppercase tracking-[0.2em] border border-white/15 text-white/45">
                          Read
                        </span>
                      )}
                    </div>
                    <p className="font-body text-white/85 leading-relaxed">{m.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
