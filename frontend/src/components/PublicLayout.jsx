import React from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import DiscountBanner from "@/components/DiscountBanner";
import { CartProvider } from "@/context/CartContext";
import { DiscountProvider } from "@/context/DiscountContext";

const PublicLayout = () => {
  return (
    <CartProvider>
      <DiscountProvider>
        <Header />
        <DiscountBanner />
        <main className="min-h-screen">
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
      </DiscountProvider>
    </CartProvider>
  );
};

export default PublicLayout;
