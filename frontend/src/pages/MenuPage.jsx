import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MenuCard from "../components/MenuCard";
import { DoodleArrow, DoodleCoffeeBean, DoodleSwirl } from "../components/Doodles";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MenuPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);

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
    return () => {
      mounted = false;
    };
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
    <div className="bg-[#111] chalk-bg pt-32 pb-24 chalk-noise">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-14 relative">
          <DoodleCoffeeBean className="absolute -top-4 left-1/4 text-white/25 -rotate-12 hidden md:block" size={36} />
          <DoodleSwirl className="absolute -top-2 right-1/4 text-white/20 hidden md:block" size={120} />
          <div className="section-eyebrow mb-3">The Chalkboard</div>
          <h1
            data-testid="menu-page-title"
            className="font-heading text-7xl sm:text-8xl text-white chalk-text"
          >
            Our <span className="text-[#F59E0B]">Menu</span>
          </h1>
          <p className="font-body text-white/65 mt-4 max-w-2xl mx-auto">
            Hand-written every morning. Cooked fresh every hour. Prices in PKR.
          </p>
        </div>

        {/* Category tabs */}
        <div data-testid="menu-categories" className="flex flex-wrap items-center justify-center gap-3 mb-14">
          {categories.map((c) => (
            <button
              key={c}
              data-testid={`menu-category-${c.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setActive(c)}
              className={`px-5 py-2 font-body text-xs uppercase tracking-[0.25em] border transition-colors ${
                active === c
                  ? "bg-[#D97706] border-[#D97706] text-black"
                  : "bg-transparent border-white/20 text-white/80 hover:border-white/60"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-white/50 font-body">Brewing the menu…</p>
        ) : (
          <div className="space-y-20">
            {grouped.map((group) => (
              <div key={group.category} data-testid={`menu-group-${group.category.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="font-heading text-5xl text-white">{group.category}</h2>
                  <DoodleArrow className="text-white/30 hidden sm:block" size={80} />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.items.map((it) => (
                    <MenuCard key={it.id} item={it} withImage={!!it.image} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
