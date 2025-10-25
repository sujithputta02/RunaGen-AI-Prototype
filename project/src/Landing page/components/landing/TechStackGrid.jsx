import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Cloud, Database, Search, Zap, Shield, Layers } from "lucide-react";

export default function TechStackGrid() {
  const techStack = [
    {
      name: "Gemini 2.5 Flash",
      description: "Smart content generation with state-of-the-art language models",
      icon: Sparkles,
      gradient: "from-purple-600 to-pink-600",
      size: "large"
    },
    {
      name: "Vertex AI",
      description: "Scalable ML backbone for training and deployment",
      icon: Zap,
      gradient: "from-orange-500 to-red-500",
      size: "medium"
    },
    {
      name: "RAG + Vector Search",
      description: "Context-aware retrieval for intelligent responses",
      icon: Search,
      gradient: "from-blue-500 to-cyan-500",
      size: "medium"
    },
    {
      name: "MongoDB + Google Cloud",
      description: "Secure, scalable data persistence",
      icon: Database,
      gradient: "from-green-500 to-emerald-500",
      size: "large"
    },
    {
      name: "Cloud Infrastructure",
      description: "Enterprise-grade reliability",
      icon: Cloud,
      gradient: "from-indigo-500 to-purple-500",
      size: "small"
    },
    {
      name: "Security First",
      description: "Your data, protected",
      icon: Shield,
      gradient: "from-slate-600 to-slate-700",
      size: "small"
    }
  ];

  const gridStyles = {
    large: "md:col-span-2 md:row-span-2",
    medium: "md:col-span-2 md:row-span-1",
    small: "md:col-span-1 md:row-span-1"
  };

  return (
    <section id="tech" className="py-24 px-6 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute inset-0"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Built on <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">world-class technology</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Powered by Google Cloud's most advanced AI and ML infrastructure
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-4">
          {techStack.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`${gridStyles[tech.size]} group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden`}
              >
                {/* Glow Effect */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r ${tech.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                
                <div className="relative h-full flex flex-col">
                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-r ${tech.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    {tech.name}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {tech.description}
                  </p>

                  {/* Visual Element for large cards */}
                  {tech.size === "large" && (
                    <div className="mt-auto pt-6">
                      <div className="relative h-24 bg-gradient-to-br from-white/5 to-white/0 rounded-lg overflow-hidden">
                        <motion.div
                          animate={{
                            x: [-100, 100],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className={`absolute inset-0 bg-gradient-to-r ${tech.gradient} blur-xl opacity-50`}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-xs text-gray-500 font-mono">Processing...</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Powered by Google Cloud */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <Cloud className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300">Proudly powered by</span>
            <span className="font-bold text-white">Google Cloud Platform</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}