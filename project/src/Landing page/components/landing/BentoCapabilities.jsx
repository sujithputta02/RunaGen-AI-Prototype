import React from "react";
import { motion } from "framer-motion";
import { FileText, TrendingUp, Brain, Target, ArrowRight } from "lucide-react";

export default function BentoCapabilities() {
  const capabilities = [
    {
      title: "AI-Powered Resume Analysis",
      description: "Smart parsing with skill extraction and job match scoring",
      icon: FileText,
      gradient: "from-blue-500 to-cyan-500",
      visual: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-600">Parsing complete</span>
          </div>
          <div className="space-y-1">
            {['Python', 'React', 'Cloud Architecture'].map((skill, i) => (
              <motion.div
                key={skill}
                initial={{ width: 0 }}
                whileInView={{ width: `${90 - i * 15}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              />
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Personalized Learning Paths",
      description: "AI-driven roadmaps with skill priorities from Critical to Nice-to-have",
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
      visual: (
        <div className="space-y-3">
          {[
            { label: 'Critical Skills', width: '100%', color: 'bg-purple-500' },
            { label: 'Important', width: '70%', color: 'bg-purple-400' },
            { label: 'Nice-to-have', width: '40%', color: 'bg-purple-300' }
          ].map((item, i) => (
            <div key={i}>
              <div className="text-xs text-gray-600 mb-1">{item.label}</div>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: item.width }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className={`h-2 ${item.color} rounded-full`}
              />
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Career Mentor (Gemini AI)",
      description: "Conversational AI with context-aware feedback and guidance",
      icon: Brain,
      gradient: "from-indigo-500 to-purple-500",
      visual: (
        <div className="space-y-2">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 text-sm text-gray-700">
            How can I transition to cloud engineering?
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
            Based on your background, I recommend...
            <motion.div
              className="mt-1 flex gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </motion.div>
          </div>
        </div>
      )
    },
    {
      title: "Career Simulations",
      description: "Practice real-world scenarios with instant AI feedback",
      icon: Target,
      gradient: "from-orange-500 to-red-500",
      visual: (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Completed', value: '12' },
            { label: 'Success Rate', value: '89%' },
            { label: 'Avg Score', value: '85' },
            { label: 'Badges', value: '5' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 text-center"
            >
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      )
    }
  ];

  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Everything you need to <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">grow your career</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful AI-driven tools that adapt to your unique career journey
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative bg-white rounded-2xl border border-gray-200 p-8 hover:border-transparent hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Gradient Border Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${capability.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Glow Effect */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r ${capability.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                
                <div className="relative">
                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-r ${capability.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {capability.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {capability.description}
                  </p>

                  {/* Visual */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    {capability.visual}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-400 group-hover:text-indigo-600 transition-colors">
                    Learn more
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}