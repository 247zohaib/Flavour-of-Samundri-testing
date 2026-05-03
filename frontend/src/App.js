import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "@/context/CartContext";

import Home from "@/pages/Home";
import MenuPage from "@/pages/MenuPage";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Order from "@/pages/Order";

function App() {
  return (
    <div className="App font-body">
      <BrowserRouter>
        <CartProvider>
          <ScrollToTop />
          <Header />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/order" element={<Order />} />
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
          <Toaster
            theme="dark"
            position="top-center"
            toastOptions={{
              style: {
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#f5f5f5",
                fontFamily: "'Outfit', sans-serif",
              },
            }}
          />
        </CartProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
