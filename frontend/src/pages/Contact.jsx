import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Phone, Mail, MapPin, Clock, MessageSquare,
  ArrowRight, Send, CheckCircle,
} from "lucide-react";
import {
  DoodleCoffeeBean, DoodleSwirl, DoodleCup,
  DoodleLeaf, DoodleStar, DoodleArrow,
} from "../components/Doodles";

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

const INQUIRY_TYPES = [
  { value: "general", label: "General Inquiry" },
  { value: "special_order", label: "Special / Custom Food Order" },
  { value: "bulk_order", label: "Bulk / Event Order" },
  { value: "feedback", label: "Feedback" },
  { value: "complaint", label: "Complaint" },
  { value: "other", label: "Other" },
];

const Contact = () => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", inquiry_type: "general", message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const heroRef = useReveal();
  const formRef = useReveal();
  const infoRef = useReveal();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    if (!form.name.trim()) { toast.error("Please enter your name."); return false; }
    if (!form.phone.trim() && !form.email.trim()) { toast.error("Please enter at least a phone number or email."); return false; }
    if (!form.message.trim()) { toast.error("Please write your message."); return false; }
    if (form.message.trim().length < 10) { toast.error("Message is too short."); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/contact`, {
        name: form.name,
        email: form.email || "not provided",
        phone: form.phone,
        message: `[${INQUIRY_TYPES.find(t => t.value === form.inquiry_type)?.label}]\n\n${form.message}`,
      });
      setSuccess(true);
      toast.success("Message sent! We'll get back to you soon.");
    } catch {
      toast.error("Failed to send message. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────
  if (success) {
    return (
      <>
        <style>{`
          @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
          @keyframes spinSlow{from{transform:rotate(0)}to{transform:rotate(360deg)}}
          @keyframes pulseGlow{0%,100%{opacity:0.06}50%{opacity:0.18}}
          @keyframes popIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
          .float-1{animation:floatY 5s ease-in-out infinite}
          .float-2{animation:floatY 7s ease-in-out infinite;animation-delay:-2s}
          .spin-slow{animation:spinSlow 25s linear infinite}
          .pulse-glow{animation:pulseGlow 5s ease-in-out infinite}
          .pop-in{animation:popIn 0.7s ease both}
        `}</style>
        <div className="bg-[#111] chalk-bg pb-32 chalk-noise min-h-screen relative overflow-hidden">
          <div className="float-1 absolute top-20 left-10 hidden lg:block"><DoodleCoffeeBean className="text-white/10" size={44} /></div>
          <div className="float-2 absolute top-32 right-12 hidden lg:block"><DoodleLeaf className="text-[#D97706]/12" size={36} /></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 spin-slow pulse-glow hidden lg:block" style={{ pointerEvents: "none" }}>
            <DoodleSwirl className="text-[#D97706]" size={480} />
          </div>
          <div className="max-w-2xl mx-auto px-6 sm:px-8 text-center relative z-10 pop-in pt-20">
            <div className="float-1 inline-block mb-4">
              <CheckCircle size={72} className="text-[#D97706] mx-auto" />
            </div>
            <div className="section-eyebrow mb-2">Message Received</div>
            <h1 className="font-heading text-7xl text-white chalk-text">
              We'll be in <span className="text-[#F59E0B]">touch!</span>
            </h1>
            <p className="font-body text-white/70 mt-6 max-w-md mx-auto leading-relaxed">
              Thank you <strong className="text-white">{form.name}</strong>! Your message has been received. Our team will get back to you on <strong className="text-white">{form.phone || form.email}</strong> as soon as possible.
            </p>
            {/* <div style={{ margin: "24px auto", maxWidth: 360, background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.25)", borderRadius: 10, padding: "14px 20px" }}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.6 }}>
                For urgent matters, call us directly at <a href="tel:03080471471" style={{ color: "#F59E0B", fontWeight: 700 }}>0308-0471471</a>
              </p>
            </div> */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/menu" className="btn-chalk-outline">Browse Menu</Link>
              <Link to="/" className="btn-chalk-primary">Back Home <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Main Contact Page ───────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes floatY{0%,100%{transform:translateY(0px) rotate(var(--rot,0deg))}50%{transform:translateY(-16px) rotate(var(--rot,0deg))}}
        @keyframes drift{0%{transform:translate(0,0)}25%{transform:translate(10px,-12px)}50%{transform:translate(4px,-20px)}75%{transform:translate(-8px,-10px)}100%{transform:translate(0,0)}}
        @keyframes spinSlow{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes pulseGlow{0%,100%{opacity:0.05}50%{opacity:0.13}}
        .float-1{animation:floatY 5s ease-in-out infinite}
        .float-2{animation:floatY 7s ease-in-out infinite;animation-delay:-2s}
        .float-3{animation:floatY 6s ease-in-out infinite;animation-delay:-3.5s}
        .float-5{animation:drift 11s ease-in-out infinite;animation-delay:-4s}
        .float-6{animation:drift 14s ease-in-out infinite;animation-delay:-7s}
        .spin-slow{animation:spinSlow 28s linear infinite}
        .pulse-glow{animation:pulseGlow 5s ease-in-out infinite}
        .reveal{opacity:0;transform:translateY(28px);transition:opacity 0.7s ease,transform 0.7s ease}
        .reveal.revealed{opacity:1;transform:translateY(0)}
        .reveal-right{opacity:0;transform:translateX(28px);transition:opacity 0.8s ease,transform 0.8s ease}
        .reveal-right.revealed{opacity:1;transform:translateX(0)}
        .chalk-input:focus{outline:none;border-color:rgba(217,119,6,0.6)}
        .inquiry-btn{transition:all 0.15s ease}
        .inquiry-btn:hover{border-color:rgba(217,119,6,0.5);color:white}
      `}</style>

      <div className="bg-[#111] chalk-bg pb-24 chalk-noise relative overflow-hidden">

        {/* Floating doodles */}
        <div className="float-1 absolute top-24 left-6 hidden lg:block" style={{"--rot":"-15deg"}}><DoodleCoffeeBean className="text-white/10" size={48} /></div>
        <div className="float-3 absolute top-48 left-28 hidden xl:block" style={{"--rot":"20deg"}}><DoodleLeaf className="text-[#D97706]/12" size={32} /></div>
        <div className="float-2 absolute top-32 right-10 hidden lg:block"><DoodleSwirl className="text-white/6" size={110} /></div>
        <div className="float-5 absolute top-1/2 left-4 hidden lg:block"><DoodleStar className="text-[#D97706]/10" size={24} /></div>
        <div className="float-6 absolute bottom-40 right-8 hidden lg:block" style={{"--rot":"-12deg"}}><DoodleCoffeeBean className="text-white/8" size={36} /></div>
        <div className="float-3 absolute bottom-24 left-1/3 hidden lg:block"><DoodleStar className="text-[#F59E0B]/10" size={18} /></div>
        <div className="absolute bottom-0 left-0 spin-slow pulse-glow hidden xl:block" style={{pointerEvents:"none"}}><DoodleSwirl className="text-[#D97706]" size={400} /></div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 pt-8">

          {/* ── Hero ── */}
          <div ref={heroRef} className="reveal text-center mb-16 relative">
            <div className="float-2 absolute -top-2 left-1/4 hidden md:block"><DoodleCup className="text-white/20 -rotate-12" size={50} /></div>
            <div className="float-3 absolute -top-2 right-1/4 hidden md:block"><DoodleArrow className="text-white/20" size={100} /></div>
           <br />
           <br />
           <br />
            <div className="section-eyebrow mb-3">Get in Touch</div>
            <h1 className="font-heading text-7xl sm:text-8xl text-white chalk-text leading-[0.95]">
              Say <span className="text-[#F59E0B]">hello.</span>
            </h1>
            <p className="font-body text-white/65 mt-5 max-w-xl mx-auto leading-relaxed">
              Have a question, want to place a special order, or just want to know what's cooking today?
              We'd love to hear from you.
            </p>
          </div>

          {/* ── Grid: Form + Info ── */}
          <div className="grid md:grid-cols-12 gap-10">

            {/* ── Contact Form ── */}
            <div ref={formRef} className="reveal md:col-span-7">
              <form onSubmit={handleSubmit} className="chalk-card p-8 space-y-6">
                <h2 className="font-heading text-4xl text-white">Send us a message</h2>
                <p className="font-body text-sm text-white/55">We read every message and reply within a few hours.</p>

                {/* Inquiry type */}
                <div>
                  <label className="section-eyebrow block mb-3">What's this about?</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {INQUIRY_TYPES.map(t => (
                      <button key={t.value} type="button"
                        onClick={() => set("inquiry_type", t.value)}
                        className="inquiry-btn"
                        style={{
                          padding: "6px 14px", fontSize: 12, borderRadius: 20, cursor: "pointer",
                          border: `1px solid ${form.inquiry_type === t.value ? "rgba(217,119,6,0.7)" : "rgba(255,255,255,0.15)"}`,
                          background: form.inquiry_type === t.value ? "rgba(217,119,6,0.12)" : "transparent",
                          color: form.inquiry_type === t.value ? "#F59E0B" : "rgba(255,255,255,0.55)",
                          fontWeight: form.inquiry_type === t.value ? 600 : 400,
                        }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="section-eyebrow block mb-2">Your Name *</label>
                  <input
                    value={form.name} onChange={e => set("name", e.target.value)}
                    className="chalk-input" placeholder="e.g. Ali Raza"
                  />
                </div>

                {/* Phone + Email row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="section-eyebrow block mb-2">Phone Number *</label>
                    <input
                      value={form.phone} onChange={e => set("phone", e.target.value)}
                      className="chalk-input" placeholder="03xx-xxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="section-eyebrow block mb-2">Email (optional)</label>
                    <input type="email"
                      value={form.email} onChange={e => set("email", e.target.value)}
                      className="chalk-input" placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="section-eyebrow block mb-2">Your Message *</label>
                  <textarea
                    value={form.message} onChange={e => set("message", e.target.value)}
                    rows={5} className="chalk-input resize-none"
                    placeholder={
                      form.inquiry_type === "special_order"
                        ? "Describe the food you'd like us to make — dish name, quantity, date needed, any special requirements…"
                        : form.inquiry_type === "bulk_order"
                        ? "Tell us about your event — number of people, date, dishes you have in mind…"
                        : "Write your message here…"
                    }
                  />
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                    {form.message.length} characters
                  </p>
                </div>

                <button type="submit" disabled={submitting}
                  className="btn-chalk-primary w-full disabled:opacity-50"
                  style={{ justifyContent: "center" }}>
                  {submitting
                    ? "Sending…"
                    : <><Send size={15} /> Send Message</>
                  }
                </button>
              </form>
            </div>

            {/* ── Contact Info ── */}
            <div ref={infoRef} className="reveal-right md:col-span-5 space-y-5">

              {/* Info card */}
              <div className="chalk-card p-7">
                <h3 className="font-heading text-3xl text-white mb-5">Our Details</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 36, height: 36, background: "rgba(217,119,6,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Phone size={16} style={{ color: "#D97706" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Phone / WhatsApp</p>
                      <a href="tel:03080471471" style={{ color: "white", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>0308-0471471</a>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Call or WhatsApp anytime</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 36, height: 36, background: "rgba(217,119,6,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MapPin size={16} style={{ color: "#D97706" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Location</p>
                      <p style={{ color: "white", fontSize: 15, fontWeight: 600 }}>Shahbaz Garden, Samundri</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Punjab, Pakistan</p>
                    </div>
                  </div>

                  {/* <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 36, height: 36, background: "rgba(217,119,6,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Clock size={16} style={{ color: "#D97706" }} />
                    </div> */}
                    {/* <div>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Hours</p>
                     <p style={{ color: "white", fontSize: 15, fontWeight: 600 }}>Daily 11:00 AM – 12:00 AM</p>
                     <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Open 7 days a week</p>
                    </div>
                  </div> */}

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 36, height: 36, background: "rgba(217,119,6,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MessageSquare size={16} style={{ color: "#D97706" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Response Time</p>
                      {/* <p style={{ color: "white", fontSize: 15, fontWeight: 600 }}>Within a few hours</p> */}
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>We reply to every message</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special order callout */}
              <div style={{ background: "rgba(217,119,6,0.07)", border: "1px solid rgba(217,119,6,0.25)", borderRadius: 10, padding: "18px 20px" }}>
                <p style={{ color: "#F59E0B", fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                  🍽️ Want a special dish?
                </p>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.7 }}>
                  We take custom food orders for birthdays, family gatherings, dawats, and events.
                  Just send us a message with what you need!
                </p>
              </div>

              {/* WhatsApp shortcut */}
              <a
                href="https://wa.me/923080471471"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "14px 20px", background: "#25D366", borderRadius: 10,
                  color: "white", fontWeight: 700, fontSize: 14, textDecoration: "none",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>

              {/* Order CTA */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "16px 20px", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 10 }}>Ready to order food?</p>
                <Link to="/order" className="btn-chalk-primary" style={{ justifyContent: "center", display: "inline-flex" }}>
                  Place an Order <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
