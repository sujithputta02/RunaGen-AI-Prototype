import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Simple brand SVGs (accessible, lightweight)
const GoogleIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2045c0-.6385-.0575-1.252-.164-1.836H9v3.472h4.84c-.209 1.127-.843 2.081-1.797 2.72v2.257h2.908c1.701-1.567 2.69-3.874 2.69-6.613z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.182l-2.908-2.257c-.806.54-1.837.86-3.048.86-2.345 0-4.33-1.584-5.037-3.71H.957v2.33C2.437 15.983 5.482 18 9 18z" fill="#34A853"/>
    <path d="M3.963 10.71A5.41 5.41 0 013.68 9c0-.594.102-1.17.283-1.71V4.96H.957A9 9 0 000 9c0 1.46.35 2.84.957 4.04l3.006-2.33z" fill="#FBBC05"/>
    <path d="M9 3.58c1.32 0 2.51.454 3.44 1.345l2.58-2.58C13.467.906 11.43 0 9 0 5.482 0 2.437 2.017.957 4.96l3.006 2.33C4.67 5.164 6.655 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 .5a11.5 11.5 0 00-3.637 22.423c.575.106.786-.25.786-.556 0-.275-.01-1.002-.015-1.967-3.197.695-3.872-1.543-3.872-1.543-.523-1.328-1.278-1.682-1.278-1.682-1.045-.715.079-.701.079-.701 1.156.081 1.764 1.187 1.764 1.187 1.028 1.762 2.696 1.253 3.35.958.104-.744.403-1.253.732-1.542-2.552-.291-5.236-1.276-5.236-5.68 0-1.254.45-2.279 1.187-3.084-.119-.29-.514-1.46.113-3.042 0 0 .965-.309 3.163 1.178a10.97 10.97 0 015.758 0c2.197-1.487 3.161-1.178 3.161-1.178.628 1.582.233 2.752.114 3.042.739.805 1.186 1.83 1.186 3.084 0 4.414-2.69 5.386-5.253 5.672.413.356.78 1.057.78 2.131 0 1.538-.014 2.777-.014 3.156 0 .309.208.669.793.555A11.501 11.501 0 0012 .5z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.451 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.85-3.037-1.853 0-2.136 1.446-2.136 2.94v5.666H9.357V9h3.413v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.604 0 4.268 2.372 4.268 5.455v6.286zM5.337 7.433a2.062 2.062 0 110-4.125 2.062 2.062 0 010 4.125zM7.114 20.452H3.558V9h3.556v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!email) next.email = 'Email is required';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: wire up auth
    // console.log({ email, password });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1200px 600px at 10% 10%, rgba(99,102,241,0.25), transparent 60%),\n             radial-gradient(1000px 600px at 90% 20%, rgba(6,182,212,0.25), transparent 60%),\n             linear-gradient(135deg, #eef2ff 0%, #ecfeff 100%)',
        }}
      />

      {/* Floating geometric blurs */}
      <motion.div
        aria-hidden
        className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-400/30 blur-3xl rounded-full"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-cyan-400/30 blur-3xl rounded-full"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
        role="main"
        aria-label="Login form"
      >
        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-600/20">
            <span className="text-xl font-bold">R</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back to Runa Gen AI</h1>
          <p className="mt-1 text-sm text-gray-600">Your AI career companion is waiting.</p>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-xl shadow-indigo-500/5">
          {/* Accent gradient border */}
          <div className="h-[3px] w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-t-2xl" />

          <form onSubmit={onSubmit} className="p-6 space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                aria-label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500" role="alert">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700">Forgot password?</a>
              </div>
              <input
                id="password"
                aria-label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500" role="alert">{errors.password}</p>
              )}
            </div>

            {/* Remember + Submit */}
            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                Remember me
              </label>
              <Button
                aria-label="Sign in"
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-cyan-500/20 ring-1 ring-transparent hover:ring-indigo-400/40 transition"
                type="submit"
              >
                Sign in
              </Button>
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-xs uppercase tracking-wide text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                aria-label="Continue with Google"
                className="group inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button
                type="button"
                aria-label="Continue with GitHub"
                className="group inline-flex items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black active:scale-[0.98]"
              >
                <GitHubIcon />
                <span>GitHub</span>
              </button>
              <button
                type="button"
                aria-label="Continue with LinkedIn"
                className="group inline-flex items-center justify-center gap-2 rounded-lg border border-[#0A66C2] bg-[#0A66C2] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#0b6fd6] active:scale-[0.98]"
              >
                <LinkedInIcon />
                <span>LinkedIn</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account? <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">Sign up here</Link>
        </p>
      </motion.div>
    </div>
  );
}
