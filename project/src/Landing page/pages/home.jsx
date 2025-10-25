import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, Target, Zap, Cloud, Database, Search, MessageSquare, FileText, TrendingUp, Award, Users, ChevronRight } from "lucide-react";

import HeroSection from "../components/landing/HeroSection";
import BentoCapabilities from "../components/landing/BentoCapabilities";
import FeatureShowcase from "../components/landing/FeatureShowcase";
import TechStackGrid from "../components/landing/TechStackGrid";
import DemoCTA from "../components/landing/DemoCTA";
import TestimonialsBento from "../components/landing/TestimonialsBento";
import Footer from "../components/landing/Footer";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{
          background: scrollY > 50 ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none',
          borderBottom: scrollY > 50 ? '1px solid rgba(0,0,0,0.05)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img
              src="/runagen ai sv.svg"
              alt="Runa Gen AI"
              className="w-8 h-8 rounded-lg object-contain"
            />
            <div className="flex items-end gap-3">
              <span className="relative inline-flex items-center">
                <span className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Noto Sans Devanagari, Inter, ui-sans-serif' }}>ऋण</span>
                <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-black align-middle"></span>
              </span>
              <span className="relative inline-flex items-end" style={{ fontFamily: 'League Spartan, Inter, ui-sans-serif' }}>
                <span className="text-xl font-extrabold text-amber-400 leading-none">Gen</span>
                <span className="absolute -top-3 md:-top-3.5 left-9 md:left-10 flex gap-1">
                  <span className="w-1.5 h-2.5 rounded-full bg-violet-500" />
                  <span className="w-1.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-1.5 h-2.5 rounded-full bg-white ring-1 ring-gray-300" />
                </span>
              </span>
              <span className="text-xl font-extrabold text-gray-900 leading-none" style={{ fontFamily: 'League Spartan, Inter, ui-sans-serif' }}>AI</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#tech" className="text-gray-600 hover:text-gray-900 transition-colors">Technology</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Success Stories</a>
            <Button variant="ghost" className="text-gray-600" onClick={() => navigate('/login')}>Sign In</Button>
            <Button onClick={() => navigate('/app')} className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white">
              Get Started Free
            </Button>
          </div>
        </div>
      </motion.nav>

      <HeroSection />
      <BentoCapabilities />
      <FeatureShowcase />
      <TechStackGrid />
      <DemoCTA />
      <TestimonialsBento />
      <Footer />
    </div>
  );
}