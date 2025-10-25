import React from "react";
import { Twitter, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Demo", "Roadmap", "Integrations"]
    },
    {
      title: "Company",
      links: ["About", "Careers", "Blog", "Press Kit", "Contact"]
    },
    {
      title: "Resources",
      links: ["Documentation", "API Reference", "Tutorials", "Case Studies", "Community"]
    },
    {
      title: "Support",
      links: ["Help Center", "Status", "Terms of Service", "Privacy Policy", "Cookie Policy"]
    }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Gradient Border */}
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500" />
      
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/runagen ai sv.svg"
                alt="Runa Gen AI"
                className="w-10 h-10 rounded-lg object-contain"
              />
              <div className="flex items-end gap-3">
                <span className="relative inline-flex items-center">
                  <span className="text-xl font-semibold text-white" style={{ fontFamily: 'Noto Sans Devanagari, Inter, ui-sans-serif' }}>ऋण</span>
                  <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-white align-middle"></span>
                </span>
                <span className="relative inline-flex items-end" style={{ fontFamily: 'League Spartan, Inter, ui-sans-serif' }}>
                  <span className="text-xl font-extrabold text-amber-400 leading-none">Gen</span>
                  <span className="absolute -top-3 md:-top-3.5 left-9 md:left-10 flex gap-1">
                    <span className="w-1.5 h-2.5 rounded-full bg-violet-500" />
                    <span className="w-1.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="w-1.5 h-2.5 rounded-full bg-white ring-1 ring-gray-300" />
                  </span>
                </span>
                <span className="text-xl font-extrabold text-white leading-none" style={{ fontFamily: 'League Spartan, Inter, ui-sans-serif' }}>AI</span>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              The AI Career Companion that helps you discover, grow, and prepare for your next career move.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, i) => (
            <div key={i}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 Runa Gen AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}