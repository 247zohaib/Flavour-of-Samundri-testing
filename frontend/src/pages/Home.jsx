import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Coffee, Utensils, Heart } from "lucide-react";
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

const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/menu`, { params: { featured: true } })
      .then((res) => setFeatured(res.data))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <div className="bg-[#111] chalk-bg">
      {/* HERO */}
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

        {/* doodles */}
        <DoodleCoffeeBean className="absolute top-28 left-10 text-white/30 -rotate-12 hidden md:block" size={48} />
        <DoodleCup className="absolute bottom-24 right-12 text-white/25 rotate-6 hidden md:block" size={70} />
        <DoodleSwirl className="absolute top-44 right-1/4 text-white/15 hidden lg:block" size={140} />
        <DoodleLeaf className="absolute bottom-1/4 left-1/4 text-white/15 -rotate-12 hidden lg:block" size={50} />

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
              Slow-cooked Punjabi classics, hand-pulled chai, and rustic coffee — served from
              a kitchen that still believes recipes are written with love, not numbers.
            </p>

            <div
              className="mt-10 flex flex-wrap items-center gap-4 animate-fade-up"
              style={{ animationDelay: "0.45s" }}
            >
              <Link to="/menu" data-testid="hero-view-menu" className="btn-chalk-primary">
                View Menu <ArrowRight size={16} />
              </Link>
              <Link to="/contact" data-testid="hero-visit-us" className="btn-chalk-outline">
                <MapPin size={16} /> Visit Us
              </Link>
              <Link to="/order" data-testid="hero-order-now" className="btn-chalk-outline">
                Order Now
              </Link>
            </div>
          </div>
          <div className="md:col-span-3 hidden md:flex flex-col gap-4 items-end">
            <div className="doodle-frame p-5 max-w-[220px] bg-[#1a1a1a]/50">
              <p className="font-heading text-2xl text-white leading-tight">
                "Tastes like<br />Naani's kitchen."
              </p>
              <div className="flex items-center gap-1 mt-3 text-[#F59E0B]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <DoodleStar key={i} size={14} />
                ))}
              </div>
              <p className="font-body text-xs text-white/55 mt-1">— Local guest</p>
            </div>
            <DoodleArrow className="text-white/30 -rotate-6" size={120} />
          </div>
        </div>

        {/* marquee */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#0d0d0d]/80 backdrop-blur">
          <div className="overflow-hidden py-3">
            <div className="marquee font-heading text-white/55 text-2xl">
              {Array.from({ length: 2 }).map((_, k) => (
                <div key={k} className="flex items-center gap-12 pr-12">
                  <span>★ Karahi</span>
                  <span>·</span>
                  <span>Doodh Patti</span>
                  <span>·</span>
                  <span>Aloo Paratha</span>
                  <span>·</span>
                  <span>Gajar Halwa</span>
                  <span>·</span>
                  <span>Kashmiri Chai</span>
                  <span>·</span>
                  <span>Biryani</span>
                  <span>·</span>
                  <span>Gulab Jamun</span>
                  <span>·</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRIO STORY STRIP */}
      <section className="py-24 sm:py-32 chalk-noise">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid md:grid-cols-3 gap-10">
          {[
            { icon: Utensils, title: "Home Cooked", text: "Recipes our mothers and grandmothers handed down — never shortcut, always slow." },
            { icon: Coffee, title: "Brewed Slow", text: "Doodh patti pulled the village way, espresso ground for every cup." },
            { icon: Heart, title: "Made with Love", text: "Small batches, fresh herbs, and a whole lot of heart on every plate." },
          ].map((b, i) => (
            <div key={i} className="reveal-on-mount animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <b.icon className="text-[#D97706]" size={28} />
              <h3 className="font-heading text-4xl text-white mt-3">{b.title}</h3>
              <p className="font-body text-white/65 mt-2 leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED MENU */}
      <section
        data-testid="featured-menu-section"
        className="py-24 sm:py-32 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
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
              <MenuCard key={item.id} item={item} withImage={!!item.image} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center relative">
          <DoodleSwirl className="absolute -top-4 left-1/2 -translate-x-1/2 text-white/20" size={140} />
          <h2 className="font-heading text-6xl sm:text-7xl text-white chalk-text">
            Hungry yet?
          </h2>
          <p className="font-body text-white/65 mt-3 max-w-xl mx-auto">
            Order online, or come find us — there's always a fresh kettle on.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/order" data-testid="cta-order-now" className="btn-chalk-primary">
              Order Now <ArrowRight size={16} />
            </Link>
            <Link to="/contact" data-testid="cta-visit" className="btn-chalk-outline">
              Visit Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
