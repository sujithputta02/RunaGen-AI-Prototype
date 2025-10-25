import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, CheckCircle } from "lucide-react";

export default function DemoCTA() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Interactive Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl overflow-hidden shadow-2xl border border-indigo-100">
              {/* Mock Dashboard */}
              <div className="aspect-[16/10] p-6">
                <div className="bg-white rounded-xl shadow-lg h-full p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
                      <div className="h-2 bg-gray-100 rounded w-24" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2, duration: 0.5 }}
                        className="h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Play Button Overlay */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="absolute inset-0 flex items-center justify-center cursor-pointer group"
              >
                <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-indigo-500/50 transition-all duration-300">
                  <Play className="w-8 h-8 text-indigo-600 ml-1" />
                </div>
              </motion.div>
            </div>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-2xl p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">95% Success Rate</div>
                  <div className="text-xs text-gray-500">Based on 10k+ users</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - CTA Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                See How Runa Gen AI <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">Transforms Your Career Path</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Watch how our AI analyzes your profile, creates personalized learning paths, 
                and guides you through career simulations in real-time.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Instant resume analysis and optimization",
                "Personalized skill roadmaps",
                "24/7 AI career mentorship",
                "Real-world scenario practice"
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 text-lg">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white text-lg px-8 py-6 group"
              >
                Launch Runa Gen AI
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-2"
              >
                Schedule a Demo
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}