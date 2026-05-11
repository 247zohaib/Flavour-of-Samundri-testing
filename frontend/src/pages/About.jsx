import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Flame, MapPin } from "lucide-react";
import {
  DoodleCoffeeBean,
  DoodleCup,
  DoodleSwirl,
  DoodleLeaf,
  DoodleStar,
} from "../components/Doodles";

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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
};

const About = () => {
  const introRef = useReveal();
  const imageRef = useReveal();
  const pillarsRef = useReveal();
  const quoteRef = useReveal();

  return (
    <>
      <style>{`
        /* ── Scroll reveals ── */
        .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.revealed { opacity: 1; transform: translateY(0); }

        .reveal-image {
          opacity: 0;
          transform: translateX(32px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .reveal-image.revealed { opacity: 1; transform: translateX(0); }

        .pillar-card {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .pillar-card:nth-child(2) { transition-delay: 0.12s; }
        .pillar-card:nth-child(3) { transition-delay: 0.24s; }
        .pillars-grid.revealed .pillar-card { opacity: 1; transform: translateY(0); }

        .quote-reveal {
          opacity: 0;
          transform: scale(0.96);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }
        .quote-reveal.revealed { opacity: 1; transform: scale(1); }

        /* ── Continuous float animations ── */
        @keyframes floatY {
          0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          50%       { transform: translateY(-18px) rotate(var(--rot, 0deg)); }
        }
        @keyframes floatX {
          0%, 100% { transform: translateX(0px) rotate(var(--rot, 0deg)); }
          50%       { transform: translateX(14px) rotate(var(--rot, 0deg)); }
        }
        @keyframes floatDiag {
          0%, 100% { transform: translate(0px, 0px) rotate(var(--rot, 0deg)); }
          33%       { transform: translate(10px, -14px) rotate(var(--rot, 0deg)); }
          66%       { transform: translate(-8px, -8px) rotate(var(--rot, 0deg)); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.06; transform: scale(1); }
          50%       { opacity: 0.14; transform: scale(1.06); }
        }
        @keyframes drift {
          0%   { transform: translate(0, 0) rotate(var(--rot,0deg)); }
          25%  { transform: translate(12px, -10px) rotate(var(--rot,0deg)); }
          50%  { transform: translate(6px, -20px) rotate(var(--rot,0deg)); }
          75%  { transform: translate(-8px, -12px) rotate(var(--rot,0deg)); }
          100% { transform: translate(0, 0) rotate(var(--rot,0deg)); }
        }

        .float-1 { animation: floatY 5s ease-in-out infinite; }
        .float-2 { animation: floatY 7s ease-in-out infinite; animation-delay: -2s; }
        .float-3 { animation: floatY 6s ease-in-out infinite; animation-delay: -3.5s; }
        .float-4 { animation: floatX 8s ease-in-out infinite; animation-delay: -1s; }
        .float-5 { animation: floatDiag 9s ease-in-out infinite; animation-delay: -4s; }
        .float-6 { animation: drift 12s ease-in-out infinite; animation-delay: -6s; }
        .float-7 { animation: drift 15s ease-in-out infinite; animation-delay: -3s; }
        .spin-slow { animation: spinSlow 25s linear infinite; }
        .pulse-glow { animation: pulse-glow 5s ease-in-out infinite; }

        /* ── Misc ── */
        .img-zoom { transition: transform 0.6s ease; }
        .img-zoom:hover { transform: scale(1.03); }
        .about-line {
          display: inline-block; width: 40px; height: 2px;
          background: #D97706; margin-right: 12px; vertical-align: middle;
        }
      `}</style>

      <div className="bg-[#111] chalk-bg pt-32 pb-24 chalk-noise" style={{ overflow: "hidden", position: "relative" }}>

        {/* ── Floating background doodles ── */}
        <div className="absolute top-16 left-8 float-1 hidden lg:block" style={{ "--rot": "-15deg" }}>
          <DoodleCoffeeBean className="text-white/10" size={52} />
        </div>
        <div className="absolute top-36 left-32 float-3 hidden lg:block" style={{ "--rot": "20deg" }}>
          <DoodleLeaf className="text-[#D97706]/15" size={34} />
        </div>
        <div className="absolute top-24 left-56 float-5 hidden xl:block">
          <DoodleStar className="text-white/10" size={22} />
        </div>
        <div className="absolute top-20 right-12 float-2 hidden lg:block" style={{ "--rot": "10deg" }}>
          <DoodleSwirl className="text-white/8" size={110} />
        </div>
        <div className="absolute top-48 right-40 float-4 hidden xl:block" style={{ "--rot": "-8deg" }}>
          <DoodleLeaf className="text-[#F59E0B]/12" size={28} />
        </div>
        <div className="absolute top-1/3 left-4 float-6 hidden lg:block" style={{ "--rot": "30deg" }}>
          <DoodleStar className="text-[#D97706]/12" size={28} />
        </div>
        <div className="absolute top-[45%] left-20 float-2 hidden xl:block" style={{ "--rot": "-20deg" }}>
          <DoodleCoffeeBean className="text-white/8" size={38} />
        </div>
        <div className="absolute top-[38%] right-8 float-7 hidden lg:block" style={{ "--rot": "-12deg" }}>
          <DoodleCup className="text-white/8" size={60} />
        </div>
        <div className="absolute top-[55%] right-28 float-3 hidden xl:block" style={{ "--rot": "15deg" }}>
          <DoodleLeaf className="text-[#F59E0B]/10" size={32} />
        </div>
        <div className="absolute bottom-40 left-12 float-1 hidden lg:block" style={{ "--rot": "25deg" }}>
          <DoodleLeaf className="text-white/8" size={44} />
        </div>
        <div className="absolute bottom-32 left-1/3 float-5 hidden lg:block">
          <DoodleStar className="text-[#D97706]/15" size={20} />
        </div>
        <div className="absolute bottom-24 right-16 float-4 hidden lg:block" style={{ "--rot": "-18deg" }}>
          <DoodleCoffeeBean className="text-white/10" size={40} />
        </div>

        {/* Large slow-spinning swirl in the center background */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 spin-slow pulse-glow hidden lg:block"
          style={{ pointerEvents: "none" }}
        >
          <DoodleSwirl className="text-[#D97706]" size={520} />
        </div>

        {/* ── Main Content ── */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">

          {/* Intro */}
          <div className="grid md:grid-cols-12 gap-10 items-center mb-24">
            <div ref={introRef} className="md:col-span-7 reveal">
              <div className="flex items-center mb-4">
                <span className="about-line" />
                <span className="section-eyebrow">Our Story</span>
              </div>
              <h1
                data-testid="about-title"
                className="font-heading text-7xl sm:text-8xl text-white chalk-text leading-[0.95]"
              >
                Cooked the <br />
                <span className="text-[#F59E0B]">slow way.</span>
              </h1>
              <p className="font-body text-white/70 mt-6 max-w-xl leading-relaxed text-lg">
                Flavors of Samundri began in a small home kitchen, where the smell of cardamom and
                ghee meant family was about to gather. We've kept it that way — honest food, real
                spices, and a chai pot that never empties.
              </p>
              <p className="font-body text-white/60 mt-4 max-w-xl leading-relaxed">
                Every karahi is built from scratch. Every paratha is rolled by hand. Every cup of
                doodh patti is brewed slow enough that you can hear it bubble. We don't believe in
                shortcuts; we believe in stories on a plate.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-8 mt-10 mb-8 border-t border-white/10 pt-8">
                {[
                  { value: "100%", label: "Home Cooked" },
                  { value: "Fresh", label: "Every Day" },
                  { value: "Samundri", label: "Made Here" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="font-heading text-3xl text-[#F59E0B]">{s.value}</div>
                    <div className="font-body text-xs text-white/50 uppercase tracking-widest mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              <Link to="/menu" data-testid="about-explore-menu" className="btn-chalk-primary inline-flex">
                Explore the Menu <ArrowRight size={16} />
              </Link>
            </div>

            <div ref={imageRef} className="md:col-span-5 relative reveal-image">
              <div className="aspect-[4/5] overflow-hidden border border-white/15 doodle-frame">
                <img
                  src="https://images.unsplash.com/photo-1646398123647-695431536f7c?crop=entropy&cs=srgb&fm=jpg&w=1100&q=85"
                  alt="Pakistani food spread"
                  className="w-full h-full object-cover grayscale-[10%] img-zoom"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 bg-[#1a1a1a] border border-white/15 rounded-xl px-5 py-3 hidden md:block shadow-xl float-2">
                <p className="font-heading text-2xl text-[#F59E0B]">Since Day One</p>
                <p className="font-body text-xs text-white/50 mt-0.5">Home kitchen roots</p>
              </div>
              <div className="float-1 absolute -top-10 -right-6 hidden md:block">
                <DoodleCup className="text-white/25 -rotate-12" size={70} />
              </div>
              <div className="float-5 absolute -bottom-6 -left-8 hidden md:block">
                <DoodleSwirl className="text-white/20" size={140} />
              </div>
            </div>
          </div>

          {/* Pillars */}
          <div ref={pillarsRef} className="pillars-grid grid md:grid-cols-3 gap-6 mb-24">
            {[
              {
                icon: Leaf,
                title: "Quality Ingredients",
                text: "Sourced from local mandis daily. Fresh herbs, real ghee, and spices ground in small batches.",
              },
              {
                icon: Flame,
                title: "Slow-Cooked Passion",
                text: "Karahis simmered for hours, biryani layered grain by grain — patience is our secret ingredient.",
              },
              {
                icon: MapPin,
                title: "Local & Proud",
                text: "From the streets of Samundri to your table — real food, real roots, real flavor.",
              },
            ].map((p, i) => (
              <div
                key={i}
                data-testid={`about-pillar-${i}`}
                className="pillar-card chalk-card p-8 hover-lift relative group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#D97706]/10 flex items-center justify-center mb-4 group-hover:bg-[#D97706]/20 transition-colors">
                  <p.icon className="text-[#D97706]" size={24} />
                </div>
                <h3 className="font-heading text-4xl text-white mt-1">{p.title}</h3>
                <p className="font-body text-white/65 mt-2 leading-relaxed">{p.text}</p>
                <div className="float-3 absolute top-4 right-4">
                  <DoodleStar className="text-white/15" size={18} />
                </div>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#D97706]/50 group-hover:w-full transition-all duration-500 rounded-b-xl" />
              </div>
            ))}
          </div>

          {/* Quote */}
          <div ref={quoteRef} className="text-center max-w-3xl mx-auto relative quote-reveal">
            <div className="float-1 absolute -top-6 left-2 hidden md:block">
              <DoodleCoffeeBean className="text-white/25 -rotate-12" size={36} />
            </div>
            <div className="float-2 absolute -top-5 right-2 hidden md:block">
              <DoodleLeaf className="text-white/25 rotate-12" size={36} />
            </div>
            <div className="w-12 h-px bg-[#D97706]/50 mx-auto mb-8" />
            <p className="font-heading text-5xl sm:text-6xl text-white chalk-text leading-tight">
              "We don't just serve food.<br />
              <span className="text-[#F59E0B]">We serve memory.</span>"
            </p>
            <p className="font-body text-white/55 mt-5 uppercase tracking-[0.3em] text-xs">
              — The Samundri Kitchen
            </p>
            <div className="w-12 h-px bg-[#D97706]/50 mx-auto mt-8" />
          </div>

        </div>
      </div>
    </>
  );
};

export default About;
