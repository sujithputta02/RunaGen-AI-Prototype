import React from "react";
import { motion } from "framer-motion";
import { Star, TrendingUp, Award, Users, Quote } from "lucide-react";

export default function TestimonialsBento() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer → Cloud Architect",
      content: "Runa Gen AI helped me transition to cloud architecture in just 6 months. The personalized learning path was spot-on!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop",
      rating: 5,
      metric: { label: "Salary Increase", value: "+40%" }
    },
    {
      name: "Marcus Johnson",
      role: "Marketing Manager",
      content: "The AI mentor understood my career goals and guided me through every step. The simulations prepared me for real interviews.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop",
      rating: 5,
      metric: { label: "Skills Gained", value: "12" }
    },
    {
      name: "Emily Rodriguez",
      role: "Data Analyst → ML Engineer",
      content: "The resume analysis revealed skill gaps I didn't know I had. Now I'm working at my dream company!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop",
      rating: 5,
      metric: { label: "Time to Hire", value: "3 weeks" }
    }
  ];

  return (
    <section id="testimonials" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Trusted by <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">10,000+ professionals</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real stories from people who transformed their careers with Runa Gen AI
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-2xl hover:border-indigo-100 transition-all duration-300"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-indigo-100" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed relative z-10">
                "{testimonial.content}"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>

              {/* Metric */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{testimonial.metric.label}</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                    {testimonial.metric.value}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Bento Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Users, label: "Active Users", value: "10,000+", gradient: "from-blue-500 to-cyan-500" },
            { icon: Award, label: "Skills Mastered", value: "50,000+", gradient: "from-purple-500 to-pink-500" },
            { icon: TrendingUp, label: "Career Transitions", value: "5,000+", gradient: "from-orange-500 to-red-500" },
            { icon: Star, label: "Average Rating", value: "4.9/5", gradient: "from-yellow-500 to-orange-500" }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 text-center group hover:border-transparent hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Powered By */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-500 mb-4">Powered by</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="text-2xl font-bold text-gray-400">Google Cloud</div>
            <div className="text-2xl font-bold text-gray-400">Gemini AI</div>
            <div className="text-2xl font-bold text-gray-400">Vertex AI</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}