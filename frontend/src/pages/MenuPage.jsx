import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import MenuCard from "../components/MenuCard";
import { DoodleArrow, DoodleCoffeeBean, DoodleSwirl, DoodleCup, DoodleLeaf, DoodleStar } from "../components/Doodles";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("revealed"); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
};

const MenuPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);
  const headerRef = useReveal();

  useEffect(() => {
    let mounted = true;
    Promise.all([
      axios.get(`${API}/menu`),
      axios.get(`${API}/menu/categories`),
    ])
      .then(([m, c]) => {
        if (!mounted) return;
        setItems(m.data);
        setCategories(["All", ...c.data]);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(
    () => (active === "All" ? items : items.filter((i) => i.category === active)),
    [items, active]
  );

  const grouped = useMemo(() => {
    const order = categories.filter((c) => c !== "All");
    const map = {};
    for (const it of filtered) {
      if (!map[it.category]) map[it.category] = [];
      map[it.category].push(it);
    }
    return order.filter((c) => map[c]).map((c) => ({ category: c, items: map[c] }));
  }, [filtered, categories]);

  return (
    <>
      <style>{`
        @keyframes floatY {
          0%,100% { transform: translateY(0px) rotate(var(--rot,0deg)); }
          50%      { transform: translateY(-16px) rotate(var(--rot,0deg)); }
        }
        @keyframes floatX {
          0%,100% { transform: translateX(0px); }
          50%     { transform: translateX(12px); }
        }
        @keyframes drift {
          0%   { transform: translate(0,0) rotate(var(--rot,0deg)); }
          25%  { transform: translate(10px,-12px) rotate(var(--rot,0deg)); }
          50%  { transform: translate(4px,-20px) rotate(var(--rot,0deg)); }
          75%  { transform: translate(-8px,-10px) rotate(var(--rot,0deg)); }
          100% { transform: translate(0,0) rotate(var(--rot,0deg)); }
        }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulseGlow { 0%,100%{opacity:0.05} 50%{opacity:0.13} }

        .float-1 { animation: floatY 5s ease-in-out infinite; }
        .float-2 { animation: floatY 7s ease-in-out infinite; animation-delay: -2s; }
        .float-3 { animation: floatY 6s ease-in-out infinite; animation-delay: -3.5s; }
        .float-4 { animation: floatX 8s ease-in-out infinite; animation-delay: -1s; }
        .float-5 { animation: drift 11s ease-in-out infinite; animation-delay: -4s; }
        .float-6 { animation: drift 14s ease-in-out infinite; animation-delay: -7s; }
        .spin-slow { animation: spinSlow 28s linear infinite; }
        .pulse-glow { animation: pulseGlow 5s ease-in-out infinite; }

        .header-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .header-reveal.revealed { opacity: 1; transform: translateY(0); }
        .group-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .group-reveal.revealed { opacity: 1; transform: translateY(0); }
        .menu-card-item { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .menu-card-item:nth-child(2) { transition-delay: 0.08s; }
        .menu-card-item:nth-child(3) { transition-delay: 0.16s; }
        .menu-card-item:nth-child(4) { transition-delay: 0.24s; }
        .menu-card-item:nth-child(5) { transition-delay: 0.32s; }
        .menu-card-item:nth-child(6) { transition-delay: 0.40s; }
        .group-reveal.revealed .menu-card-item { opacity: 1; transform: translateY(0); }
        .tab-btn { transition: all 0.2s ease; }
        .tab-btn:hover { transform: translateY(-2px); }
        .tab-btn.active-tab { transform: translateY(-2px); }
      `}</style>

      <div className="bg-[#111] chalk-bg pt-32 pb-24 chalk-noise relative overflow-hidden">

        {/* Floating doodles */}
        <div className="float-1 absolute top-20 left-6 hidden lg:block" style={{ "--rot": "-15deg" }}><DoodleCoffeeBean className="text-white/10" size={48} /></div>
        <div className="float-3 absolute top-40 left-28 hidden xl:block" style={{ "--rot": "20deg" }}><DoodleLeaf className="text-[#D97706]/12" size={32} /></div>
        <div className="float-2 absolute top-24 right-10 hidden lg:block" style={{ "--rot": "10deg" }}><DoodleSwirl className="text-white/6" size={110} /></div>
        <div className="float-4 absolute top-48 right-36 hidden xl:block"><DoodleStar className="text-[#F59E0B]/12" size={22} /></div>
        <div className="float-5 absolute top-1/3 left-4 hidden lg:block" style={{ "--rot": "30deg" }}><DoodleStar className="text-[#D97706]/10" size={26} /></div>
        <div className="float-6 absolute top-[45%] left-16 hidden xl:block" style={{ "--rot": "-20deg" }}><DoodleCoffeeBean className="text-white/8" size={36} /></div>
        <div className="float-2 absolute top-[40%] right-6 hidden lg:block" style={{ "--rot": "-12deg" }}><DoodleCup className="text-white/8" size={56} /></div>
        <div className="float-3 absolute top-[60%] right-24 hidden xl:block" style={{ "--rot": "15deg" }}><DoodleLeaf className="text-[#F59E0B]/8" size={30} /></div>
        <div className="float-1 absolute bottom-40 left-10 hidden lg:block" style={{ "--rot": "25deg" }}><DoodleLeaf className="text-white/8" size={42} /></div>
        <div className="float-4 absolute bottom-24 right-14 hidden lg:block" style={{ "--rot": "-18deg" }}><DoodleCoffeeBean className="text-white/8" size={38} /></div>
        <div className="float-5 absolute bottom-36 left-1/3 hidden lg:block"><DoodleStar className="text-[#D97706]/12" size={18} /></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 spin-slow pulse-glow hidden lg:block" style={{ pointerEvents: "none" }}>
          <DoodleSwirl className="text-[#D97706]" size={600} />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div ref={headerRef} className="header-reveal text-center mb-14 relative">
            <div className="float-2 absolute -top-4 left-1/4 hidden md:block"><DoodleCoffeeBean className="text-white/25 -rotate-12" size={36} /></div>
            <div className="float-5 absolute -top-2 right-1/4 hidden md:block"><DoodleSwirl className="text-white/20" size={120} /></div>
            <div className="section-eyebrow mb-3">The Chalkboard</div>
            <h1 data-testid="menu-page-title" className="font-heading text-7xl sm:text-8xl text-white chalk-text">
              Our <span className="text-[#F59E0B]">Menu</span>
            </h1>
            <p className="font-body text-white/65 mt-4 max-w-2xl mx-auto">
              Hand-written every morning. Cooked fresh every hour. Prices in PKR.
            </p>
          </div>

          <div data-testid="menu-categories" className="flex flex-wrap items-center justify-center gap-3 mb-14">
            {categories.map((c) => (
              <button key={c}
                data-testid={`menu-category-${c.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setActive(c)}
                className={`tab-btn px-5 py-2 font-body text-xs uppercase tracking-[0.25em] border transition-colors ${
                  active === c ? "active-tab bg-[#D97706] border-[#D97706] text-black" : "bg-transparent border-white/20 text-white/80 hover:border-white/60"
                }`}>
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="float-1 inline-block"><DoodleCup className="text-white/30 mx-auto" size={48} /></div>
              <p className="text-white/50 font-body mt-4">Brewing the menu…</p>
            </div>
          ) : (
            <div className="space-y-20">
              {grouped.map((group) => <GroupSection key={group.category} group={group} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const GroupSection = ({ group }) => {
  const ref = useReveal();
  return (
    <div ref={ref} className="group-reveal" data-testid={`menu-group-${group.category.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center gap-4 mb-8">
        <h2 className="font-heading text-5xl text-white">{group.category}</h2>
        <div className="float-3"><DoodleArrow className="text-white/30 hidden sm:block" size={80} /></div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {group.items.map((it) => (
          <div key={it.id} className="menu-card-item">
            <MenuCard item={it} withImage={!!it.image} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
