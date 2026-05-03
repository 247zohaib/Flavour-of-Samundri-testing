import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Flame, Hand } from "lucide-react";
import {
  DoodleCoffeeBean,
  DoodleCup,
  DoodleSwirl,
  DoodleLeaf,
  DoodleStar,
} from "../components/Doodles";

const About = () => {
  return (
    <div className="bg-[#111] chalk-bg pt-32 pb-24 chalk-noise">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Intro */}
        <div className="grid md:grid-cols-12 gap-10 items-end mb-20">
          <div className="md:col-span-7">
            <div className="section-eyebrow mb-3">Our Story</div>
            <h1
              data-testid="about-title"
              className="font-heading text-7xl sm:text-8xl text-white chalk-text leading-[0.95]"
            >
              Cooked the <br /> <span className="text-[#F59E0B]">slow way.</span>
            </h1>
            <p className="font-body text-white/70 mt-6 max-w-xl leading-relaxed text-lg">
              Flavors of Samundri began in a small home kitchen, where the smell of cardamom and
              ghee meant family was about to gather. We've kept it that way — honest food, real
              spices, and a chai pot that never empties.
            </p>
            <p className="font-body text-white/65 mt-4 max-w-xl leading-relaxed">
              Every karahi is built from scratch. Every paratha is rolled by hand. Every cup of
              doodh patti is brewed slow enough that you can hear it bubble. We don't believe in
              shortcuts; we believe in stories on a plate.
            </p>
            <Link
              to="/menu"
              data-testid="about-explore-menu"
              className="btn-chalk-primary mt-8"
            >
              Explore the Menu <ArrowRight size={16} />
            </Link>
          </div>
          <div className="md:col-span-5 relative">
            <div className="aspect-[4/5] overflow-hidden border border-white/15 doodle-frame">
              <img
                src="https://images.unsplash.com/photo-1646398123647-695431536f7c?crop=entropy&cs=srgb&fm=jpg&w=1100&q=85"
                alt="Pakistani food spread"
                className="w-full h-full object-cover grayscale-[10%]"
              />
            </div>
            <DoodleCup className="absolute -top-10 -right-6 text-white/25 -rotate-12 hidden md:block" size={70} />
            <DoodleSwirl className="absolute -bottom-6 -left-8 text-white/20 hidden md:block" size={140} />
          </div>
        </div>

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-6">
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
              icon: Hand,
              title: "Cozy Atmosphere",
              text: "Warm light, hand-written chalkboards, and the kind of welcome you'd get at a friend's home.",
            },
          ].map((p, i) => (
            <div
              key={i}
              data-testid={`about-pillar-${i}`}
              className="chalk-card p-8 hover-lift relative"
            >
              <p.icon className="text-[#D97706]" size={28} />
              <h3 className="font-heading text-4xl text-white mt-3">{p.title}</h3>
              <p className="font-body text-white/65 mt-2 leading-relaxed">{p.text}</p>
              <DoodleStar className="absolute top-5 right-5 text-white/20" size={18} />
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="mt-24 text-center max-w-3xl mx-auto relative">
          <DoodleCoffeeBean className="absolute -top-2 left-2 text-white/25 -rotate-12 hidden md:block" size={36} />
          <DoodleLeaf className="absolute -top-3 right-2 text-white/25 rotate-12 hidden md:block" size={36} />
          <p className="font-heading text-5xl sm:text-6xl text-white chalk-text leading-tight">
            "We don't just serve food.<br />
            <span className="text-[#F59E0B]">We serve memory.</span>"
          </p>
          <p className="font-body text-white/55 mt-5 uppercase tracking-[0.3em] text-xs">
            — The Samundri Kitchen
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
