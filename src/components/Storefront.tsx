/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Heart, Shield, Leaf, Quote } from "lucide-react";
import { Product } from "../types";

interface StorefrontProps {
  onNavigate: (tab: string, productId?: string) => void;
  featuredProducts: Product[];
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
}

const EDITORIAL_QUOTES = [
  {
    text: "We believe that the items sharing your living space should elevate it, not clutter it. Our companions deserve the same meticulous attention to craftsmanship, comfort, and material integrity that we demand for ourselves.",
    author: "Sarah & Max, Founders"
  },
  {
    text: "Great design is invisible yet deeply felt. Creating harmonious physical spaces for our pet companions is a natural extension of an intentional, curated life.",
    author: "Elena Vance, Design Director"
  },
  {
    text: "A companion's sanctuary should never compromise the aesthetic integrity of your home. We blend architectural lines with orthopedic science to craft heirloom rest spots.",
    author: "Marcus Aurel, Spatial Architect"
  },
  {
    text: "Wellness begins with material purity. From hand-felted Merino wool to sustainably harvested walnut, we select ingredients and textiles that respect both pet health and the environment.",
    author: "Clara Thorne, Materials Lead"
  },
  {
    text: "Each item in our collection is an invitation to slower, more mindful living. We celebrate the silent, sacred bond shared between companions through bespoke material elegance.",
    author: "Julien Mercer, Lifestyle Curator"
  },
  {
    text: "Our design philosophy centers on architectural honesty and durability. We believe that pet accessories should age as gracefully as the memories you build together.",
    author: "Dieter Vance, Chief Craftsman"
  }
];

