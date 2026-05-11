import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useDiscounts, getDiscountLabel, getDiscountedPrice } from "../context/DiscountContext";
import {
  Plus, Minus, Trash2, ArrowRight, MessageCircle,
  ShoppingBag, Bike, Store, Tag, Gift,
} from "lucide-react";
import { DoodleArrow, DoodleSwirl, DoodleCup, DoodleCoffeeBean, DoodleLeaf, DoodleStar } from "../components/Doodles";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const RESTAURANT_PHONE = "923080471471";
const PICKUP_LOCATION = "Shahbaz Garden, Samundri";

const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("revealed"); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
};

const Order = () => {
  const { items, updateQty, removeItem, total, clear } = useCart();
  const { getItemDiscount, discounts } = useDiscounts();
  const [orderType, setOrderType] = useState("delivery");
  const [form, setForm] = useState({ customer_name: "", phone: "", address: "", notes: "", pickup_time: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const cartRef = useReveal();
  const formRef = useReveal();
  const isPickup = orderType === "pickup";

  // ── Discount calculations ──────────────────────────────────
  const discountedTotal = items.reduce((sum, it) => {
    const d = getItemDiscount(it.name);
    const dp = getDiscountedPrice(it.price, d);
    return sum + (dp !== null ? dp : it.price) * it.quantity;
  }, 0);
  const totalSavings = total - discountedTotal;
  const hasDiscount = totalSavings > 0;
  const finalTotal = hasDiscount ? discountedTotal : total;

  const buildWhatsAppMessage = () => {
    const lines = [
      `*New Order — Flavors of Samundri*`, ``,
      `Type: ${isPickup ? "Pickup" : "Delivery"}`,
      `Name: ${form.customer_name}`, `Phone: ${form.phone}`,
      isPickup ? `Pickup at: ${PICKUP_LOCATION}` : `Address: ${form.address}`,
      isPickup && form.pickup_time ? `Pickup Time: ${form.pickup_time}` : null,
      form.notes ? `Notes: ${form.notes}` : null, ``,
      `*Items:*`,
      ...items.map((i) => {
        const d = getItemDiscount(i.name);
        const dp = getDiscountedPrice(i.price, d);
        return `• ${i.name} x${i.quantity} — ${dp !== null ? `Rs ${dp} (was Rs ${i.price})` : `Rs ${i.price}`}`;
      }),
      ``, hasDiscount ? `Original: Rs ${total}` : null,
      hasDiscount ? `You Saved: Rs ${totalSavings}` : null,
      `*Total: Rs ${finalTotal}*`,
    ].filter(Boolean);
    return encodeURIComponent(lines.join("\n"));
  };

  const validate = () => {
    if (items.length === 0) { toast.error("Your cart is empty."); return false; }
    if (!form.customer_name.trim() || !form.phone.trim()) { toast.error("Please fill name and phone."); return false; }
    if (!isPickup && !form.address.trim()) { toast.error("Please add a delivery address."); return false; }
    return true;
  };

  const sendWhatsApp = () => { if (!validate()) return; window.open(`https://wa.me/${RESTAURANT_PHONE}?text=${buildWhatsAppMessage()}`, "_blank"); };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Build items with full discount details for admin clarity
      const itemsWithDiscount = items.map((it) => {
        const d = getItemDiscount(it.name);
        const dp = getDiscountedPrice(it.price, d);
        const isBogo = d?.type === "bogo";
        return {
          id: it.id,
          name: it.name,
          price: it.price,                          // original price
          discounted_price: dp !== null ? dp : it.price, // price after discount
          quantity: it.quantity,
          bogo_free_qty: isBogo ? it.quantity : 0,  // free items for BOGO
          discount_name: d ? d.name : "",
          discount_type: d ? d.type : "",
        };
      });

      const discountSummaryLines = hasDiscount
        ? itemsWithDiscount
            .filter(it => it.discount_name)
            .map(it => {
              if (it.discount_type === "bogo")
                return `${it.name}: Buy ${it.quantity} Get ${it.bogo_free_qty} Free`;
              return `${it.name}: Rs ${it.price} → Rs ${it.discounted_price} (${it.discount_name})`;
            })
        : [];

      const payload = {
        customer_name: form.customer_name, phone: form.phone, order_type: orderType,
        address: isPickup ? "" : form.address,
        notes: [
          form.notes,
          isPickup && form.pickup_time ? `Pickup time: ${form.pickup_time}` : "",
          hasDiscount ? `DISCOUNT APPLIED — Total savings: Rs ${totalSavings}` : "",
          hasDiscount ? `Original total: Rs ${total} | After discount: Rs ${finalTotal}` : "",
          ...discountSummaryLines,
        ].filter(Boolean).join("\n"),
        items: itemsWithDiscount,
        total: finalTotal,
        original_total: total,
        discount_savings: totalSavings,
      };
      const res = await axios.post(`${API}/orders`, payload);
      setSuccess({ ...res.data, savings: totalSavings, originalTotal: total });
      clear();
      toast.success(isPickup ? "Order placed! Ready for pickup shortly." : "Order placed! We'll call to confirm soon.");
    } catch { toast.error("Order failed. Please try again."); }
    finally { setSubmitting(false); }
  };

  // ── Success screen ─────────────────────────────────────────
  if (success) {
    return (
      <>
        <style>{`
          @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
          @keyframes spinSlow{from{transform:rotate(0)}to{transform:rotate(360deg)}}
          @keyframes pulseGlow{0%,100%{opacity:0.06}50%{opacity:0.18}}
          @keyframes popIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
          .float-1{animation:floatY 5s ease-in-out infinite}
          .float-2{animation:floatY 7s ease-in-out infinite;animation-delay:-2s}
          .spin-slow{animation:spinSlow 25s linear infinite}
          .pulse-glow{animation:pulseGlow 5s ease-in-out infinite}
          .pop-in{animation:popIn 0.7s ease both}
        `}</style>
        <div className="bg-[#111] chalk-bg pb-32 chalk-noise min-h-screen relative overflow-hidden">
          <div className="float-1 absolute top-20 left-10 hidden lg:block"><DoodleCoffeeBean className="text-white/10" size={44} /></div>
          <div className="float-2 absolute top-32 right-12 hidden lg:block"><DoodleLeaf className="text-[#D97706]/12" size={36} /></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 spin-slow pulse-glow hidden lg:block" style={{ pointerEvents: "none" }}>
            <DoodleSwirl className="text-[#D97706]" size={480} />
          </div>
          <div className="max-w-2xl mx-auto px-6 sm:px-8 text-center relative z-10 pop-in pt-16" data-testid="order-success">
            <div className="float-1"><DoodleSwirl className="text-[#D97706] mx-auto" size={140} /></div>
            <div className="section-eyebrow mt-4 mb-2">Order Received</div>
            <h1 className="font-heading text-7xl text-white chalk-text">
              Thank you, <span className="text-[#F59E0B]">{success.customer_name.split(" ")[0]}!</span>
            </h1>
            <p className="font-body text-white/70 mt-4">
              Order ID: <span data-testid="order-success-id" className="text-white font-mono text-sm">{success.id}</span>
            </p>
            {/* Savings callout */}
            {success.savings > 0 && (
              <div style={{ margin: "16px auto", maxWidth: 380, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 10, padding: "14px 20px" }}>
                <p style={{ color: "#10B981", fontWeight: 700, fontSize: 16 }}>🎉 You saved Rs {success.savings}!</p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>
                  Original: Rs {success.originalTotal} → Final: Rs {success.total}
                </p>
              </div>
            )}
            <p className="font-body text-white/65 mt-4">
              {success.order_type === "pickup"
                ? <>Pick up at <span className="text-white">{PICKUP_LOCATION}</span>. We'll call <span className="text-white">{success.phone}</span> when ready.</>
                : <>We'll call <span className="text-white">{success.phone}</span> within a few minutes to confirm.</>}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/menu" data-testid="order-success-menu" className="btn-chalk-outline">Order Something Else</Link>
              <Link to="/" data-testid="order-success-home" className="btn-chalk-primary">Back Home <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Main order page ────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes floatY{0%,100%{transform:translateY(0px) rotate(var(--rot,0deg))}50%{transform:translateY(-16px) rotate(var(--rot,0deg))}}
        @keyframes drift{0%{transform:translate(0,0)}25%{transform:translate(10px,-12px)}50%{transform:translate(4px,-20px)}75%{transform:translate(-8px,-10px)}100%{transform:translate(0,0)}}
        @keyframes spinSlow{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes pulseGlow{0%,100%{opacity:0.05}50%{opacity:0.13}}
        .float-1{animation:floatY 5s ease-in-out infinite}
        .float-2{animation:floatY 7s ease-in-out infinite;animation-delay:-2s}
        .float-3{animation:floatY 6s ease-in-out infinite;animation-delay:-3.5s}
        .float-5{animation:drift 11s ease-in-out infinite;animation-delay:-4s}
        .spin-slow{animation:spinSlow 28s linear infinite}
        .pulse-glow{animation:pulseGlow 5s ease-in-out infinite}
        .scroll-reveal{opacity:0;transform:translateY(28px);transition:opacity 0.7s ease,transform 0.7s ease}
        .scroll-reveal.revealed{opacity:1;transform:translateY(0)}
        .cart-item{opacity:0;transform:translateX(-16px);transition:opacity 0.4s ease,transform 0.4s ease}
        .cart-wrap.revealed .cart-item{opacity:1;transform:translateX(0)}
        .cart-wrap.revealed .cart-item:nth-child(2){transition-delay:0.06s}
        .cart-wrap.revealed .cart-item:nth-child(3){transition-delay:0.12s}
        .form-reveal{opacity:0;transform:translateX(20px);transition:opacity 0.8s ease,transform 0.8s ease}
        .form-reveal.revealed{opacity:1;transform:translateX(0)}
      `}</style>

      <div className="bg-[#111] chalk-bg pb-24 chalk-noise relative overflow-hidden">
        {/* Floating doodles */}
        <div className="float-1 absolute top-20 left-6 hidden lg:block" style={{"--rot":"-15deg"}}><DoodleCoffeeBean className="text-white/10" size={48} /></div>
        <div className="float-3 absolute top-40 left-28 hidden xl:block"><DoodleLeaf className="text-[#D97706]/12" size={32} /></div>
        <div className="float-2 absolute top-24 right-10 hidden lg:block"><DoodleSwirl className="text-white/6" size={100} /></div>
        <div className="float-5 absolute top-1/3 left-4 hidden lg:block"><DoodleStar className="text-[#D97706]/10" size={22} /></div>
        <div className="float-3 absolute bottom-32 right-12 hidden lg:block"><DoodleCoffeeBean className="text-white/8" size={36} /></div>
        <div className="absolute bottom-0 right-0 spin-slow pulse-glow hidden xl:block" style={{pointerEvents:"none"}}><DoodleSwirl className="text-[#D97706]" size={400} /></div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 pt-8">
          {/* Header */}
          <div className="text-center mb-10 relative scroll-reveal revealed">
            <div className="float-2 absolute -top-2 left-1/4 hidden md:block"><DoodleCup className="text-white/20 -rotate-12" size={50} /></div>
            <div className="float-3 absolute -top-2 right-1/4 hidden md:block"><DoodleArrow className="text-white/20" size={100} /></div>
            <br /> 
            <br /> 
            <div className="section-eyebrow mb-3">Online Order</div>
            <h1 data-testid="order-page-title" className="font-heading text-7xl sm:text-8xl text-white chalk-text">
              Place your <span className="text-[#F59E0B]">order.</span>
            </h1>
            <p className="font-body text-white/65 mt-4 max-w-xl mx-auto">
              Choose delivery or pickup — we'll call you to confirm either way.
            </p>
          </div>

          {/* Active offers strip */}
          {discounts.length > 0 && (
            <div style={{ marginBottom: 24, padding: "14px 18px", background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.3)", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Gift size={15} style={{ color: "#F59E0B" }} />
                <span style={{ color: "#F59E0B", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Active Offers — Will Be Applied Automatically
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {discounts.map(d => (
                  <span key={d.id} style={{ background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.3)", color: "white", padding: "5px 12px", borderRadius: 20, fontSize: 12 }}>
                    <span style={{ color: "#F59E0B", fontWeight: 700 }}>{d.name}</span>
                    {" — "}
                    {d.type === "bogo" ? "Buy 1 Get 1 Free" : d.type === "percent" ? `${d.value}% Off` : `Rs ${d.value} Off`}
                    {d.applies_to !== "all" && <span style={{ color: "rgba(255,255,255,0.5)" }}> on {d.applies_to_name}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-12 gap-10">
            {/* ── Cart ── */}
            <div className="md:col-span-7">
              <h2 className="font-heading text-4xl text-white mb-5">Your Cart</h2>
              {items.length === 0 ? (
                <div className="chalk-card p-10 text-center">
                  <ShoppingBag className="mx-auto text-white/40" size={40} />
                  <p className="font-heading text-3xl text-white mt-3">Cart's empty.</p>
                  <p className="font-body text-white/55 mt-1">Wander over to the menu and pick a few favorites.</p>
                  <Link to="/menu" data-testid="order-empty-menu" className="btn-chalk-primary mt-6">View Menu <ArrowRight size={16} /></Link>
                </div>
              ) : (
                <div ref={cartRef} className="cart-wrap space-y-3">
                  {items.map((it) => {
                    const discount = getItemDiscount(it.name);
                    const discountLabel = getDiscountLabel(discount);
                    const discountedPrice = getDiscountedPrice(it.price, discount);
                    const isBogo = discount?.type === "bogo";
                    const lineTotal = (discountedPrice !== null ? discountedPrice : it.price) * it.quantity;

                    return (
                      <div key={it.id} data-testid={`order-item-${it.id}`}
                        className="cart-item chalk-card p-5"
                        style={{ border: discount ? "1px solid rgba(217,119,6,0.35)" : undefined }}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="font-body text-white truncate font-semibold">{it.name}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                              {discountedPrice !== null ? (
                                <>
                                  <span style={{ color: "#6b7280", fontSize: 12, textDecoration: "line-through" }}>Rs {it.price}</span>
                                  <span style={{ color: "#F59E0B", fontSize: 13, fontWeight: 700 }}>Rs {discountedPrice} each</span>
                                </>
                              ) : (
                                <span className="font-body text-xs text-white/55">Rs {it.price} each</span>
                              )}
                              {isBogo && (
                                <span style={{ fontSize: 10, background: "rgba(217,119,6,0.2)", color: "#F59E0B", padding: "2px 8px", borderRadius: 10, fontWeight: 700, border: "1px solid rgba(217,119,6,0.4)" }}>
                                  +1 FREE
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button data-testid={`order-dec-${it.id}`} onClick={() => updateQty(it.id, it.quantity - 1)}
                              className="w-8 h-8 inline-flex items-center justify-center border border-white/15 hover:border-white/40 text-white/80" aria-label="Decrease">
                              <Minus size={14} />
                            </button>
                            <span className="font-body text-white w-6 text-center">{it.quantity}</span>
                            <button data-testid={`order-inc-${it.id}`} onClick={() => updateQty(it.id, it.quantity + 1)}
                              className="w-8 h-8 inline-flex items-center justify-center border border-white/15 hover:border-white/40 text-white/80" aria-label="Increase">
                              <Plus size={14} />
                            </button>
                            <div className="font-body text-[#F59E0B] w-20 text-right font-bold">Rs {lineTotal}</div>
                            <button data-testid={`order-remove-${it.id}`} onClick={() => removeItem(it.id)}
                              className="w-8 h-8 inline-flex items-center justify-center text-white/55 hover:text-[#C53030]" aria-label="Remove">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {/* Per-item discount tag */}
                        {discount && (
                          <div style={{ marginTop: 8, padding: "4px 10px", background: "rgba(217,119,6,0.08)", borderRadius: 6, display: "flex", alignItems: "center", gap: 5 }}>
                            <Tag size={10} style={{ color: "#F59E0B" }} />
                            <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 600 }}>
                              {discount.name} — {discountLabel} applied
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* ── Order total ── */}
                  <div style={{ paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    {hasDiscount && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Subtotal</span>
                          <span style={{ color: "#6b7280", textDecoration: "line-through", fontSize: 16 }}>Rs {total}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: "#10B981", display: "flex", alignItems: "center", gap: 4 }}>
                            <Gift size={11} /> Discount Savings
                          </span>
                          <span style={{ color: "#10B981", fontWeight: 700, fontSize: 16 }}>− Rs {totalSavings}</span>
                        </div>
                      </>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="font-body uppercase tracking-[0.25em] text-xs text-white/55">
                        {hasDiscount ? "Final Total" : "Total"}
                      </span>
                      <span data-testid="order-total" className="font-heading text-4xl text-white">Rs {finalTotal}</span>
                    </div>
                    {hasDiscount && (
                      <div style={{ marginTop: 10, padding: "8px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8 }}>
                        <span style={{ fontSize: 13, color: "#10B981", fontWeight: 700 }}>
                          💰 You're saving Rs {totalSavings} with active discount offers!
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Form ── */}
            <form ref={formRef} onSubmit={placeOrder} data-testid="order-form"
              className="form-reveal md:col-span-5 chalk-card p-8 space-y-6 h-fit sticky top-28">
              <h2 className="font-heading text-4xl text-white">Order Details</h2>

              <div>
                <label className="section-eyebrow block mb-3">Order Type</label>
                <div data-testid="order-type-toggle" className="grid grid-cols-2 gap-3">
                  <button type="button" data-testid="order-type-delivery" onClick={() => setOrderType("delivery")}
                    className={`flex flex-col items-center justify-center gap-1 py-4 border-2 transition-all duration-200 ${!isPickup ? "border-[#D97706] bg-[#D97706]/10 text-white" : "border-white/15 text-white/65 hover:border-white/40"}`}>
                    <Bike size={20} /><span className="font-body text-xs uppercase tracking-[0.2em]">Delivery</span>
                  </button>
                  <button type="button" data-testid="order-type-pickup" onClick={() => setOrderType("pickup")}
                    className={`flex flex-col items-center justify-center gap-1 py-4 border-2 transition-all duration-200 ${isPickup ? "border-[#D97706] bg-[#D97706]/10 text-white" : "border-white/15 text-white/65 hover:border-white/40"}`}>
                    <Store size={20} /><span className="font-body text-xs uppercase tracking-[0.2em]">Pickup</span>
                  </button>
                </div>
                {isPickup && (
                  <div data-testid="order-pickup-info" className="mt-3 p-4 border border-[#D97706]/40 bg-[#D97706]/5 space-y-2">
                    <p className="font-body text-sm text-white/85"><span className="text-[#F59E0B] font-semibold">Pickup Point:</span> {PICKUP_LOCATION}</p>
                    <p className="font-body text-xs text-white/65 leading-relaxed">We'll call you once your order is ready.</p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <p className="section-eyebrow mb-1">Your Contact Info</p>
                <p className="font-body text-xs text-white/55 mb-4">So we can reach you about your {isPickup ? "pickup" : "delivery"}.</p>
              </div>

              <div>
                <label className="section-eyebrow block mb-2">Full Name</label>
                <input data-testid="order-name" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} className="chalk-input" placeholder="e.g. Ali Raza" />
              </div>
              <div>
                <label className="section-eyebrow block mb-2">Phone</label>
                <input data-testid="order-phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="chalk-input" placeholder="03xx-xxxxxxx" />
              </div>
              {!isPickup && (
                <div>
                  <label className="section-eyebrow block mb-2">Delivery Address</label>
                  <textarea data-testid="order-address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={3} className="chalk-input resize-none" placeholder="House #, Street, Area, Samundri" />
                </div>
              )}
              {isPickup && (
                <div>
                  <label className="section-eyebrow block mb-2">Preferred Pickup Time (optional)</label>
                  <input data-testid="order-pickup-time" value={form.pickup_time} onChange={e => setForm({...form, pickup_time: e.target.value})} className="chalk-input" placeholder="e.g. 7:30 PM or ASAP" />
                </div>
              )}
              <div>
                <label className="section-eyebrow block mb-2">Notes (optional)</label>
                <textarea data-testid="order-notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="chalk-input resize-none" placeholder="Less spicy, extra naan…" />
              </div>

              {/* Order summary in form sidebar */}
              {items.length > 0 && (
                <div style={{ padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {hasDiscount ? "Final Total" : "Total"}
                    </span>
                    <div style={{ textAlign: "right" }}>
                      {hasDiscount && <span style={{ color: "#6b7280", fontSize: 12, textDecoration: "line-through", display: "block" }}>Rs {total}</span>}
                      <span style={{ color: "#F59E0B", fontSize: 24, fontWeight: 700 }}>Rs {finalTotal}</span>
                    </div>
                  </div>
                  {hasDiscount && (
                    <div style={{ marginTop: 8, fontSize: 12, color: "#10B981", fontWeight: 600 }}>
                      💰 Saving Rs {totalSavings} with active offers
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <button type="submit" data-testid="order-submit" disabled={submitting || items.length === 0} className="btn-chalk-primary w-full disabled:opacity-50">
                  {submitting ? "Placing…" : (<><ArrowRight size={16} /> {isPickup ? "Place Pickup Order" : "Place Order"}</>)}
                </button>
                <button type="button" data-testid="order-whatsapp" onClick={sendWhatsApp} className="btn-chalk-outline w-full">
                  <MessageCircle size={16} /> Send via WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Order;
