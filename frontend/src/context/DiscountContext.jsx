import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const DiscountContext = createContext({ discounts: [], getItemDiscount: () => null });

export const DiscountProvider = ({ children }) => {
  const [discounts, setDiscounts] = useState([]);

  const fetchDiscounts = () => {
    axios.get(`${API}/discounts`)
      .then(res => setDiscounts(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchDiscounts();
    const interval = setInterval(fetchDiscounts, 60000); // refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  const getItemDiscount = (itemName) => {
    const specific = discounts.find(d => d.active && d.applies_to === "item" && d.applies_to_name === itemName);
    if (specific) return specific;
    const all = discounts.find(d => d.active && d.applies_to === "all");
    return all || null;
  };

  const activeDiscounts = discounts.filter(d => d.active);

  return (
    <DiscountContext.Provider value={{ discounts: activeDiscounts, getItemDiscount }}>
      {children}
    </DiscountContext.Provider>
  );
};

export const useDiscounts = () => useContext(DiscountContext);

export const getDiscountLabel = (discount) => {
  if (!discount) return null;
  if (discount.type === "bogo") return "Buy 1 Get 1 Free";
  if (discount.type === "percent") return `${discount.value}% Off`;
  if (discount.type === "fixed") return `Rs ${discount.value} Off`;
  return null;
};

export const getDiscountedPrice = (price, discount) => {
  if (!discount) return null;
  if (discount.type === "percent") return Math.round(price * (1 - discount.value / 100));
  if (discount.type === "fixed") return Math.max(0, price - discount.value);
  if (discount.type === "bogo") return null;
  return null;
};
