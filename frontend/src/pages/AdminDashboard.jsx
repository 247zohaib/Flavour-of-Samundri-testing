import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import {
  LogOut, RefreshCw, Phone, MapPin, Bike, Store, Mail,
  TrendingUp, ShoppingBag, Clock, Inbox, Download, XCircle,
  ChevronDown, LayoutDashboard, ClipboardList, MessageSquare,
  BarChart2, CheckCircle2, Loader2, Calendar, Trash2, AlertTriangle,
  FileSpreadsheet, Search, Tag, Plus, ToggleLeft, ToggleRight, Gift,
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
  pending: { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/30", dot: "#F59E0B" },
  confirmed: { bg: "bg-blue-500/15", text: "text-blue-300", border: "border-blue-500/30", dot: "#3B82F6" },
  preparing: { bg: "bg-violet-500/15", text: "text-violet-300", border: "border-violet-500/30", dot: "#8B5CF6" },
  out_for_delivery: { bg: "bg-cyan-500/15", text: "text-cyan-300", border: "border-cyan-500/30", dot: "#06B6D4" },
  ready_for_pickup: { bg: "bg-teal-500/15", text: "text-teal-300", border: "border-teal-500/30", dot: "#14B8A6" },
  completed: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30", dot: "#10B981" },
  cancelled: { bg: "bg-red-500/15", text: "text-red-300", border: "border-red-500/30", dot: "#EF4444" },
};

const PIE_COLORS = ["#F59E0B", "#3B82F6", "#8B5CF6", "#06B6D4", "#14B8A6", "#10B981", "#EF4444"];

const fmtMoney = (v) => `Rs ${(v || 0).toLocaleString("en-PK")}`;
const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleString("en-PK", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
};
const fmtShortDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-PK", { month: "short", day: "numeric" });
  } catch { return iso; }
};
const todayStr = () => new Date().toISOString().slice(0, 10);
const monthAgoStr = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
};

// ── Stat Card ──────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, accent = "#D97706" }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
      <div className="stat-icon" style={{ color: accent }}><Icon size={22} /></div>
    </div>
  </div>
);

// ── Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const c = STATUS_COLORS[status] || { bg: "bg-white/10", text: "text-white/60", border: "border-white/20", dot: "#fff" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {STATUS_OPTIONS.find(s => s.value === status)?.label || status}
    </span>
  );
};

