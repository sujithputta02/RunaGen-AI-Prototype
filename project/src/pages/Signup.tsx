import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const interests = [
  'Software Development',
  'Data Science / AI',
  'Product Management',
  'Design / UX',
  'Marketing / Business Analytics',
];

const experience = ['Beginner', 'Intermediate', 'Advanced'];

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [careerInterest, setCareerInterest] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<string>('Beginner');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0-4
  }, [password]);

  const strengthLabel = useMemo(() => {
    if (strength <= 1) return 'Weak';
    if (strength === 2 || strength === 3) return 'Good';
    return 'Strong';
  }, [strength]);

  const isStrong = useMemo(() => strength === 4, [strength]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    if (!email) next.email = 'Email is required';
    if (!password) next.password = 'Password is required';
    if (password && password.length < 8) next.password = 'Use at least 8 characters';
    if (password && !isStrong) next.password = 'Password must be strong (8+ chars, uppercase, number, symbol)';
    if (confirmPassword && confirmPassword !== password) next.confirmPassword = 'Passwords do not match';
    if (!accepted) next.terms = 'You must accept the Terms & Privacy Policy';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
    setTimeout(() => {
      // placeholder for navigation to onboarding
    }, 800);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
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

      <motion.div aria-hidden className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-400/30 blur-3xl rounded-full" animate={{ y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div aria-hidden className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-cyan-400/30 blur-3xl rounded-full" animate={{ y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-2xl px-6 md:px-8" role="main" aria-label="Sign up form">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-600/20">
            <span className="text-xl font-bold">R</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Join Runa Gen AI</h1>
          <p className="mt-1 text-sm text-gray-600">Your AI career companion starts here.</p>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-xl shadow-indigo-500/5">
          <div className="h-[3px] w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-t-2xl" />

          <form onSubmit={onSubmit} className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
              <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30" />
              {errors.fullName && <p className="mt-1 text-sm text-red-500" role="alert">{errors.fullName}</p>}
            </div>

            <div className="md:col-span-1">
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30" />
              {errors.email && <p className="mt-1 text-sm text-red-500" role="alert">{errors.email}</p>}
            </div>

            <div className="md:col-span-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                <span className="text-xs text-gray-500">Use at least 8 characters, with letters and numbers</span>
              </div>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30" />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((s) => !s)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div className={
                    `h-full transition-all ${strength <= 1 ? 'w-1/4 bg-red-400' : strength === 2 ? 'w-2/4 bg-yellow-400' : strength === 3 ? 'w-3/4 bg-green-400' : 'w-full bg-emerald-500'}`
                  } />
                </div>
                <span className="text-xs text-gray-600">{strengthLabel}</span>
              </div>
              {password && !isStrong && !errors.password && (
                <p className="mt-1 text-xs text-gray-600">Add an uppercase letter, a number, and a symbol to make it strong.</p>
              )}
              {errors.password && <p className="mt-1 text-sm text-red-500" role="alert">{errors.password}</p>}
            </div>

            <div className="md:col-span-1">
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">Confirm Password</label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30" />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500" role="alert">{errors.confirmPassword}</p>}
            </div>

            <div className="md:col-span-1">
              <label htmlFor="careerInterest" className="mb-1 block text-sm font-medium text-gray-700">Career Interest</label>
              <select id="careerInterest" value={careerInterest} onChange={(e) => setCareerInterest(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30">
                <option value="">Select an option (optional)</option>
                {interests.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label htmlFor="experience" className="mb-1 block text-sm font-medium text-gray-700">Experience Level</label>
              <select id="experience" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30">
                {experience.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex items-start gap-3 pt-1">
              <input id="terms" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I accept the{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline">Terms</a>
                {' '} & {' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} className="text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && <p className="-mt-2 text-sm text-red-500" role="alert">{errors.terms}</p>}

            <div className="md:col-span-2 pt-1">
              <Button aria-label="Create account" size="lg" disabled={!isStrong} className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-cyan-500/20 ring-1 ring-transparent hover:ring-indigo-400/40 transition disabled:opacity-60 disabled:cursor-not-allowed" type="submit">
                {submitted ? 'Creating account…' : 'Create account'}
              </Button>
            </div>

            <div className="md:col-span-2 relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-xs uppercase tracking-wide text-gray-500">or continue with</span>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button type="button" aria-label="Sign up with Google" className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]">
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button type="button" aria-label="Sign up with GitHub" className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black active:scale-[0.98]">
                <GitHubIcon />
                <span>GitHub</span>
              </button>
              <button type="button" aria-label="Sign up with LinkedIn" className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#0A66C2] bg-[#0A66C2] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#0b6fd6] active:scale-[0.98]">
                <LinkedInIcon />
                <span>LinkedIn</span>
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Log in here</Link>
        </p>

        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowTerms(false)} />
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100">
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-t-2xl" />
              <div className="p-6 md:p-8 max-h-[70vh] overflow-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Terms of Service</h2>
                <p className="text-sm text-gray-600 mb-4">Please review the following terms for using Runa Gen AI.</p>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  <li>Use Runa Gen AI responsibly and comply with applicable laws.</li>
                  <li>Do not upload content that violates intellectual property or privacy rights.</li>
                  <li>We may update these terms to improve the service; we will notify of material changes.</li>
                  <li>Service is provided as-is; availability and features may change over time.</li>
                </ul>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => setShowTerms(false)} className="w-full sm:w-auto bg-gray-100 text-gray-800 hover:bg-gray-200" aria-label="Close terms" type="button">Close</Button>
                  <Button onClick={() => { setAccepted(true); setShowTerms(false); }} className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-cyan-500 text-white" aria-label="Agree to terms" type="button">I agree</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showPrivacy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowPrivacy(false)} />
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100">
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-t-2xl" />
              <div className="p-6 md:p-8 max-h-[70vh] overflow-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Privacy Policy</h2>
                <p className="text-sm text-gray-600 mb-4">How Runa Gen AI collects, uses, and protects your data.</p>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  <li>We collect necessary data to provide features like mentorship and recommendations.</li>
                  <li>You can request export or deletion of your personal data from your account settings.</li>
                  <li>We do not sell personal data; third parties are used only to deliver core functionality.</li>
                  <li>Security best practices are applied to safeguard your information.</li>
                </ul>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => setShowPrivacy(false)} className="w-full sm:w-auto bg-gray-100 text-gray-800 hover:bg-gray-200" aria-label="Close privacy" type="button">Close</Button>
                  <Button onClick={() => { setAccepted(true); setShowPrivacy(false); }} className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-cyan-500 text-white" aria-label="Accept privacy" type="button">I understand</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
