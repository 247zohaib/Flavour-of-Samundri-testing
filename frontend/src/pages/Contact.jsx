import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Phone, MapPin, Clock, Send, Instagram, Facebook } from "lucide-react";
import { DoodleCup, DoodleSwirl, DoodleArrow } from "../components/Doodles";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill name, email and message.");
      return;
    }
    setSending(true);
    try {
      await axios.post(`${API}/contact`, form);
      toast.success("Message sent. We'll be in touch soon!");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      toast.error("Could not send message. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#111] chalk-bg pt-32 pb-24 chalk-noise">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-14">
          <div className="section-eyebrow mb-3">Say Hello</div>
          <h1
            data-testid="contact-title"
            className="font-heading text-7xl sm:text-8xl text-white chalk-text"
          >
            Drop us a <span className="text-[#F59E0B]">line.</span>
          </h1>
          <p className="font-body text-white/65 mt-4 max-w-xl mx-auto">
            Reservations, custom orders, or just to say the chai was great — we love it all.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-10">
          {/* Info side */}
          <div className="md:col-span-5 relative">
            <div className="chalk-card p-8 space-y-6">
              <div>
                <div className="section-eyebrow mb-2">Address</div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-[#D97706] mt-1" size={18} />
                  <p className="font-body text-white/85" data-testid="contact-address">
                    Shahbaz Garden, Samundri,<br />Punjab, Pakistan
                  </p>
                </div>
              </div>
              <div>
                <div className="section-eyebrow mb-2">Phone</div>
                <div className="flex items-start gap-3">
                  <Phone className="text-[#D97706] mt-1" size={18} />
                  <a
                    href="tel:+923080471471"
                    data-testid="contact-phone"
                    className="font-body text-white/85 hover:text-[#F59E0B]"
                  >
                    0308-0471471
                  </a>
                </div>
              </div>
              <div>
                <div className="section-eyebrow mb-2">Opening Hours</div>
                <div className="flex items-start gap-3">
                  <Clock className="text-[#D97706] mt-1" size={18} />
                  <div className="font-body text-white/85" data-testid="contact-hours">
                    <p>Mon – Sun</p>
                    <p>11:00 AM – 12:00 AM</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="section-eyebrow mb-2">Follow</div>
                <div className="flex items-center gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    data-testid="contact-instagram"
                    className="w-10 h-10 inline-flex items-center justify-center border border-white/20 hover:border-[#D97706] hover:text-[#D97706] text-white/80"
                    aria-label="Instagram"
                  >
                    <Instagram size={16} />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    data-testid="contact-facebook"
                    className="w-10 h-10 inline-flex items-center justify-center border border-white/20 hover:border-[#D97706] hover:text-[#D97706] text-white/80"
                    aria-label="Facebook"
                  >
                    <Facebook size={16} />
                  </a>
                  <a
                    href="https://wa.me/923080471471"
                    target="_blank"
                    rel="noreferrer"
                    data-testid="contact-whatsapp"
                    className="w-10 h-10 inline-flex items-center justify-center border border-white/20 hover:border-[#D97706] hover:text-[#D97706] text-white/80"
                    aria-label="WhatsApp"
                  >
                    <Phone size={16} />
                  </a>
                </div>
              </div>
            </div>
            <DoodleCup className="absolute -top-8 -right-4 text-white/20 rotate-6 hidden md:block" size={70} />
            <DoodleSwirl className="absolute -bottom-6 left-0 text-white/15 hidden md:block" size={140} />
          </div>

          {/* Form */}
          <form
            onSubmit={submit}
            data-testid="contact-form"
            className="md:col-span-7 chalk-card p-8 space-y-6 relative"
          >
            <DoodleArrow className="absolute -top-6 right-10 text-white/20 -rotate-12 hidden md:block" size={120} />
            <div>
              <label className="section-eyebrow block mb-2">Your Name</label>
              <input
                data-testid="contact-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="chalk-input"
                placeholder="e.g. Ayesha Khan"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="section-eyebrow block mb-2">Email</label>
                <input
                  data-testid="contact-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="chalk-input"
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label className="section-eyebrow block mb-2">Phone (optional)</label>
                <input
                  data-testid="contact-phone-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="chalk-input"
                  placeholder="0300-1234567"
                />
              </div>
            </div>
            <div>
              <label className="section-eyebrow block mb-2">Message</label>
              <textarea
                data-testid="contact-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                className="chalk-input resize-none"
                placeholder="Tell us what's on your mind…"
              />
            </div>
            <button
              type="submit"
              data-testid="contact-submit"
              disabled={sending}
              className="btn-chalk-primary disabled:opacity-50"
            >
              {sending ? "Sending…" : (<><Send size={16} /> Send Message</>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
