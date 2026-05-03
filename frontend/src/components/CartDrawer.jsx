import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { DoodleCup } from "./Doodles";

const CartDrawer = () => {
  const { items, updateQty, removeItem, total, open, setOpen, clear } = useCart();
  const navigate = useNavigate();

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

        <div className="px-6 py-4 max-h-[calc(100vh-260px)] overflow-y-auto space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-heading text-3xl text-white/85 mb-2">It's a little quiet here…</p>
              <p className="font-body text-sm text-white/60">Add something warm from the menu.</p>
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.id}
                data-testid={`cart-item-${it.id}`}
                className="flex items-center justify-between gap-3 chalk-card p-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-body text-white truncate">{it.name}</div>
                  <div className="font-body text-xs text-white/55">Rs {it.price}</div>
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
            ))
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-6 bg-[#0e0e0e]">
          <div className="flex items-center justify-between mb-4">
            <span className="font-body uppercase tracking-[0.25em] text-xs text-white/55">Subtotal</span>
            <span data-testid="cart-total" className="font-heading text-3xl text-white">Rs {total}</span>
          </div>
          <Button
            data-testid="cart-checkout-btn"
            disabled={items.length === 0}
            onClick={() => {
              setOpen(false);
              navigate("/order");
            }}
            className="w-full btn-chalk-primary disabled:opacity-50"
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
