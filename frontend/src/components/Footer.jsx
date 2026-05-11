import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Phone, MapPin, Clock, Mail } from "lucide-react";
import { DoodleCoffeeBean, DoodleSwirl, DoodleLeaf } from "./Doodles";

const Footer = () => {
  return (
    <footer
      data-testid="site-footer"
      className="relative chalk-noise bg-[#0d0d0d] border-t border-white/10 mt-20"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3 mb-4">
            <DoodleCoffeeBean className="text-[#D97706] -rotate-12" size={28} />
            <h3 className="font-heading text-4xl text-white chalk-text">Flavors of Samundri</h3>
          </div>
          <p className="font-body text-white/65 max-w-md leading-relaxed">
            Home-cooked Pakistani goodness, slow-brewed chai — served from
            the heart of Samundri to your table.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <a
              href="https://www.instagram.com/flavours_of_samundri?igsh=MXhqMDczcm81aWhxOA=="
              target="_blank"
              rel="noreferrer"
              data-testid="footer-instagram"
              className="w-10 h-10 inline-flex items-center justify-center border border-white/20 hover:border-[#D97706] hover:text-[#D97706] text-white/80 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
            {/* <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              data-testid="footer-facebook"
              className="w-10 h-10 inline-flex items-center justify-center border border-white/20 hover:border-[#D97706] hover:text-[#D97706] text-white/80 transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={16} />
            </a> */}
            <a
              href="https://wa.me/923080471471"
              target="_blank"
              rel="noreferrer"
              data-testid="footer-whatsapp"
              className="w-10 h-10 inline-flex items-center justify-center border border-white/20 hover:border-[#D97706] hover:text-[#D97706] text-white/80 transition-colors"
              aria-label="WhatsApp"
            >
              <Phone size={16} />
            </a>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="section-eyebrow mb-4">Contact Us</div>
          <ul className="space-y-3 font-body text-white/75 text-sm">
            {/* <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-1 text-[#D97706]" />
              Shahbaz Garden, Samundri, Punjab
            </li> */}
            <li className="flex items-start gap-2">
              <Phone size={16} className="mt-1 text-[#D97706]" />
              <a href="tel:+923080471471" className="hover:text-white" data-testid="footer-phone">
                0308-0471471
              </a>
            </li>
               <li className="flex items-start gap-2">
      <Mail size={16} className="mt-1 text-[#D97706]" />
      <a href="mailto:flavourofsamundari@gmail.com" className="hover:text-white" data-testid="footer-email">
        flavourofsamundri@gmail.com
      </a>
    </li>
            {/* <li className="flex items-start gap-2">
              <Clock size={16} className="mt-1 text-[#D97706]" />
              Daily • 11:00 AM – 12:00 AM
            </li> */}
          </ul>
        </div>

        <div className="md:col-span-4 relative">
          <div className="section-eyebrow mb-4">Quick Links</div>
          <ul className="grid grid-cols-2 gap-2 font-body text-white/75 text-sm">
            <li><Link to="/" className="hover:text-[#F59E0B]">Home</Link></li>
            <li><Link to="/menu" className="hover:text-[#F59E0B]">Menu</Link></li>
            <li><Link to="/about" className="hover:text-[#F59E0B]">About</Link></li>
            <li><Link to="/contact" className="hover:text-[#F59E0B]">Contact</Link></li>
            <li><Link to="/order" className="hover:text-[#F59E0B]">Order Now</Link></li>
          </ul>
          <DoodleSwirl className="absolute -bottom-2 right-0 text-white/15" size={120} />
          <DoodleLeaf className="absolute -top-4 right-0 text-white/15 rotate-12" size={36} />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5 flex flex-col md:flex-row gap-2 items-center justify-between">
          <p className="font-body text-xs text-white/45 tracking-wide">
            © {new Date().getFullYear()} Flavors of Samundri — Brewed with love.
          </p>
          <p className="font-heading text-xl text-white/65">"Savor every sip & bite."</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
