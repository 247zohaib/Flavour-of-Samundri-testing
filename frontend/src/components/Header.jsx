import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, Menu as MenuIcon, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { DoodleCup } from "./Doodles";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/order", label: "Order" },
];

const Header = () => {
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#111111]/95 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        <Link to="/" data-testid="brand-link" className="flex items-center gap-3 group">
          <DoodleCup className="text-white/85 group-hover:text-[#F59E0B] transition-colors -rotate-6" size={36} />
          <div className="leading-none">
            <div className="font-heading text-3xl text-white -mb-1 chalk-text">Flavors</div>
            <div className="text-[10px] tracking-[0.35em] uppercase text-white/60">of Samundri</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={`nav-link-${item.label.toLowerCase()}`}
              className={({ isActive }) =>
                `relative font-body text-sm uppercase tracking-[0.2em] transition-colors ${
                  isActive ? "text-[#F59E0B]" : "text-white/85 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 right-0 h-[3px] bg-[radial-gradient(rgba(245,158,11,0.9)_1px,transparent_1.4px)] [background-size:6px_4px]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            data-testid="header-cart-button"
            onClick={() => setOpen(true)}
            className="relative inline-flex items-center justify-center w-11 h-11 border border-white/20 hover:border-white/60 text-white transition-colors rounded-sm"
            aria-label="Open cart"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span
                data-testid="cart-badge"
                className="absolute -top-2 -right-2 bg-[#D97706] text-black text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
              >
                {count}
              </span>
            )}
          </button>

          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 border border-white/20 hover:border-white/60 text-white rounded-sm"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#0e0e0e] border-t border-white/10">
          <div className="px-6 py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                data-testid={`mobile-nav-link-${item.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `font-body text-sm uppercase tracking-[0.2em] py-2 ${
                    isActive ? "text-[#F59E0B]" : "text-white/85"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