export default function Storefront({
  onNavigate,
  featuredProducts,
  favorites,
  onToggleFavorite,
}: StorefrontProps) {
  const [currentQuote, setCurrentQuote] = useState(EDITORIAL_QUOTES[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * EDITORIAL_QUOTES.length);
    setCurrentQuote(EDITORIAL_QUOTES[randomIndex]);
  }, []);
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[650px] w-full bg-[#1C1C1A] overflow-hidden flex items-center">
        {/* Background Image with elegant overlay */}
        <div className="absolute inset-0">
          <img
            src="/storefront/hero.jpg"
            alt="Elegant Weimaraner in modern home"
            className="w-full h-full object-cover opacity-60 object-center transition-transform duration-[10000ms] hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 w-full z-10 text-white flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-brand-sand" />
            <span className="text-xs font-mono font-medium tracking-wider uppercase text-brand-sand">
              Spring-Summer '26 Collection
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-light tracking-tight leading-none mb-6 max-w-3xl">
            Elevated Living for Your <br className="hidden md:inline" />
            <span className="font-semibold text-brand-sand">Best Friend</span>
          </h1>

          <p className="text-lg md:text-xl text-[#EAE5DB]/90 font-light max-w-xl mb-10 leading-relaxed">
            Curated collections of premium, luxury pet essentials designed with high-quality, sustainable materials to harmonize beautifully with the modern home.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate("shop")}
              className="px-8 py-4 bg-brand-sand text-brand-charcoal font-medium hover:bg-white transition-all duration-300 shadow-xl hover:-translate-y-0.5 flex items-center gap-3 group rounded-none"
            >
              Shop Curated Collection
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate("shop")}
              className="px-8 py-4 bg-transparent text-white font-medium border border-white/40 hover:border-white hover:bg-white/5 transition-all duration-300 rounded-none"
            >
              Explore Living Range
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Curated Collections Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <span className="text-xs font-mono tracking-widest text-brand-terracotta uppercase block mb-3 font-semibold">
            Categorized Elegance
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-brand-charcoal">
            The Curated Collections
          </h2>
          <div className="w-12 h-1 bg-brand-sand mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Dogs */}
          <div
            onClick={() => onNavigate("shop")}
            className="group relative h-[450px] bg-[#EAE5DB] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-end p-8"
          >
            <div className="absolute inset-0">
              <img
                src="/storefront/dogs.jpg"
                alt="Dogs Collection"
                className="w-full h-full object-cover transition-transform duration-[6000ms] group-hover:scale-110 object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-mono text-brand-sand tracking-widest uppercase mb-1">
                FOR CANINES
              </p>
              <h3 className="text-2xl font-display font-medium text-white mb-2">
                Dogs Range
              </h3>
              <p className="text-sm text-brand-oatmeal/85 font-light mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Premium beds, collars, dynamic treats and tailored leads.
              </p>
              <span className="text-xs font-mono text-brand-sand flex items-center gap-1 group-hover:gap-2 transition-all">
                Shop Dogs <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 2: Cats */}
          <div
            onClick={() => onNavigate("shop")}
            className="group relative h-[450px] bg-[#EAE5DB] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-end p-8"
          >
            <div className="absolute inset-0">
              <img
                src="/storefront/cats.jpg"
                alt="Cats Collection"
                className="w-full h-full object-cover transition-transform duration-[6000ms] group-hover:scale-110 object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-mono text-brand-sand tracking-widest uppercase mb-1">
                FOR FELINES
              </p>
              <h3 className="text-2xl font-display font-medium text-white mb-2">
                Cats Range
              </h3>
              <p className="text-sm text-brand-oatmeal/85 font-light mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Architectural pillars, stoneware dishes, and elegant toys.
              </p>
              <span className="text-xs font-mono text-brand-sand flex items-center gap-1 group-hover:gap-2 transition-all">
                Shop Cats <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 3: New Arrivals */}
          <div
            onClick={() => onNavigate("shop")}
            className="group relative h-[450px] bg-[#EAE5DB] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-end p-8"
          >
            <div className="absolute inset-0">
              <img
                src="/storefront/new-arrivals.jpg"
                alt="New Arrivals"
                className="w-full h-full object-cover transition-transform duration-[6000ms] group-hover:scale-110 object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-mono text-brand-sand tracking-widest uppercase mb-1">
                LATEST RELEASES
              </p>
              <h3 className="text-2xl font-display font-medium text-white mb-2">
                New Arrivals
              </h3>
              <p className="text-sm text-brand-oatmeal/85 font-light mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Fresh drops featuring Terracotta tones and Sage accessories.
              </p>
              <span className="text-xs font-mono text-brand-sand flex items-center gap-1 group-hover:gap-2 transition-all">
                Shop New <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 4: Eco Friendly */}
          <div
            onClick={() => onNavigate("shop")}
            className="group relative h-[450px] bg-[#EAE5DB] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-end p-8"
          >
            <div className="absolute inset-0">
              <img
                src="/storefront/eco-friendly.jpg"
                alt="Eco Friendly"
                className="w-full h-full object-cover transition-transform duration-[6000ms] group-hover:scale-110 object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-mono text-brand-sand tracking-widest uppercase mb-1">
                SUSTAINABLE MINDSET
              </p>
              <h3 className="text-2xl font-display font-medium text-white mb-2">
                Eco-Friendly
              </h3>
              <p className="text-sm text-brand-oatmeal/85 font-light mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Hemp fiber, recycled memory foam, and organic ingredients.
              </p>
              <span className="text-xs font-mono text-brand-sand flex items-center gap-1 group-hover:gap-2 transition-all">
                Shop Eco <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Curator Statement / Editorial quote */}
      <section className="bg-brand-oatmeal border-y border-brand-warm-gray py-24">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <Quote className="w-12 h-12 text-brand-terracotta mb-8 opacity-40" />
          <h3 className="text-2xl md:text-3xl font-display font-light text-brand-charcoal leading-relaxed tracking-wide italic mb-8">
            "{currentQuote.text}"
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-brand-charcoal/40"></div>
            <span className="text-sm font-mono tracking-widest text-brand-charcoal uppercase font-medium">
              {currentQuote.author}
            </span>
            <div className="w-8 h-[1px] bg-brand-charcoal/40"></div>
          </div>
        </div>
      </section>

      {/* Curated Bestsellers Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <span className="text-xs font-mono tracking-widest text-brand-sage uppercase block mb-2 font-semibold">
              Highly Coveted
            </span>
            <h2 className="text-3xl font-display font-medium text-brand-charcoal">
              Curated Essentials
            </h2>
          </div>
          <button
            onClick={() => onNavigate("shop")}
            className="mt-4 md:mt-0 text-sm font-mono text-brand-charcoal border-b border-brand-charcoal pb-1 hover:text-brand-terracotta hover:border-brand-terracotta transition-colors flex items-center gap-2"
          >
            View All Collections <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.slice(0, 3).map((prod) => (
            <div
              key={prod.id}
              onClick={() => onNavigate("details", prod.id)}
              className="group cursor-pointer flex flex-col h-full bg-white border border-brand-warm-gray/40 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden bg-brand-oatmeal">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Favorite Heart Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(prod.id);
                  }}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-brand-warm-gray/40 text-brand-charcoal hover:text-brand-terracotta hover:scale-105 shadow-sm transition-all cursor-pointer"
                  title={favorites.includes(prod.id) ? "Remove from Favorites" : "Save to Favorites"}
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-all ${
                      favorites.includes(prod.id) ? "fill-brand-terracotta text-brand-terracotta" : "text-brand-charcoal/60"
                    }`}
                  />
                </button>

                <div className="absolute top-4 left-4 flex flex-col gap-1 items-start">
                  <div className="bg-brand-charcoal text-white text-[10px] font-mono font-medium uppercase tracking-widest px-2.5 py-1">
                    {prod.brand}
                  </div>
                  {prod.inStock === false && (
                    <div className="bg-red-800 text-white text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5">
                      Out of Stock
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-display font-medium text-brand-charcoal group-hover:text-brand-terracotta transition-colors line-clamp-1">
                    {prod.name}
                  </h3>
                  <span className="font-mono text-sm text-brand-charcoal font-semibold shrink-0 ml-3">
                    ₹{prod.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-brand-charcoal/70 font-light line-clamp-2 mb-4 leading-relaxed">
                  {prod.description}
                </p>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-brand-oatmeal text-xs font-mono text-brand-charcoal uppercase">
                  <span>Rating: {prod.rating} ★</span>
                  <span className="text-brand-terracotta font-medium group-hover:underline">
                    View Specs
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Values Section - "The Elevated Choice" */}
      <section className="bg-brand-charcoal text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono tracking-widest text-brand-sand uppercase block mb-3">
              OUR UNCOMPROMISING CODE
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-light text-white">
              The <span className="font-semibold text-brand-sand">Elevated</span> Choice
            </h2>
            <div className="w-12 h-0.5 bg-brand-sand mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {/* Value 1 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Leaf className="w-8 h-8 text-brand-sand" />
              </div>
              <h3 className="text-xl font-display font-medium mb-3">
                Sustainable Materials
              </h3>
              <p className="text-sm text-[#EAE5DB]/75 font-light max-w-sm leading-relaxed">
                We source certified organic fibers, sustainable Tuscan full-grain leather, and durable, recycled foam foundations designed for decades of love.
              </p>
            </div>

            {/* Value 2 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-brand-sand" />
              </div>
              <h3 className="text-xl font-display font-medium mb-3">
                Minimalist Design
              </h3>
              <p className="text-sm text-[#EAE5DB]/75 font-light max-w-sm leading-relaxed">
                Sleek architecture, neutral palettes (Sage, Terracotta, Oatmeal), and seamless profiles ensure our goods blend beautifully into the modern home.
              </p>
            </div>

            {/* Value 3 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-brand-sand" />
              </div>
              <h3 className="text-xl font-display font-medium mb-3">
                Uncompromising Care
              </h3>
              <p className="text-sm text-[#EAE5DB]/75 font-light max-w-sm leading-relaxed">
                Engineered for optimal animal orthopedic wellness, skin safety, and easy, stress-free household washability. Tested by actual premium pets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-brand-cream py-20 px-6 border-t border-brand-warm-gray">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-mono tracking-widest text-brand-terracotta uppercase block mb-3 font-semibold">
            THE INNER CIRCLE
          </span>
          <h2 className="text-3xl font-display font-medium text-brand-charcoal mb-4">
            Join The Paws Store
          </h2>
          <p className="text-sm text-brand-charcoal/70 font-light mb-8 max-w-lg mx-auto leading-relaxed">
            Be the first to know about seasonal collection releases, bespoke designer collaborations, and private boutique offers.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for joining our curated inner circle! A welcoming gift has been sent.");
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Your email address"
              required
              className="flex-grow px-5 py-3 bg-white border border-brand-warm-gray focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage text-sm font-light rounded-none"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-brand-charcoal text-white hover:bg-brand-sage transition-colors duration-300 font-mono text-xs uppercase tracking-widest rounded-none"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
