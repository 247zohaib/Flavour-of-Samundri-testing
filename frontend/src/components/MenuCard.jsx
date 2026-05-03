import React from "react";
import { useCart } from "../context/CartContext";
import { Plus } from "lucide-react";
import { DoodleStar } from "./Doodles";

const MenuCard = ({ item, withImage = false }) => {
  const { addItem } = useCart();

  return (
    <div
      data-testid={`menu-card-${item.id}`}
      className="chalk-card hover-lift overflow-hidden flex flex-col"
    >
      {withImage && item.image && (
        <div className="aspect-[4/3] overflow-hidden border-b border-white/10 bg-black">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 grayscale-[15%]"
          />
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h4 className="font-heading text-2xl text-white leading-tight">
            {item.name}
          </h4>
          <span className="font-body text-[#F59E0B] text-lg whitespace-nowrap">
            Rs {item.price}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#D97706]/70 mb-3">
          <DoodleStar size={12} />
          <DoodleStar size={12} />
          <DoodleStar size={12} />
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/45 ml-2">
            {item.category}
          </span>
        </div>
        <p className="font-body text-sm text-white/65 leading-relaxed flex-1">
          {item.description}
        </p>
        <button
          data-testid={`menu-add-${item.id}`}
          onClick={() => addItem(item)}
          className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2 border border-white/20 hover:border-[#D97706] hover:text-[#F59E0B] text-white/85 font-body text-xs uppercase tracking-[0.2em] transition-colors self-start"
        >
          <Plus size={14} /> Add to order
        </button>
      </div>
    </div>
  );
};

export default MenuCard;
