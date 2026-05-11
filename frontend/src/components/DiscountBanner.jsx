import React, { useState } from "react";
import { X, Gift, Tag } from "lucide-react";
import { useDiscounts } from "../context/DiscountContext";

const getDiscountText = (d) => {
  const scope = d.applies_to === "all" ? "All Items" : d.applies_to_name;
  if (d.type === "bogo") return `🎁 ${d.name} — Buy 1 Get 1 Free on ${scope}`;
  if (d.type === "percent") return `🏷️ ${d.name} — ${d.value}% Off on ${scope}`;
  if (d.type === "fixed") return `🏷️ ${d.name} — Rs ${d.value} Off on ${scope}`;
  return `🎉 ${d.name}`;
};

const DiscountBanner = () => {
  const { discounts } = useDiscounts();
  const [dismissed, setDismissed] = useState(false);

  const visible = discounts.filter(d => d.active);
  if (visible.length === 0 || dismissed) return null;

  // Build marquee text — repeat for smooth loop
  const marqueeText = visible.map(d => getDiscountText(d)).join("   ✦   ");

  return (
    <div style={{
      background: "linear-gradient(90deg, #78350f, #b45309, #d97706, #b45309, #78350f)",
      position: "sticky",
      top: 80, // below the fixed header
      zIndex: 48,
      overflow: "hidden",
      borderBottom: "1px solid rgba(245,158,11,0.3)",
    }}>
      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marqueeScroll 20s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", height: 40, position: "relative" }}>
        {/* Icon on left */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, zIndex: 2,
          background: "linear-gradient(90deg, #78350f 60%, transparent)",
          display: "flex", alignItems: "center", paddingLeft: 12, paddingRight: 24,
        }}>
          <Gift size={14} style={{ color: "#fef3c7", flexShrink: 0 }} />
        </div>

        {/* Scrolling text */}
        <div style={{ overflow: "hidden", flex: 1, paddingLeft: 40, paddingRight: 40 }}>
          <div className="marquee-track">
            {/* Doubled for seamless loop */}
            {[0, 1].map(k => (
              <span key={k} style={{
                color: "white", fontSize: 13, fontWeight: 600,
                whiteSpace: "nowrap", paddingRight: 80,
              }}>
                {marqueeText}
                <span style={{ margin: "0 32px", color: "rgba(255,255,255,0.4)" }}>✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* Dismiss on right */}
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, zIndex: 2,
          background: "linear-gradient(270deg, #78350f 60%, transparent)",
          display: "flex", alignItems: "center", paddingRight: 10, paddingLeft: 24,
        }}>
          <button
            onClick={() => setDismissed(true)}
            style={{
              background: "rgba(0,0,0,0.2)", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center",
              justifyContent: "center", padding: 4, borderRadius: 4,
            }}
            aria-label="Dismiss offers">
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscountBanner;
