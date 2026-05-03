import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import {
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  MessageCircle,
  ShoppingBag,
  Bike,
  Store,
} from "lucide-react";
import { DoodleArrow, DoodleSwirl, DoodleCup } from "../components/Doodles";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const RESTAURANT_PHONE = "923080471471"; // WhatsApp E.164 without +
const PICKUP_LOCATION = "Shahbaz Garden, Samundri";

const Order = () => {
  const { items, updateQty, removeItem, total, clear } = useCart();
  const [orderType, setOrderType] = useState("delivery"); // delivery | pickup
  const [form, setForm] = useState({ customer_name: "", phone: "", address: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const isPickup = orderType === "pickup";

  const buildWhatsAppMessage = () => {
    const lines = [
      `*New Order — Flavors of Samundri*`,
      ``,
      `Type: ${isPickup ? "Pickup" : "Delivery"}`,
      `Name: ${form.customer_name}`,
      `Phone: ${form.phone}`,
      isPickup ? `Pickup at: ${PICKUP_LOCATION}` : `Address: ${form.address}`,
      form.notes ? `Notes: ${form.notes}` : null,
      ``,
      `*Items:*`,
      ...items.map((i) => `• ${i.name} x ${i.quantity} — Rs ${i.price * i.quantity}`),
      ``,
      `*Total: Rs ${total}*`,
    ].filter(Boolean);
    return encodeURIComponent(lines.join("\n"));
  };

  const validate = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return false;
    }
    if (!form.customer_name.trim() || !form.phone.trim()) {
      toast.error("Please fill name and phone.");
      return false;
    }
    if (!isPickup && !form.address.trim()) {
      toast.error("Please add a delivery address.");
      return false;
    }
    return true;
  };

  const sendWhatsApp = () => {
    if (!validate()) return;
    const url = `https://wa.me/${RESTAURANT_PHONE}?text=${buildWhatsAppMessage()}`;
    window.open(url, "_blank");
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        customer_name: form.customer_name,
        phone: form.phone,
        order_type: orderType,
        address: isPickup ? "" : form.address,
        notes: form.notes,
        items: items.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
        total,
      };
      const res = await axios.post(`${API}/orders`, payload);
      setSuccess(res.data);
      clear();
      toast.success(
        isPickup
          ? "Order placed! Ready for pickup shortly."
          : "Order placed! We'll call to confirm soon."
      );
    } catch (err) {
      toast.error("Order failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#111] chalk-bg pt-32 pb-32 chalk-noise min-h-screen">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 text-center" data-testid="order-success">
          <DoodleSwirl className="text-[#D97706] mx-auto" size={140} />
          <div className="section-eyebrow mt-4 mb-2">Order Received</div>
          <h1 className="font-heading text-7xl text-white chalk-text">
            Thank you, <span className="text-[#F59E0B]">{success.customer_name.split(" ")[0]}!</span>
          </h1>
          <p className="font-body text-white/70 mt-4">
            Order ID: <span data-testid="order-success-id" className="text-white">{success.id}</span>
          </p>
          <p className="font-body text-white/65 mt-2">
            {success.order_type === "pickup"
              ? <>Please pick up at <span className="text-white">{PICKUP_LOCATION}</span>. We'll call <span className="text-white">{success.phone}</span> when it's ready.</>
              : <>We'll call <span className="text-white">{success.phone}</span> within a few minutes to confirm.</>}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/menu" data-testid="order-success-menu" className="btn-chalk-outline">
              Order Something Else
            </Link>
            <Link to="/" data-testid="order-success-home" className="btn-chalk-primary">
              Back Home <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] chalk-bg pt-32 pb-24 chalk-noise">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-14 relative">
          <DoodleCup className="absolute -top-2 left-1/4 text-white/20 -rotate-12 hidden md:block" size={50} />
          <DoodleArrow className="absolute -top-2 right-1/4 text-white/20 hidden md:block" size={100} />
          <div className="section-eyebrow mb-3">Online Order</div>
          <h1
            data-testid="order-page-title"
            className="font-heading text-7xl sm:text-8xl text-white chalk-text"
          >
            Place your <span className="text-[#F59E0B]">order.</span>
          </h1>
          <p className="font-body text-white/65 mt-4 max-w-xl mx-auto">
            Choose delivery or pickup — we'll call you to confirm either way.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-10">
          {/* Cart side */}
          <div className="md:col-span-7">
            <h2 className="font-heading text-4xl text-white mb-5">Your Cart</h2>
            {items.length === 0 ? (
              <div className="chalk-card p-10 text-center">
                <ShoppingBag className="mx-auto text-white/40" size={40} />
                <p className="font-heading text-3xl text-white mt-3">Cart's empty.</p>
                <p className="font-body text-white/55 mt-1">
                  Wander over to the menu and pick a few favorites.
                </p>
                <Link to="/menu" data-testid="order-empty-menu" className="btn-chalk-primary mt-6">
                  View Menu <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((it) => (
                  <div
                    key={it.id}
                    data-testid={`order-item-${it.id}`}
                    className="chalk-card p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-body text-white truncate">{it.name}</div>
                      <div className="font-body text-xs text-white/55">Rs {it.price} each</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        data-testid={`order-dec-${it.id}`}
                        onClick={() => updateQty(it.id, it.quantity - 1)}
                        className="w-8 h-8 inline-flex items-center justify-center border border-white/15 hover:border-white/40 text-white/80"
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-body text-white w-6 text-center">{it.quantity}</span>
                      <button
                        data-testid={`order-inc-${it.id}`}
                        onClick={() => updateQty(it.id, it.quantity + 1)}
                        className="w-8 h-8 inline-flex items-center justify-center border border-white/15 hover:border-white/40 text-white/80"
                        aria-label="Increase"
                      >
                        <Plus size={14} />
                      </button>
                      <div className="font-body text-[#F59E0B] w-20 text-right">
                        Rs {it.price * it.quantity}
                      </div>
                      <button
                        data-testid={`order-remove-${it.id}`}
                        onClick={() => removeItem(it.id)}
                        className="w-8 h-8 inline-flex items-center justify-center text-white/55 hover:text-[#C53030]"
                        aria-label="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="font-body uppercase tracking-[0.25em] text-xs text-white/55">Total</span>
                  <span data-testid="order-total" className="font-heading text-4xl text-white">
                    Rs {total}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form
            onSubmit={placeOrder}
            data-testid="order-form"
            className="md:col-span-5 chalk-card p-8 space-y-6 h-fit sticky top-28"
          >
            <h2 className="font-heading text-4xl text-white">Order Details</h2>

            {/* Delivery / Pickup Toggle */}
            <div>
              <label className="section-eyebrow block mb-3">Order Type</label>
              <div
                data-testid="order-type-toggle"
                className="grid grid-cols-2 gap-3"
              >
                <button
                  type="button"
                  data-testid="order-type-delivery"
                  onClick={() => setOrderType("delivery")}
                  className={`flex flex-col items-center justify-center gap-1 py-4 border-2 transition-colors ${
                    !isPickup
                      ? "border-[#D97706] bg-[#D97706]/10 text-white"
                      : "border-white/15 text-white/65 hover:border-white/40"
                  }`}
                >
                  <Bike size={20} />
                  <span className="font-body text-xs uppercase tracking-[0.2em]">Delivery</span>
                </button>
                <button
                  type="button"
                  data-testid="order-type-pickup"
                  onClick={() => setOrderType("pickup")}
                  className={`flex flex-col items-center justify-center gap-1 py-4 border-2 transition-colors ${
                    isPickup
                      ? "border-[#D97706] bg-[#D97706]/10 text-white"
                      : "border-white/15 text-white/65 hover:border-white/40"
                  }`}
                >
                  <Store size={20} />
                  <span className="font-body text-xs uppercase tracking-[0.2em]">Pickup</span>
                </button>
              </div>
              {isPickup && (
                <p
                  data-testid="order-pickup-info"
                  className="font-body text-xs text-white/60 mt-3 border-l-2 border-[#D97706] pl-3"
                >
                  Pick up at <span className="text-white">{PICKUP_LOCATION}</span>. We'll call you when it's ready.
                </p>
              )}
            </div>

            <div>
              <label className="section-eyebrow block mb-2">Full Name</label>
              <input
                data-testid="order-name"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                className="chalk-input"
                placeholder="e.g. Ali Raza"
              />
            </div>
            <div>
              <label className="section-eyebrow block mb-2">Phone</label>
              <input
                data-testid="order-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="chalk-input"
                placeholder="03xx-xxxxxxx"
              />
            </div>
            {!isPickup && (
              <div>
                <label className="section-eyebrow block mb-2">Delivery Address</label>
                <textarea
                  data-testid="order-address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={3}
                  className="chalk-input resize-none"
                  placeholder="House #, Street, Area, Samundri"
                />
              </div>
            )}
            <div>
              <label className="section-eyebrow block mb-2">Notes (optional)</label>
              <textarea
                data-testid="order-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="chalk-input resize-none"
                placeholder="Less spicy, extra naan…"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                data-testid="order-submit"
                disabled={submitting || items.length === 0}
                className="btn-chalk-primary w-full disabled:opacity-50"
              >
                {submitting ? "Placing…" : (<><ArrowRight size={16} /> {isPickup ? "Place Pickup Order" : "Place Order"}</>)}
              </button>
              <button
                type="button"
                data-testid="order-whatsapp"
                onClick={sendWhatsApp}
                className="btn-chalk-outline w-full"
              >
                <MessageCircle size={16} /> Send via WhatsApp
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Order;
