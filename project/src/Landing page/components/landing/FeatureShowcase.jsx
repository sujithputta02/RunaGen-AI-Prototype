import React from "react";
import { motion } from "framer-motion";
import { FileText, TrendingUp, Brain, Target, CheckCircle, Sparkles } from "lucide-react";

export default function FeatureShowcase() {
  const features = [
    {
      title: "AI-Powered Resume Analysis",
      description: "Upload your resume and let our AI parse every detail. We extract skills, experience, and qualifications, then match you with the perfect opportunities.",
      points: [
        "Intelligent parsing of PDF, Word, and image formats",
        "Skill gap detection with confidence scores",
        "Real-time job matching dashboard",
        "ATS optimization recommendations"
      ],
      icon: FileText,
      gradient: "from-blue-500 to-cyan-500",
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop"
    },
    {
      title: "Personalized Learning Roadmaps",
      description: "Get a customized learning path based on your goals and current skills. We integrate with top platforms to bring you the best content.",
      points: [
        "Integration with YouTube, Coursera, Udemy",
        "Prioritized skill recommendations",
        "Progress tracking and milestones",
        "Adaptive learning based on performance"
      ],
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop"
    },
    {
      title: "AI Career Mentor",
      description: "Chat with your personal AI mentor powered by Google's Gemini. Get contextual advice, career guidance, and answers to all your professional questions.",
      points: [
        "Context-aware conversations with RAG",
        "Persistent chat memory across sessions",
        "Badge-based engagement system",
        "24/7 availability for instant guidance"
      ],
      icon: Brain,
      gradient: "from-indigo-500 to-purple-500",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop"
    },
    {
      title: "Career Simulations",
      description: "Practice makes perfect. Engage in realistic job scenarios, receive AI feedback, and build confidence before your next big opportunity.",
      points: [
        "Realistic workplace scenarios",
        "Instant AI-powered feedback",
        "Completion metrics and analytics",
        "Skill-based outcome tracking"
      ],
      icon: Target,
      gradient: "from-orange-500 to-red-500",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto space-y-32">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isEven = index % 2 === 0;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:grid-flow-dense' : ''}`}
            >
              {/* Content */}
              <div className={isEven ? '' : 'lg:col-start-2'}>
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${feature.gradient} rounded-full mb-6`}>
                    <Icon className="w-5 h-5 text-white" />
                    <span className="text-sm font-medium text-white">Feature Spotlight</span>
                  </div>
                  
                  <h3 className="text-4xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="space-y-4">
                    {feature.points.map((point, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className={`w-6 h-6 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center shrink-0 mt-0.5`}>
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-700">{point}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Visual */}
              <motion.div
                initial={{ opacity: 0, x: isEven ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className={isEven ? '' : 'lg:col-start-1 lg:row-start-1'}
              >
                <div className="relative group">
                  {/* Glow Effect */}
                  <div className={`absolute -inset-4 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
                  
                  {/* Image Container */}
                  <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      
                      {/* Overlay Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-tr ${feature.gradient} opacity-10`} />
                    </div>

                    {/* Floating Stats */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                      className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center`}>
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">AI Processing</div>
                          <div className="text-xs text-gray-600">99.8% accuracy rate</div>
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                          ✓
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}