import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowRight, Coffee, Utensils, Heart } from "lucide-react";
import MenuCard from "../components/MenuCard";
import {
  DoodleArrow,
  DoodleCoffeeBean,
  DoodleCup,
  DoodleSwirl,
  DoodleLeaf,
  DoodleStar,
} from "../components/Doodles";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
};

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const trioRef = useReveal();
  const featuredRef = useReveal();
  const ctaRef = useReveal();

  useEffect(() => {
    axios
      .get(`${API}/menu`, { params: { featured: true } })
      .then((res) => setFeatured(res.data))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <>
      <style>{`
        /* ── Continuous float animations ── */
        @keyframes floatY {
          0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          50%       { transform: translateY(-16px) rotate(var(--rot, 0deg)); }
        }
        @keyframes floatX {
          0%, 100% { transform: translateX(0px) rotate(var(--rot, 0deg)); }
          50%       { transform: translateX(12px) rotate(var(--rot, 0deg)); }
        }
        @keyframes drift {
          0%   { transform: translate(0, 0) rotate(var(--rot,0deg)); }
          25%  { transform: translate(10px, -12px) rotate(var(--rot,0deg)); }
          50%  { transform: translate(4px, -20px) rotate(var(--rot,0deg)); }
          75%  { transform: translate(-8px, -10px) rotate(var(--rot,0deg)); }
          100% { transform: translate(0, 0) rotate(var(--rot,0deg)); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.06; }
          50%       { opacity: 0.16; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .float-1 { animation: floatY 5s ease-in-out infinite; }
        .float-2 { animation: floatY 7s ease-in-out infinite; animation-delay: -2s; }
        .float-3 { animation: floatY 6s ease-in-out infinite; animation-delay: -3.5s; }
        .float-4 { animation: floatX 8s ease-in-out infinite; animation-delay: -1s; }
        .float-5 { animation: drift 11s ease-in-out infinite; animation-delay: -4s; }
        .float-6 { animation: drift 14s ease-in-out infinite; animation-delay: -7s; }
        .spin-slow { animation: spinSlow 28s linear infinite; }
        .pulse-glow { animation: pulseGlow 5s ease-in-out infinite; }

        /* ── Hero entrance animations ── */
        .animate-fade-in  { animation: fadeIn  0.8s ease both; }
        .animate-fade-up  { animation: fadeUp  0.8s ease both; }

        /* ── Scroll reveal ── */
        .scroll-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .scroll-reveal.revealed { opacity: 1; transform: translateY(0); }

        .trio-card {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .trio-card:nth-child(2) { transition-delay: 0.12s; }
        .trio-card:nth-child(3) { transition-delay: 0.24s; }
        .trio-wrap.revealed .trio-card { opacity: 1; transform: translateY(0); }

        .menu-card-wrap {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .menu-card-wrap:nth-child(2) { transition-delay: 0.08s; }
        .menu-card-wrap:nth-child(3) { transition-delay: 0.16s; }
        .menu-card-wrap:nth-child(4) { transition-delay: 0.24s; }
        .menu-card-wrap:nth-child(5) { transition-delay: 0.32s; }
        .menu-card-wrap:nth-child(6) { transition-delay: 0.40s; }
        .featured-wrap.revealed .menu-card-wrap { opacity: 1; transform: translateY(0); }

        .cta-reveal {
          opacity: 0;
          transform: scale(0.97);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .cta-reveal.revealed { opacity: 1; transform: scale(1); }
      `}</style>

      <div className="bg-[#111] chalk-bg">

        {/* ══════════════════ HERO ══════════════════ */}
        <section
          data-testid="hero-section"
          className="relative min-h-[100vh] flex items-center overflow-hidden chalk-noise"
        >
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1619581073186-5b4ae1b0caad?crop=entropy&cs=srgb&fm=jpg&w=2200&q=80"
              alt="Rustic chai cups"
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#111]/95 via-[#111]/85 to-[#111]" />
          </div>

          {/* Floating hero doodles */}
          <div className="float-1 absolute top-28 left-10 hidden md:block" style={{ "--rot": "-12deg" }}>
            <DoodleCoffeeBean className="text-white/30" size={48} />
          </div>
          <div className="float-2 absolute bottom-24 right-12 hidden md:block" style={{ "--rot": "6deg" }}>
            <DoodleCup className="text-white/25" size={70} />
          </div>
          <div className="float-5 absolute top-44 right-1/4 hidden lg:block">
            <DoodleSwirl className="text-white/15" size={140} />
          </div>
          <div className="float-3 absolute bottom-1/4 left-1/4 hidden lg:block" style={{ "--rot": "-12deg" }}>
            <DoodleLeaf className="text-white/15" size={50} />
          </div>
          <div className="float-4 absolute top-1/3 right-16 hidden xl:block">
            <DoodleStar className="text-[#F59E0B]/20" size={24} />
          </div>
          <div className="float-6 absolute bottom-1/3 left-16 hidden xl:block" style={{ "--rot": "20deg" }}>
            <DoodleLeaf className="text-white/10" size={36} />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 pt-32 pb-24 grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-9">
              <div className="flex items-center gap-3 mb-6 animate-fade-in">
                <div className="h-px w-10 bg-[#D97706]" />
                <span className="section-eyebrow">Samundri • Punjab</span>
              </div>
              <h1
                data-testid="hero-title"
                className="font-heading text-white chalk-text leading-[0.92] text-[5.5rem] sm:text-[7rem] md:text-[9rem] lg:text-[10.5rem] animate-fade-up"
              >
                Flavors of <br />
                <span className="text-[#F59E0B]">Samundri</span>
              </h1>
              <p
                data-testid="hero-tagline"
                className="font-heading text-3xl sm:text-4xl text-white/85 mt-4 animate-fade-up"
                style={{ animationDelay: "0.15s" }}
              >
                Savor every <span className="chalk-underline">sip & bite.</span>
              </p>
              <p
                className="font-body text-base sm:text-lg text-white/65 max-w-xl mt-6 leading-relaxed animate-fade-up"
                style={{ animationDelay: "0.3s" }}
              >
                Slow-cooked Punjabi classics, hand-pulled chai — served from
                a kitchen that still believes recipes are written with love, not numbers.
              </p>
              <div
                className="mt-10 flex flex-wrap items-center gap-4 animate-fade-up"
                style={{ animationDelay: "0.45s" }}
              >
                <Link to="/menu" data-testid="hero-view-menu" className="btn-chalk-primary">
                  View Menu <ArrowRight size={16} />
                </Link>
                <Link to="/order" data-testid="hero-order-now" className="btn-chalk-outline">
                  Order Now
                </Link>
              </div>
            </div>

            <div className="md:col-span-3 hidden md:flex flex-col gap-4 items-end">
              <div className="doodle-frame p-5 max-w-[220px] bg-[#1a1a1a]/50 float-2">
                <p className="font-heading text-2xl text-white leading-tight text-center">
                  "Tastes & feel like<br />Home."
                </p>
                <div className="flex items-center justify-center gap-1 mt-3 text-[#F59E0B]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <DoodleStar key={i} size={14} />
                  ))}
                </div>
                <p className="font-body text-xs text-white/55 mt-1"></p>
              </div>
              <div className="float-3">
                <DoodleArrow className="text-white/30 -rotate-6" size={120} />
              </div>
            </div>
          </div>

          {/* Marquee */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#0d0d0d]/80 backdrop-blur">
            <div className="overflow-hidden py-3">
              <div className="marquee font-heading text-white/55 text-2xl">
                {Array.from({ length: 2 }).map((_, k) => (
                  <div key={k} className="flex items-center gap-12 pr-12">
                    <span>★ Karahi</span><span>·</span>
                    <span>Doodh Patti</span><span>·</span>
                    <span>Paratha</span><span>·</span>
                    <span>Biryani</span><span>·</span>
                    <span>Daal</span><span>·</span>
                    <span>Sandwich</span><span>·</span>
                    <span>Fries</span><span>·</span>
                    <span>Burger</span><span>·</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════ TRIO STRIP ══════════════════ */}
        <section className="py-24 sm:py-32 chalk-noise relative overflow-hidden">

          {/* floating bg doodles */}
          <div className="float-1 absolute top-8 left-8 hidden lg:block" style={{ "--rot": "15deg" }}>
            <DoodleLeaf className="text-white/8" size={40} />
          </div>
          <div className="float-4 absolute bottom-8 right-12 hidden lg:block" style={{ "--rot": "-10deg" }}>
            <DoodleCoffeeBean className="text-white/8" size={36} />
          </div>
          <div className="float-5 absolute top-1/2 right-1/4 hidden xl:block">
            <DoodleStar className="text-[#D97706]/10" size={20} />
          </div>

          <div
            ref={trioRef}
            className="trio-wrap max-w-7xl mx-auto px-6 sm:px-8 grid md:grid-cols-3 gap-10 relative z-10"
          >
            {[
              { icon: Utensils, title: "Home Cooked", text: "Recipes our mothers and grandmothers handed down — never shortcut, always slow." },
              { icon: Coffee,   title: "Brewed Slow",  text: "Doodh patti pulled the village way." },
              { icon: Heart,    title: "Made with Love", text: "Small batches, fresh herbs, and a whole lot of heart on every plate." },
            ].map((b, i) => (
              <div key={i} className="trio-card group">
                <div className="w-12 h-12 rounded-xl bg-[#D97706]/10 flex items-center justify-center mb-4 group-hover:bg-[#D97706]/20 transition-colors">
                  <b.icon className="text-[#D97706]" size={24} />
                </div>
                <h3 className="font-heading text-4xl text-white mt-3">{b.title}</h3>
                <p className="font-body text-white/65 mt-2 leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════ FEATURED MENU ══════════════════ */}
        <section
          data-testid="featured-menu-section"
          className="py-24 sm:py-32 border-t border-white/5 relative overflow-hidden"
        >
          {/* floating bg doodles */}
          <div className="float-2 absolute top-12 right-10 hidden lg:block" style={{ "--rot": "-15deg" }}>
            <DoodleSwirl className="text-white/6" size={100} />
          </div>
          <div className="float-6 absolute bottom-16 left-8 hidden lg:block" style={{ "--rot": "20deg" }}>
            <DoodleLeaf className="text-[#F59E0B]/8" size={44} />
          </div>

          {/* Large spinning swirl */}
          <div
            className="absolute top-1/2 right-0 -translate-y-1/2 spin-slow pulse-glow hidden xl:block"
            style={{ pointerEvents: "none" }}
          >
            <DoodleSwirl className="text-[#D97706]" size={350} />
          </div>

          <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
            <div
              ref={featuredRef}
              className="featured-wrap"
            >
              <div className="scroll-reveal flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                <div>
                  <div className="section-eyebrow mb-3">From the Chalkboard</div>
                  <h2 className="font-heading text-6xl sm:text-7xl text-white chalk-text">
                    Today's <span className="text-[#F59E0B]">Specials</span>
                  </h2>
                </div>
                <Link
                  to="/menu"
                  data-testid="featured-view-all"
                  className="font-body text-sm uppercase tracking-[0.25em] text-white/80 hover:text-[#F59E0B] inline-flex items-center gap-2"
                >
                  See full menu <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.slice(0, 6).map((item) => (
                  <div key={item.id} className="menu-card-wrap">
                    <MenuCard item={item} withImage={!!item.image} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════ CTA STRIP ══════════════════ */}
        <section className="py-20 border-t border-white/5 relative overflow-hidden">

          {/* floating doodles */}
          <div className="float-1 absolute top-6 left-12 hidden lg:block" style={{ "--rot": "-20deg" }}>
            <DoodleCoffeeBean className="text-white/10" size={38} />
          </div>
          <div className="float-3 absolute bottom-6 right-14 hidden lg:block" style={{ "--rot": "12deg" }}>
            <DoodleLeaf className="text-[#D97706]/12" size={34} />
          </div>
          <div className="float-4 absolute top-1/2 left-1/3 hidden xl:block">
            <DoodleStar className="text-white/8" size={18} />
          </div>

          <div
            ref={ctaRef}
            className="cta-reveal max-w-5xl mx-auto px-6 sm:px-8 text-center relative z-10"
          >
            <div className="float-5 absolute -top-4 left-1/2 -translate-x-1/2 hidden md:block">
              <DoodleSwirl className="text-white/20" size={140} />
            </div>
            <h2 className="font-heading text-6xl sm:text-7xl text-white chalk-text">
              Hungry yet?
            </h2>
            <p className="font-body text-white/65 mt-3 max-w-xl mx-auto">
              Order online, or pick up — there's always a fresh kettle on.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/order" data-testid="cta-order-now" className="btn-chalk-primary">
                Order Now <ArrowRight size={16} />
              </Link>
              <Link to="/contact" data-testid="cta-visit" className="btn-chalk-outline">
                Contact Us
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default Home;
