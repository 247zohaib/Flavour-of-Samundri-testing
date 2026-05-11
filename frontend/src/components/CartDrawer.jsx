import React from "react";
import { useCart } from "../context/CartContext";
import { useDiscounts, getDiscountLabel, getDiscountedPrice } from "../context/DiscountContext";
import { useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2, Tag } from "lucide-react";
import { Button } from "./ui/button";
import { DoodleCup } from "./Doodles";

const CartDrawer = () => {
  const { items, updateQty, removeItem, total, open, setOpen, clear } = useCart();
  const { getItemDiscount } = useDiscounts();
  const navigate = useNavigate();

  // Calculate discounted total
  const discountedTotal = items.reduce((sum, it) => {
    const discount = getItemDiscount(it.name);
    const dp = getDiscountedPrice(it.price, discount);
    return sum + (dp !== null ? dp : it.price) * it.quantity;
  }, 0);

  const hasDiscount = discountedTotal < total;

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        data-testid="cart-drawer"
        className={`fixed top-0 right-0 z-[70] h-full w-full sm:w-[420px] bg-[#0e0e0e] border-l border-white/10 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-20 border-b border-white/10">
          <div className="flex items-center gap-2">
            <DoodleCup className="text-[#D97706] -rotate-6" size={26} />
            <h3 className="font-heading text-3xl text-white">Your Order</h3>
          </div>
          <button
            data-testid="cart-close"
            onClick={() => setOpen(false)}
            className="w-9 h-9 inline-flex items-center justify-center border border-white/15 hover:border-white/40 text-white/80"
            aria-label="Close cart"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-4 max-h-[calc(100vh-280px)] overflow-y-auto space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-heading text-3xl text-white/85 mb-2">It's a little quiet here…</p>
              <p className="font-body text-sm text-white/60">Add something warm from the menu.</p>
            </div>
          ) : (
            items.map((it) => {
              const discount = getItemDiscount(it.name);
              const discountLabel = getDiscountLabel(discount);
              const discountedPrice = getDiscountedPrice(it.price, discount);
              const isBogo = discount?.type === "bogo";

              return (
                <div
                  key={it.id}
                  data-testid={`cart-item-${it.id}`}
                  className="chalk-card p-4"
                  style={{ border: discount ? "1px solid rgba(217,119,6,0.3)" : undefined }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-body text-white truncate">{it.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        {discountedPrice !== null ? (
                          <>
                            <span style={{ color: "#6b7280", fontSize: 11, textDecoration: "line-through" }}>Rs {it.price}</span>
                            <span className="font-body text-xs text-[#F59E0B]">Rs {discountedPrice}</span>
                          </>
                        ) : (
                          <span className="font-body text-xs text-white/55">Rs {it.price}</span>
                        )}
                        {isBogo && (
                          <span style={{ fontSize: 10, background: "rgba(217,119,6,0.15)", color: "#F59E0B", padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>+1 FREE</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        data-testid={`cart-decrement-${it.id}`}
                        onClick={() => updateQty(it.id, it.quantity - 1)}
                        className="w-8 h-8 inline-flex items-center justify-center border border-white/15 hover:border-white/40 text-white/80"
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-body text-white w-6 text-center">{it.quantity}</span>
                      <button
                        data-testid={`cart-increment-${it.id}`}
                        onClick={() => updateQty(it.id, it.quantity + 1)}
                        className="w-8 h-8 inline-flex items-center justify-center border border-white/15 hover:border-white/40 text-white/80"
                        aria-label="Increase"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        data-testid={`cart-remove-${it.id}`}
                        onClick={() => removeItem(it.id)}
                        className="w-8 h-8 inline-flex items-center justify-center text-white/60 hover:text-[#C53030]"
                        aria-label="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Discount strip on cart item */}
                  {discount && (
                    <div style={{
                      marginTop: 8, padding: "4px 8px",
                      background: "rgba(217,119,6,0.1)", borderRadius: 5,
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      <Tag size={10} style={{ color: "#F59E0B" }} />
                      <span style={{ fontSize: 10, color: "#F59E0B", fontWeight: 600 }}>
                        {discount.name} — {discountLabel}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-6 bg-[#0e0e0e]">
          {/* Discount savings summary */}
          {hasDiscount && (
            <div style={{
              marginBottom: 10, padding: "8px 12px",
              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 7, display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>💰 You're saving</span>
              <span style={{ fontSize: 13, color: "#10B981", fontWeight: 700 }}>Rs {total - discountedTotal}</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-1">
            <span className="font-body uppercase tracking-[0.25em] text-xs text-white/55">Subtotal</span>
            <div style={{ textAlign: "right" }}>
              {hasDiscount && (
                <span style={{ color: "#6b7280", fontSize: 12, textDecoration: "line-through", display: "block" }}>Rs {total}</span>
              )}
              <span data-testid="cart-total" className="font-heading text-3xl text-white">
                Rs {hasDiscount ? discountedTotal : total}
              </span>
            </div>
          </div>

          <Button
            data-testid="cart-checkout-btn"
            disabled={items.length === 0}
            onClick={() => { setOpen(false); navigate("/order"); }}
            className="w-full btn-chalk-primary disabled:opacity-50 mt-3"
          >
            Proceed to Checkout
          </Button>
          {items.length > 0 && (
            <button
              data-testid="cart-clear"
              onClick={clear}
              className="w-full mt-3 font-body text-xs text-white/50 hover:text-white/80 uppercase tracking-[0.25em]"
            >
              Clear cart
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
