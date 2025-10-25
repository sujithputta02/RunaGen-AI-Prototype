import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, Target, Zap, Play } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-indigo-100"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-600">Powered by Google Cloud Gemini AI</span>
            </motion.div>

            {/* Runa Gen AI logo */}
            <div className="mt-4">
              <img
                src="/runagen ai sv.svg"
                alt="Runa Gen AI"
                className="h-24 md:h-28 w-auto"
              />
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Empower Your
              </span>
              <br />
              <span className="text-gray-900">Career with AI</span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Runa Gen AI combines the intelligence of Google Cloud's Gemini with real-world insights 
              to accelerate your professional growth through personalized learning and AI mentorship.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white text-lg px-8 py-6 group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-2 group"
              >
                <Play className="w-5 h-5 mr-2" />
                See How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold text-gray-900">10k+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">50k+</div>
                <div className="text-sm text-gray-600">Skills Mastered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative h-[600px] hidden lg:block"
          >
            {/* Dashboard Card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 right-0 w-80 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-indigo-100 p-6 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="text-sm font-medium text-gray-600 mb-4">Your Career Dashboard</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                    <span className="text-sm font-medium">AI Resume Score</span>
                    <span className="text-lg font-bold text-indigo-600">92/100</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600">Skill Progress</div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: "78%" }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Mentor Card */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-20 left-0 w-72 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-100 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">AI Career Mentor</div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    Based on your profile, I recommend focusing on cloud architecture next...
                  </div>
                  <motion.div
                    className="mt-2 flex gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Floating Icons */}
            <FloatingIcon icon={Target} color="indigo" delay={0} top="10%" left="10%" />
            <FloatingIcon icon={Zap} color="cyan" delay={0.3} bottom="30%" right="5%" />
            <FloatingIcon icon={Sparkles} color="purple" delay={0.6} top="40%" right="20%" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FloatingIcon({ icon: Icon, color, delay, ...position }) {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600',
    cyan: 'from-cyan-500 to-cyan-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <motion.div
      animate={{ 
        y: [0, -15, 0],
        rotate: [0, 5, 0],
      }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay 
      }}
      className="absolute"
      style={position}
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl shadow-lg flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </motion.div>
  );
}