// ── Order Card ────────────────────────────────────────────────
const OrderCard = ({ order, onUpdateStatus }) => {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const handleChange = async (e) => {
    const status = e.target.value;
    if (status === order.status) return;
    setBusy(true);
    try { await onUpdateStatus(order.id, status); } finally { setBusy(false); }
  };

  // Discount data — prefer structured fields, fall back to notes parsing
  const savings = order.discount_savings || (() => {
    const m = (order.notes || "").match(/Total savings: Rs (\d+)/i);
    return m ? parseInt(m[1]) : 0;
  })();
  const originalTotal = order.original_total || (() => {
    const m = (order.notes || "").match(/Original total: Rs (\d+)/i);
    return m ? parseInt(m[1]) : order.total;
  })();
  const hasDiscount = savings > 0;
  const hasBogo = order.items?.some(it => it.discount_type === "bogo" || it.bogo_free_qty > 0);

  // Clean customer note
  const rawNote = (order.notes || "").split("\n")[0] || "";
  const isSystem = ["DISCOUNT", "Original", "Pickup time"].some(s => rawNote.startsWith(s));
  const customerNote = isSystem ? "" : rawNote;

  const sc = STATUS_COLORS[order.status] || {};

  return (
    <div style={{
      background: "var(--bg2)",
      border: hasDiscount ? "1px solid rgba(245,158,11,0.4)" : "1px solid var(--border)",
      borderRadius: 14,
      overflow: "hidden",
      transition: "box-shadow 0.2s",
      boxShadow: hasDiscount ? "0 0 0 1px rgba(245,158,11,0.1), 0 4px 20px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.2)",
    }}>

      {/* ── Coloured top strip based on status ── */}
      <div style={{ height: 3, background: sc.dot ? sc.dot : "rgba(255,255,255,0.1)" }} />

      {/* ── Header Section ── */}
      <div style={{ padding: "16px 18px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>

          {/* Left: Customer info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 6 }}>
              <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", padding: "2px 7px", borderRadius: 5 }}>
                #{order.id.slice(0, 8)}
              </span>
              <StatusBadge status={order.status} />
              {hasBogo && (
                <span style={{ fontSize: 10, background: "linear-gradient(135deg,rgba(139,92,246,0.25),rgba(167,139,250,0.15))", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.4)", padding: "2px 8px", borderRadius: 10, fontWeight: 700, letterSpacing: "0.05em" }}>
                  🎁 BOGO
                </span>
              )}
              {hasDiscount && !hasBogo && (
                <span style={{ fontSize: 10, background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.35)", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>
                  🏷️ OFFER
                </span>
              )}
            </div>

            <div style={{ fontSize: 19, fontWeight: 800, color: "white", letterSpacing: "-0.01em", marginBottom: 6 }}>
              {order.customer_name}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <Phone size={12} style={{ color: "#F59E0B" }} /> {order.phone}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                {order.order_type === "pickup"
                  ? <><Store size={12} style={{ color: "#F59E0B" }} /> Pickup</>
                  : <><Bike size={12} style={{ color: "#F59E0B" }} /> Delivery</>}
              </span>
              {order.address && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                  <MapPin size={12} style={{ color: "#F59E0B" }} /> {order.address}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 5 }}>
              {fmtDate(order.created_at)}
            </div>
          </div>

          {/* Right: Price + Status */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
            <div style={{ textAlign: "right" }}>
              {hasDiscount && (
                <div style={{ fontSize: 12, color: "#6b7280", textDecoration: "line-through", marginBottom: 2 }}>
                  Rs {originalTotal.toLocaleString("en-PK")}
                </div>
              )}
              <div style={{ fontSize: 26, fontWeight: 800, color: "#F59E0B", lineHeight: 1, letterSpacing: "-0.02em" }}>
                Rs {order.total.toLocaleString("en-PK")}
              </div>
              {hasDiscount && (
                <div style={{ fontSize: 11, color: "#10B981", fontWeight: 700, marginTop: 3 }}>
                  💰 Saved Rs {savings.toLocaleString("en-PK")}
                </div>
              )}
            </div>
            {busy
              ? <Loader2 size={16} className="spin" style={{ color: "rgba(255,255,255,0.4)" }} />
              : <select value={order.status} onChange={handleChange} className="status-select">
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value} className="bg-[#1a1a1a]">{s.label}</option>)}
                </select>
            }
          </div>
        </div>
      </div>

      {/* ── Quick item count toggle ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "0 18px" }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "10px 0", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 13 }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", fontWeight: 700, fontSize: 12, padding: "1px 8px", borderRadius: 20 }}>
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </span>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
              {open ? "Hide details" : "View order details & bill"}
            </span>
          </span>
          <ChevronDown size={15} style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", color: "rgba(255,255,255,0.3)" }} />
        </button>
      </div>

      {/* ── Expanded Details ── */}
      {open && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* BOGO Alert Banner */}
          {hasBogo && (
            <div style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(167,139,250,0.08))", border: "1px solid rgba(139,92,246,0.35)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 20, lineHeight: 1 }}>🎁</span>
              <div>
                <p style={{ color: "#c4b5fd", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>BOGO — Give Free Items</p>
                {order.items.filter(it => it.discount_type === "bogo" || it.bogo_free_qty > 0).map((it, i) => (
                  <p key={i} style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, lineHeight: 1.5 }}>
                    ✅ <strong>{it.name}</strong>: Customer ordered <strong style={{ color: "white" }}>{it.quantity}</strong> — give <strong style={{ color: "#c4b5fd" }}>{it.bogo_free_qty || it.quantity} extra FREE</strong>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Items List */}
          <div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10, fontWeight: 600 }}>
              📋 Order Items
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {order.items.map((it, idx) => {
                const isBogo = it.discount_type === "bogo" || (it.bogo_free_qty || 0) > 0;
                const hasItemDiscount = it.discounted_price != null && it.discounted_price !== it.price;
                const lineOriginal = it.price * it.quantity;
                const lineActual = (it.discounted_price != null ? it.discounted_price : it.price) * it.quantity;
                const itemSaved = lineOriginal - lineActual;

                return (
                  <div key={idx} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 12px", borderRadius: 9, gap: 10,
                    background: (isBogo || hasItemDiscount) ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${(isBogo || hasItemDiscount) ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}`,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{it.name}</span>
                        <span style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", padding: "1px 7px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                          × {it.quantity}
                        </span>
                        {isBogo && (
                          <span style={{ background: "rgba(139,92,246,0.2)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.35)", padding: "1px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>
                            +{it.bogo_free_qty || it.quantity} FREE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                        {isBogo
                          ? `Rs ${it.price.toLocaleString("en-PK")} each · ${it.discount_name}`
                          : hasItemDiscount
                          ? `Rs ${it.price.toLocaleString("en-PK")} → Rs ${it.discounted_price.toLocaleString("en-PK")} each · ${it.discount_name}`
                          : `Rs ${it.price.toLocaleString("en-PK")} each`
                        }
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {hasItemDiscount && !isBogo && (
                        <div style={{ fontSize: 11, color: "#6b7280", textDecoration: "line-through" }}>
                          Rs {lineOriginal.toLocaleString("en-PK")}
                        </div>
                      )}
                      <div style={{ fontSize: 15, fontWeight: 700, color: (isBogo || hasItemDiscount) ? "#F59E0B" : "rgba(255,255,255,0.8)" }}>
                        Rs {lineActual.toLocaleString("en-PK")}
                      </div>
                      {itemSaved > 0 && !isBogo && (
                        <div style={{ fontSize: 10, color: "#10B981" }}>-Rs {itemSaved.toLocaleString("en-PK")}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bill Summary */}
          <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px 6px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600 }}>
                🧾 Bill Summary
              </p>
            </div>
            <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
              {/* Per item lines */}
              {order.items.map((it, idx) => {
                const lineActual = (it.discounted_price != null ? it.discounted_price : it.price) * it.quantity;
                return (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                    <span>
                      {it.name} × {it.quantity}
                      {(it.bogo_free_qty || 0) > 0 && <span style={{ color: "#c4b5fd", marginLeft: 5 }}>(+{it.bogo_free_qty} free)</span>}
                    </span>
                    <span>Rs {lineActual.toLocaleString("en-PK")}</span>
                  </div>
                );
              })}

              {/* Divider */}
              <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", margin: "4px 0" }} />

              {/* Before discount */}
              {hasDiscount && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
                    <span>Subtotal (before discount)</span>
                    <span style={{ textDecoration: "line-through" }}>Rs {originalTotal.toLocaleString("en-PK")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#10B981", fontWeight: 600 }}>
                    <span>🏷️ Discount Applied</span>
                    <span>− Rs {savings.toLocaleString("en-PK")}</span>
                  </div>
                </>
              )}

              {/* Final total */}
              <div style={{ borderTop: "2px solid rgba(245,158,11,0.3)", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
                    Total to Collect
                  </div>
                  {hasDiscount && (
                    <div style={{ fontSize: 11, color: "#10B981" }}>Customer saved Rs {savings.toLocaleString("en-PK")}</div>
                  )}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#F59E0B", letterSpacing: "-0.02em" }}>
                  Rs {order.total.toLocaleString("en-PK")}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Note */}
          {customerNote && (
            <div style={{ display: "flex", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, borderLeft: "3px solid rgba(245,158,11,0.5)" }}>
              <span style={{ fontSize: 16 }}>📝</span>
              <div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Customer Note</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontStyle: "italic", lineHeight: 1.5 }}>{customerNote}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="text-white/60 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white font-semibold text-sm">
          {p.name === "revenue" ? fmtMoney(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Delete Warning Modal ──────────────────────────────────────
const DeleteWarningModal = ({ onConfirm, onCancel, beforeDate }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
  }}>
    <div style={{
      background: "#1a1a1a", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 12,
      padding: 28, maxWidth: 440, width: "100%",
    }}>
      <div className="flex items-center gap-3 mb-4">
        <div style={{ background: "rgba(239,68,68,0.1)", borderRadius: 8, padding: 8 }}>
          <AlertTriangle size={22} style={{ color: "#EF4444" }} />
        </div>
        <div>
          <p style={{ color: "white", fontWeight: 700, fontSize: 16 }}>⚠️ Delete Old Orders</p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>This action cannot be undone</p>
        </div>
      </div>
      <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: 14, marginBottom: 20 }}>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 1.6 }}>
          You are about to <strong style={{ color: "#EF4444" }}>permanently delete</strong> <strong style={{ color: "white" }}>{beforeDate}</strong>.</p>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 8 }}>
          💡 <strong style={{ color: "#F59E0B" }}>Recommended:</strong> Export to Excel first before deleting. Once deleted, this data cannot be recovered.
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} style={{
          flex: 1, padding: "10px 0", border: "1px solid rgba(255,255,255,0.15)",
          background: "transparent", color: "rgba(255,255,255,0.7)", borderRadius: 7, cursor: "pointer", fontSize: 13,
        }}>Cancel — Keep Data</button>
        <button onClick={onConfirm} style={{
          flex: 1, padding: "10px 0", border: "none",
          background: "#EF4444", color: "white", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600,
        }}>Yes, Delete Permanently</button>
      </div>
    </div>
  </div>
);

// ── Excel Export ──────────────────────────────────────────────
const exportToExcel = (orders, fromDate, toDate, dailySummary) => {
  // Build CSV with multiple sheets simulated in proper formatting
  const dateRange = `${fromDate} to ${toDate}`;

  // Sheet 1: Summary
  const summaryRows = [
    [`FLAVORS OF SAMUNDRI — Sales Report`],
    [`Date Range: ${dateRange}`],
    [`Generated: ${new Date().toLocaleString("en-PK")}`],
    [],
    ["DAILY SUMMARY"],
    ["Date", "Total Orders", "Completed Revenue (Rs)", "Cancelled Orders"],
    ...(dailySummary || []).map(d => [d.date, d.orders, d.revenue, d.cancelled]),
    [],
    ["TOTAL", dailySummary?.reduce((s, d) => s + d.orders, 0), dailySummary?.reduce((s, d) => s + d.revenue, 0), dailySummary?.reduce((s, d) => s + d.cancelled, 0)],
    [],
    ["ORDER DETAILS"],
    ["Order ID", "Date", "Customer Name", "Phone", "Order Type", "Address", "Items", "Notes", "Total (Rs)", "Status"],
    ...orders.map(o => [
      o.id,
      new Date(o.created_at).toLocaleString("en-PK"),
      o.customer_name,
      o.phone,
      o.order_type,
      o.address || "",
      o.items.map(i => `${i.name} x${i.quantity} @ Rs${i.price}`).join(" | "),
      o.notes || "",
      o.total,
      o.status,
    ]),
  ];

  const csv = summaryRows.map(r =>
    r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const BOM = "\uFEFF"; // UTF-8 BOM for Excel
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `FlavorsOfSamundri_${fromDate}_to_${toDate}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Excel file downloaded successfully!");
};

// ── Date Range Tab ────────────────────────────────────────────
const DateRangeTab = ({ headers }) => {
  const [fromDate, setFromDate] = useState(monthAgoStr());
  const [toDate, setToDate] = useState(todayStr());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteDate, setDeleteDate] = useState(monthAgoStr());
  const [deleteMonth, setDeleteMonth] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [deleteSingleDay, setDeleteSingleDay] = useState(monthAgoStr());
  const [deleteMode, setDeleteMode] = useState("custom"); // "custom" | "day" | "month"
  const [deleting, setDeleting] = useState(false);

  const getDeleteLabel = () => {
    if (deleteMode === "day") return `all orders on ${deleteSingleDay}`;
    if (deleteMode === "month") {
      const [y, m] = deleteMonth.split("-");
      return `all orders in ${new Date(y, m - 1).toLocaleString("en-PK", { month: "long", year: "numeric" })}`;
    }
    return `all orders before ${deleteDate}`;
  };

  const getDeleteBeforeDate = () => {
    if (deleteMode === "day") {
      // delete only that day: before = next day
      const d = new Date(deleteSingleDay);
      d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    }
    if (deleteMode === "month") {
      const [y, m] = deleteMonth.split("-");
      const d = new Date(Number(y), Number(m), 1); // first day of next month
      return d.toISOString().slice(0, 10);
    }
    return deleteDate;
  };

  const fetchDateRange = async () => {
    if (!fromDate || !toDate) { toast.error("Please select both dates."); return; }
    if (fromDate > toDate) { toast.error("From date must be before To date."); return; }
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/stats/daterange`, {
        headers, params: { from_date: fromDate, to_date: toDate },
      });
      setData(res.data);
    } catch { toast.error("Failed to load data."); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const beforeDate = getDeleteBeforeDate();
    try {
      const res = await axios.delete(`${API}/admin/orders/archive`, {
        headers, data: { before_date: beforeDate },
      });
      toast.success(res.data.message);
      setShowDeleteModal(false);
      setData(null);
    } catch { toast.error("Delete failed."); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      {showDeleteModal && (
        <DeleteWarningModal
          beforeDate={getDeleteLabel()}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Date Range Picker */}
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Calendar size={14} /> Date Range Report
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              style={{ background: "var(--bg3)", border: "1px solid var(--border2)", color: "white", padding: "8px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              style={{ background: "var(--bg3)", border: "1px solid var(--border2)", color: "white", padding: "8px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer" }} />
          </div>
          <button onClick={fetchDateRange} disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "#D97706", border: "none", color: "black", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            {loading ? <Loader2 size={14} className="spin" /> : <Search size={14} />}
            {loading ? "Loading..." : "View Report"}
          </button>
          {data && (
            <button onClick={() => exportToExcel(data.orders, fromDate, toDate, data.daily)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "#10B981", border: "none", color: "white", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              <FileSpreadsheet size={14} /> Export Excel
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <>
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            <StatCard icon={ClipboardList} label="Total Orders" value={data.summary.total_orders} sub={`${fromDate} → ${toDate}`} accent="#3B82F6" />
            <StatCard icon={TrendingUp} label="Total Revenue" value={fmtMoney(data.summary.total_revenue)} sub="completed orders only" accent="#10B981" />
            <StatCard icon={XCircle} label="Cancelled" value={data.summary.total_cancelled} sub="in this period" accent="#EF4444" />
          </div>

          {/* Daily chart */}
          {data.daily.length > 0 && (
            <div className="charts-grid" style={{ marginBottom: 20 }}>
              <div className="chart-card">
                <div className="chart-title">Daily Revenue</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `Rs ${v}`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="revenue" name="revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <div className="chart-title">Daily Orders</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="orders" name="orders" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, fill: "#3B82F6" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Daily table */}
          <div className="chart-card" style={{ marginBottom: 20 }}>
            <div className="chart-title">Day-by-Day Breakdown</div>
            <div style={{ overflowX: "auto" }}>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Orders</th>
                    <th>Revenue (Completed)</th>
                    <th>Cancelled</th>
                  </tr>
                </thead>
                <tbody>
                  {data.daily.map((d, i) => (
                    <tr key={i}>
                      <td style={{ color: "white", fontWeight: 600 }}>{d.date}</td>
                      <td>{d.orders}</td>
                      <td style={{ color: "#10B981", fontWeight: 600 }}>{fmtMoney(d.revenue)}</td>
                      <td style={{ color: "#EF4444" }}>{d.cancelled}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top items */}
          {data.top_items.length > 0 && (
            <div className="chart-card" style={{ marginBottom: 20 }}>
              <div className="chart-title">Top Items in This Period</div>
              <table className="items-table">
                <thead><tr><th>Item</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
                <tbody>
                  {data.top_items.map((it, i) => (
                    <tr key={i}>
                      <td>{it.name}</td>
                      <td style={{ color: "#F59E0B", fontWeight: 700 }}>{it.qty}</td>
                      <td style={{ color: "rgba(255,255,255,0.6)" }}>{fmtMoney(it.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Delete Old Data Section */}
      <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Trash2 size={16} style={{ color: "#EF4444" }} />
          <span style={{ color: "#EF4444", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Delete Old Data</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
          Keep your database light by removing old orders. <strong style={{ color: "#F59E0B" }}>Always export to Excel before deleting!</strong>
        </p>

        {/* Mode selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {[
            { id: "day", label: "Delete a Day" },
            { id: "month", label: "Delete a Month" },
            { id: "custom", label: "Delete Before Date" },
          ].map(opt => (
            <button key={opt.id} onClick={() => setDeleteMode(opt.id)}
              style={{
                padding: "6px 14px", fontSize: 12, borderRadius: 20, cursor: "pointer",
                border: `1px solid ${deleteMode === opt.id ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"}`,
                background: deleteMode === opt.id ? "rgba(239,68,68,0.12)" : "transparent",
                color: deleteMode === opt.id ? "#EF4444" : "rgba(255,255,255,0.5)",
                fontWeight: deleteMode === opt.id ? 600 : 400,
              }}>
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          {/* Day picker */}
          {deleteMode === "day" && (
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Select Day to Delete</label>
              <input type="date" value={deleteSingleDay} onChange={e => setDeleteSingleDay(e.target.value)}
                style={{ background: "var(--bg3)", border: "1px solid rgba(239,68,68,0.3)", color: "white", padding: "8px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer" }} />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Deletes all orders placed on this exact day.</p>
            </div>
          )}

          {/* Month picker */}
          {deleteMode === "month" && (
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Select Month to Delete</label>
              <input type="month" value={deleteMonth} onChange={e => setDeleteMonth(e.target.value)}
                style={{ background: "var(--bg3)", border: "1px solid rgba(239,68,68,0.3)", color: "white", padding: "8px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer" }} />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Deletes all orders for the entire selected month.</p>
            </div>
          )}

          {/* Custom date picker */}
          {deleteMode === "custom" && (
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Delete all orders before</label>
              <input type="date" value={deleteDate} onChange={e => setDeleteDate(e.target.value)}
                style={{ background: "var(--bg3)", border: "1px solid rgba(239,68,68,0.3)", color: "white", padding: "8px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer" }} />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Deletes all orders placed before this date.</p>
            </div>
          )}

          <button onClick={() => setShowDeleteModal(true)} disabled={deleting}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "transparent", border: "1px solid rgba(239,68,68,0.5)", color: "#EF4444", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", height: "fit-content" }}>
            <Trash2 size={14} /> Delete Orders
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Discounts Tab ─────────────────────────────────────────────
const DISCOUNT_TYPES = [
  { value: "bogo", label: "Buy 1 Get 1 Free", icon: "🎁" },
  { value: "percent", label: "Percentage Off", icon: "%" },
  { value: "fixed", label: "Fixed Amount Off", icon: "Rs" },
];

const MENU_ITEMS_LIST = [
  "Chicken Biryani", "Beef Karahi", "Chicken Karahi", "Daal Makhani", "Aloo Palak",
  "Aloo Paratha", "Garlic Naan", "Roghni Roti",
  "Karak Doodh Patti", "Kashmiri Chai", "Adrak Chai", "Rustic Espresso", "Cafe Latte",
  "Gajar Halwa", "Kheer", "Gulab Jamun (2 pcs)",
  "Sweet Lassi", "Salted Lassi", "Rooh Afza Milk",
];

const DiscountsTab = ({ headers }) => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "bogo", value: 0, applies_to: "all", applies_to_name: "", active: true,
  });
  const [showForm, setShowForm] = useState(false);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/discounts`, { headers });
      setDiscounts(res.data);
    } catch { toast.error("Failed to load discounts."); }
    finally { setLoading(false); }
  };
 // eslint-disable-next-line 
  useEffect(() => { fetchDiscounts(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error("Please enter a discount name."); return; }
    if (form.type !== "bogo" && (!form.value || form.value <= 0)) { toast.error("Please enter a valid discount value."); return; }
    if (form.applies_to !== "all" && !form.applies_to_name) { toast.error("Please select a menu item."); return; }
    setSaving(true);
    try {
      const res = await axios.post(`${API}/admin/discounts`, form, { headers });
      setDiscounts(prev => [res.data, ...prev]);
      setForm({ name: "", type: "bogo", value: 0, applies_to: "all", applies_to_name: "", active: true });
      setShowForm(false);
      toast.success("Discount created! It is now live on the customer site.");
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Unknown error";
      toast.error(`Failed to create discount: ${msg}`);
    }
    finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await axios.patch(`${API}/admin/discounts/${id}/toggle`, {}, { headers });
      setDiscounts(prev => prev.map(d => d.id === id ? { ...d, active: res.data.active } : d));
      toast.success(res.data.active ? "Discount activated." : "Discount deactivated.");
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Unknown error";
      toast.error(`Failed to toggle: ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this discount permanently?")) return;
    try {
      await axios.delete(`${API}/admin/discounts/${id}`, { headers });
      setDiscounts(prev => prev.filter(d => d.id !== id));
      toast.success("Discount deleted.");
    } catch { toast.error("Failed to delete."); }
  };

  const getDiscountLabel = (d) => {
    if (d.type === "bogo") return "Buy 1 Get 1 Free";
    if (d.type === "percent") return `${d.value}% Off`;
    if (d.type === "fixed") return `Rs ${d.value} Off`;
    return d.type;
  };

  const inputStyle = {
    background: "var(--bg3)", border: "1px solid var(--border2)", color: "white",
    padding: "9px 12px", borderRadius: 7, fontSize: 13, width: "100%", outline: "none",
  };
  const labelStyle = { fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ color: "white", fontSize: 20, fontWeight: 700, margin: 0 }}>Discount Offers</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Active discounts show live on the customer website.</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "#D97706", border: "none", color: "black", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Plus size={15} /> {showForm ? "Cancel" : "New Discount"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <p style={{ color: "white", fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Create New Discount</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            {/* Name */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Discount Name (shown to customers)</label>
              <input style={inputStyle} placeholder='e.g. "Weekend Special" or "Chai BOGO"'
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>

            {/* Type */}
            <div>
              <label style={labelStyle}>Discount Type</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DISCOUNT_TYPES.map(t => (
                  <button key={t.value} onClick={() => setForm({ ...form, type: t.value, value: 0 })}
                    style={{
                      padding: "7px 14px", fontSize: 12, borderRadius: 7, cursor: "pointer",
                      border: `1px solid ${form.type === t.value ? "var(--amber-dim)" : "var(--border2)"}`,
                      background: form.type === t.value ? "rgba(217,119,6,0.15)" : "transparent",
                      color: form.type === t.value ? "var(--amber)" : "rgba(255,255,255,0.6)",
                      fontWeight: form.type === t.value ? 600 : 400,
                    }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Value (only for percent/fixed) */}
            {form.type !== "bogo" && (
              <div>
                <label style={labelStyle}>{form.type === "percent" ? "Percentage (e.g. 20 for 20%)" : "Amount Off (Rs)"}</label>
                <input type="number" min="1" style={inputStyle}
                  placeholder={form.type === "percent" ? "e.g. 20" : "e.g. 100"}
                  value={form.value || ""} onChange={e => setForm({ ...form, value: Number(e.target.value) })} />
              </div>
            )}

            {/* Applies to */}
            <div>
              <label style={labelStyle}>Applies To</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["all", "item"].map(opt => (
                  <button key={opt} onClick={() => setForm({ ...form, applies_to: opt, applies_to_name: "" })}
                    style={{
                      padding: "7px 14px", fontSize: 12, borderRadius: 7, cursor: "pointer",
                      border: `1px solid ${form.applies_to === opt ? "var(--amber-dim)" : "var(--border2)"}`,
                      background: form.applies_to === opt ? "rgba(217,119,6,0.15)" : "transparent",
                      color: form.applies_to === opt ? "var(--amber)" : "rgba(255,255,255,0.6)",
                      fontWeight: form.applies_to === opt ? 600 : 400,
                    }}>
                    {opt === "all" ? "🍽️ All Items" : "🎯 Specific Item"}
                  </button>
                ))}
              </div>
            </div>

            {/* Item selector */}
            {form.applies_to === "item" && (
              <div>
                <label style={labelStyle}>Select Menu Item</label>
                <select style={{ ...inputStyle, cursor: "pointer" }}
                  value={form.applies_to_name} onChange={e => setForm({ ...form, applies_to_name: e.target.value })}>
                  <option value="">-- Select item --</option>
                  {MENU_ITEMS_LIST.map(item => <option key={item} value={item} className="bg-[#1a1a1a]">{item}</option>)}
                </select>
              </div>
            )}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button onClick={handleCreate} disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", background: "#D97706", border: "none", color: "black", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {saving ? <Loader2 size={14} className="spin" /> : <Plus size={14} />}
              {saving ? "Saving..." : "Create & Publish"}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ padding: "9px 16px", background: "transparent", border: "1px solid var(--border2)", color: "rgba(255,255,255,0.6)", borderRadius: 7, fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Discounts List */}
      {loading ? (
        <div className="empty-state"><Loader2 size={28} className="spin" style={{ color: "var(--amber)" }} /><p>Loading discounts…</p></div>
      ) : discounts.length === 0 ? (
        <div className="empty-state">
          <Gift size={36} style={{ color: "var(--text-muted)" }} />
          <p>No discounts yet. Create one to show offers on the customer site!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {discounts.map(d => (
            <div key={d.id} style={{
              background: "var(--bg2)", border: `1px solid ${d.active ? "rgba(245,158,11,0.25)" : "var(--border)"}`,
              borderRadius: 10, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
              opacity: d.active ? 1 : 0.55, transition: "all 0.2s",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ background: d.active ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)", color: d.active ? "var(--amber)" : "var(--text-muted)", border: `1px solid ${d.active ? "rgba(245,158,11,0.3)" : "var(--border2)"}`, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                    {d.active ? "🟢 LIVE" : "⭕ OFF"}
                  </span>
                  <span style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", padding: "2px 10px", borderRadius: 20, fontSize: 11 }}>
                    {getDiscountLabel(d)}
                  </span>
                  <span style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", padding: "2px 10px", borderRadius: 20, fontSize: 11 }}>
                    {d.applies_to === "all" ? "All Items" : d.applies_to_name}
                  </span>
                </div>
                <p style={{ color: "white", fontWeight: 600, fontSize: 15, margin: 0 }}>{d.name}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => handleToggle(d.id)} title={d.active ? "Deactivate" : "Activate"}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "transparent", border: `1px solid ${d.active ? "rgba(245,158,11,0.4)" : "var(--border2)"}`, color: d.active ? "var(--amber)" : "rgba(255,255,255,0.5)", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {d.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {d.active ? "Active" : "Inactive"}
                </button>
                <button onClick={() => handleDelete(d.id)} title="Delete"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, background: "transparent", border: "1px solid var(--border2)", color: "rgba(255,255,255,0.4)", borderRadius: 7, cursor: "pointer" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div style={{ marginTop: 20, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8, padding: 14 }}>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1.7 }}>
          💡 <strong style={{ color: "var(--amber)" }}>How it works:</strong> Active discounts appear as a banner on the customer Order page and Menu page automatically. Toggle off to hide without deleting.
        </p>
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, logout, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const headers = useMemo(() => authHeaders(), [authHeaders]);

  const fetchAll = useCallback(async () => {
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
      if (e.response?.status === 401) { toast.error("Session expired."); logout(); navigate("/admin/login"); }
      else toast.error("Failed to load dashboard.");
    } finally { setLoading(false); }
  }, [headers, logout, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await axios.patch(`${API}/admin/orders/${id}`, { status }, { headers });
      setOrders(prev => prev.map(o => o.id === id ? res.data : o));
      toast.success(`Order marked as ${status.replace(/_/g, " ")}.`);
      axios.get(`${API}/admin/stats`, { headers }).then(r => setStats(r.data)).catch(() => {});
    } catch { toast.error("Could not update order."); }
  };

  const markMessageRead = async (id) => {
    try {
      await axios.patch(`${API}/admin/messages/${id}/read`, {}, { headers });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    } catch {}
  };

  const filteredOrders = useMemo(
    () => statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter),
    [orders, statusFilter]
  );

  const ordersByDate = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      const day = fmtShortDate(o.created_at);
      if (!map[day]) map[day] = { date: day, orders: 0, revenue: 0 };
      map[day].orders += 1;
      if (o.status === "completed") map[day].revenue += o.total;
    });
    return Object.values(map).slice(-14);
  }, [orders]);

  const statusPieData = useMemo(() => {
    if (!stats?.by_status) return [];
    return Object.entries(stats.by_status).map(([name, value]) => ({
      name: STATUS_OPTIONS.find(s => s.value === name)?.label || name, value,
    }));
  }, [stats]);

  const topItems = useMemo(() => {
    const map = {};
    orders.forEach(o => o.items.forEach(it => {
      if (!map[it.name]) map[it.name] = { name: it.name, qty: 0, revenue: 0 };
      map[it.name].qty += it.quantity;
      map[it.name].revenue += it.price * it.quantity;
    }));
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 8);
  }, [orders]);

  const handleLogout = () => { logout(); navigate("/admin/login", { replace: true }); };
  const unreadCount = messages.filter(m => !m.read).length;

  const TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: `Orders (${orders.length})`, icon: ClipboardList },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "daterange", label: "Date Reports", icon: Calendar },
    { id: "discounts", label: "Discounts", icon: Tag },
    { id: "messages", label: `Messages${unreadCount > 0 ? ` (${unreadCount})` : ""}`, icon: MessageSquare },
  ];

  return (
    <>
      <style>{`
        :root {
          --amber: #F59E0B; --amber-dim: #D97706;
          --bg: #0d0d0d; --bg2: #161616; --bg3: #1e1e1e;
          --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
          --text: #f5f5f5; --text-muted: rgba(255,255,255,0.45); --text-sub: rgba(255,255,255,0.25);
        }
        .dash-root { min-height: 100vh; background: var(--bg); color: var(--text); font-family: 'Outfit', 'Inter', sans-serif; }
        .dash-header { position: sticky; top: 0; z-index: 50; background: rgba(13,13,13,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
        .dash-header-inner { max-width: 1400px; margin: 0 auto; padding: 0 1.5rem; height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .dash-brand { display: flex; flex-direction: column; gap: 1px; }
        .dash-brand-eyebrow { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--amber-dim); }
        .dash-brand-name { font-size: 18px; font-weight: 700; color: white; letter-spacing: -0.01em; }
        .dash-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .icon-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1px solid var(--border2); background: transparent; color: rgba(255,255,255,0.7); cursor: pointer; border-radius: 6px; transition: all 0.15s; }
        .icon-btn:hover { border-color: var(--amber-dim); color: var(--amber); }
        .text-btn { display: flex; align-items: center; gap: 6px; padding: 0 14px; height: 36px; border: 1px solid var(--border2); background: transparent; color: rgba(255,255,255,0.7); cursor: pointer; border-radius: 6px; font-size: 12px; transition: all 0.15s; white-space: nowrap; }
        .text-btn:hover { border-color: var(--amber-dim); color: var(--amber); }
        .logout-btn { display: flex; align-items: center; gap: 6px; padding: 0 14px; height: 36px; border: 1px solid var(--border2); background: transparent; color: rgba(255,255,255,0.7); cursor: pointer; border-radius: 6px; font-size: 12px; transition: all 0.15s; }
        .logout-btn:hover { border-color: #EF4444; color: #EF4444; }
        .dash-nav { background: var(--bg2); border-bottom: 1px solid var(--border); }
        .dash-nav-inner { max-width: 1400px; margin: 0 auto; padding: 0 1.5rem; display: flex; overflow-x: auto; }
        .nav-tab { display: flex; align-items: center; gap: 7px; padding: 0 16px; height: 48px; font-size: 13px; font-weight: 500; color: var(--text-muted); border-bottom: 2px solid transparent; cursor: pointer; white-space: nowrap; transition: all 0.15s; background: none; border-top: none; border-left: none; border-right: none; }
        .nav-tab:hover { color: white; }
        .nav-tab.active { color: white; border-bottom-color: var(--amber); }
        .dash-main { max-width: 1400px; margin: 0 auto; padding: 1.5rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px; }
        .stat-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; padding: 18px; transition: border-color 0.15s; }
        .stat-card:hover { border-color: var(--border2); }
        .stat-label { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
        .stat-value { font-size: 24px; font-weight: 700; color: white; letter-spacing: -0.02em; line-height: 1; margin-bottom: 4px; }
        .stat-sub { font-size: 11px; color: var(--text-sub); }
        .stat-icon { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.04); border-radius: 8px; flex-shrink: 0; }
        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 20px; }
        @media (max-width: 800px) { .charts-grid { grid-template-columns: 1fr; } }
        .chart-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; padding: 18px; }
        .chart-title { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
        .chart-tooltip { background: #1a1a1a; border: 1px solid var(--border2); border-radius: 6px; padding: 8px 12px; }
        .orders-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
        .filter-btn { padding: 5px 12px; font-size: 12px; border-radius: 20px; border: 1px solid var(--border2); background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
        .filter-btn:hover { color: white; border-color: rgba(255,255,255,0.3); }
        .filter-btn.active { background: var(--amber-dim); border-color: var(--amber-dim); color: #000; font-weight: 600; }
        .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 14px; }
        @media (max-width: 500px) { .orders-grid { grid-template-columns: 1fr; } }
        .order-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; padding: 16px; transition: border-color 0.15s; }
        .order-card:hover { border-color: var(--border2); }
        .status-select { background: var(--bg3); border: 1px solid var(--border2); color: white; font-size: 12px; padding: 5px 10px; border-radius: 6px; cursor: pointer; outline: none; }
        .status-select:focus { border-color: var(--amber-dim); }
        .messages-list { display: flex; flex-direction: column; gap: 12px; }
        .message-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; padding: 16px; transition: border-color 0.15s; }
        .message-card.unread { border-left: 3px solid var(--amber); }
        .message-card:hover { border-color: var(--border2); }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th { text-align: left; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); padding: 8px 12px; border-bottom: 1px solid var(--border); }
        .items-table td { padding: 9px 12px; font-size: 13px; color: rgba(255,255,255,0.8); border-bottom: 1px solid var(--border); }
        .items-table tr:last-child td { border-bottom: none; }
        .items-table tr:hover td { background: rgba(255,255,255,0.02); }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; text-align: center; }
        .empty-state p { color: var(--text-muted); margin-top: 12px; font-size: 14px; }
        .note-card { background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.15); border-radius: 8px; padding: 12px 16px; font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 20px; }
        .note-card strong { color: var(--amber); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .user-badge { font-size: 12px; color: var(--text-muted); padding: 4px 10px; border: 1px solid var(--border); border-radius: 20px; }
      `}</style>

      <div className="dash-root">
        <header className="dash-header">
          <div className="dash-header-inner">
            <div className="dash-brand">
              <span className="dash-brand-eyebrow">Owner Portal</span>
              <span className="dash-brand-name">Flavors of Samundri</span>
            </div>
            <div className="dash-actions">
              <button onClick={fetchAll} className="icon-btn" aria-label="Refresh">
                <RefreshCw size={15} className={loading ? "spin" : ""} />
              </button>
              <span className="user-badge hidden sm:block">{user?.email}</span>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
        </header>

        <nav className="dash-nav">
          <div className="dash-nav-inner">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`nav-tab ${tab === t.id ? "active" : ""}`}>
                <t.icon size={14} />{t.label}
              </button>
            ))}
          </div>
        </nav>

        <main className="dash-main">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <>
              <div className="stats-grid">
                <StatCard icon={TrendingUp} label="Total Revenue" value={fmtMoney(stats?.total_revenue)} sub={`${stats?.completed_orders || 0} completed`} accent="#10B981" />
                <StatCard icon={Clock} label="Today's Revenue" value={fmtMoney(stats?.today_revenue)} sub={`${stats?.today_orders || 0} orders today`} accent="#3B82F6" />
                <StatCard icon={ShoppingBag} label="Pending Orders" value={stats?.by_status?.pending || 0} sub="awaiting confirmation" accent="#F59E0B" />
                <StatCard icon={Inbox} label="Unread Messages" value={stats?.unread_messages || 0} sub="from contact form" accent="#8B5CF6" />
                <StatCard icon={ClipboardList} label="All Orders" value={stats?.total_orders || 0} sub="all statuses" accent="#06B6D4" />
                <StatCard icon={XCircle} label="Cancelled" value={stats?.cancelled_orders || 0} sub={`${fmtMoney(stats?.cancelled_value)} lost`} accent="#EF4444" />
                <StatCard icon={Tag} label="Discount Orders" value={orders.filter(o => o.notes && /saved Rs \d+/i.test(o.notes)).length} sub={`Rs ${orders.reduce((s, o) => { const m = (o.notes||"").match(/saved Rs (\d+)/i); return s + (m ? parseInt(m[1]) : 0); }, 0).toLocaleString()} total savings given`} accent="#D97706" />
              </div>
              <div className="note-card">
                <strong>Revenue Note:</strong> Only counts <strong style={{ color: "white" }}>Completed</strong> orders. Use <strong style={{ color: "white" }}>Date Reports</strong> tab for Excel export and data cleanup.
              </div>
              <div className="chart-card" style={{ marginBottom: 18 }}>
                <div className="chart-title">Order Status Breakdown</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {STATUS_OPTIONS.map(s => {
                    const count = stats?.by_status?.[s.value] || 0;
                    const c = STATUS_COLORS[s.value];
                    return (
                      <div key={s.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${c.bg} ${c.border}`}>
                        <span className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
                        <span className={c.text}>{s.label}</span>
                        <span className="text-white font-bold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-title">Recent Orders</div>
                {orders.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No orders yet.</p> :
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {orders.slice(0, 5).map(o => (
                      <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ color: "white", fontWeight: 600 }}>{o.customer_name}</span>
                          <StatusBadge status={o.status} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{fmtDate(o.created_at)}</span>
                          <span style={{ color: "var(--amber)", fontWeight: 700 }}>{fmtMoney(o.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </div>
            </>
          )}

          {/* ── ORDERS ── */}
          {tab === "orders" && (
            <>
              <div className="orders-filters">
                <button onClick={() => setStatusFilter("all")} className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}>All ({orders.length})</button>
                {STATUS_OPTIONS.map(s => {
                  const count = orders.filter(o => o.status === s.value).length;
                  return (
                    <button key={s.value} onClick={() => setStatusFilter(s.value)} className={`filter-btn ${statusFilter === s.value ? "active" : ""}`}>
                      {s.label} {count > 0 && `(${count})`}
                    </button>
                  );
                })}
              </div>
              {loading ? <div className="empty-state"><Loader2 size={28} className="spin" style={{ color: "var(--amber)" }} /><p>Loading…</p></div>
                : filteredOrders.length === 0 ? <div className="empty-state"><ShoppingBag size={36} style={{ color: "var(--text-muted)" }} /><p>No orders for this filter.</p></div>
                  : <div className="orders-grid">{filteredOrders.map(o => <OrderCard key={o.id} order={o} onUpdateStatus={updateOrderStatus} />)}</div>
              }
            </>
          )}

          {/* ── ANALYTICS ── */}
          {tab === "analytics" && (
            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-title">Revenue Over Time</div>
                {ordersByDate.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No data yet.</p> :
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={ordersByDate}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `Rs ${v}`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="revenue" name="revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                }
              </div>
              <div className="chart-card">
                <div className="chart-title">Orders Per Day</div>
                {ordersByDate.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No data yet.</p> :
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={ordersByDate}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="orders" name="orders" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: "#3B82F6" }} />
                    </LineChart>
                  </ResponsiveContainer>
                }
              </div>
              <div className="chart-card">
                <div className="chart-title">Orders by Status</div>
                {statusPieData.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No data yet.</p> :
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                        {statusPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6 }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                }
              </div>
              <div className="chart-card">
                <div className="chart-title">Top Menu Items</div>
                {topItems.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No data yet.</p> :
                  <table className="items-table">
                    <thead><tr><th>Item</th><th>Qty</th><th>Revenue</th></tr></thead>
                    <tbody>
                      {topItems.map((it, i) => (
                        <tr key={i}>
                          <td>{it.name}</td>
                          <td style={{ color: "var(--amber)", fontWeight: 700 }}>{it.qty}</td>
                          <td style={{ color: "rgba(255,255,255,0.6)" }}>{fmtMoney(it.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                }
              </div>
            </div>
          )}

          {/* ── DATE REPORTS ── */}
          {tab === "daterange" && <DateRangeTab headers={headers} />}

          {/* ── DISCOUNTS ── */}
          {tab === "discounts" && <DiscountsTab headers={headers} />}

          {/* ── MESSAGES ── */}
          {tab === "messages" && (
            <div className="messages-list">
              {loading ? <div className="empty-state"><Loader2 size={28} className="spin" style={{ color: "var(--amber)" }} /><p>Loading…</p></div>
                : messages.length === 0 ? <div className="empty-state"><Mail size={36} style={{ color: "var(--text-muted)" }} /><p>Inbox is empty.</p></div>
                  : messages.map(m => (
                    <div key={m.id} className={`message-card ${!m.read ? "unread" : ""}`}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 10 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{fmtDate(m.created_at)}</span>
                            {!m.read && <span style={{ fontSize: 10, background: "rgba(245,158,11,0.15)", color: "var(--amber)", border: "1px solid rgba(245,158,11,0.3)", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>NEW</span>}
                          </div>
                          <div style={{ fontSize: 17, fontWeight: 700, color: "white" }}>{m.name}</div>
                          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                            <a href={`mailto:${m.email}`} style={{ color: "inherit" }}>{m.email}</a>
                            {m.phone && <span style={{ marginLeft: 10 }}>• {m.phone}</span>}
                          </div>
                        </div>
                        {!m.read
                          ? <button onClick={() => markMessageRead(m.id)} style={{ padding: "6px 14px", fontSize: 12, border: "1px solid rgba(245,158,11,0.4)", color: "var(--amber)", background: "transparent", borderRadius: 6, cursor: "pointer" }}>Mark read</button>
                          : <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}><CheckCircle2 size={13} /> Read</span>
                        }
                      </div>
                      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{m.message}</p>
                    </div>
                  ))
              }
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
