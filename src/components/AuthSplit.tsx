/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, Lock, ShieldCheck, Sparkles, User, PawPrint } from "lucide-react";

interface AuthSplitProps {
  onLoginSuccess: (userName: string, token?: string) => void;
  onNavigate: (tab: string) => void;
  authToken?: string | null;
  setAuthToken?: (token: string | null) => void;
}

export default function AuthSplit({ onLoginSuccess, onNavigate, authToken, setAuthToken }: AuthSplitProps) {
  // Toggle between login and signup forms
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState<"dog" | "cat">("dog");
  const [requestedRole, setRequestedRole] = useState<"CUSTOMER" | "PARTNER">("CUSTOMER");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (authMode === "signup") {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            name: fullName,
            password,
            role: requestedRole
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to register account.");
        }

        onLoginSuccess(data.user.name || data.user.email, data.accessToken);
        
        if (data.redirectTo) {
          alert(`Account registered successfully! Redirecting to Partner Onboarding.`);
          onNavigate("onboarding");
        } else {
          alert(`Account registered successfully as ${data.user.name}!`);
          onNavigate("customer-portal");
        }
      } catch (err: any) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    } else {
      // LOGIN: Call the real /api/auth/login endpoint to get a JWT
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email || "sarah.curator@example.com", password })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Login failed.");
        }

        const displayName = data.user?.name || data.user?.email || email;
        onLoginSuccess(displayName, data.accessToken);
        alert(`Logged in successfully!`);
        onNavigate("customer-portal");
      } catch (err: any) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] w-full flex items-stretch bg-brand-cream">
      {/* Left Column: Visual graphic with overlay text */}
      <div className="w-full lg:w-1/2 relative hidden lg:flex items-center justify-center bg-[#1C1C1A] overflow-hidden p-16">
        <div className="absolute inset-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXiJYbSJvbMB31vAcDDj6-7agIupKfVMn-UioPzuvbRnEYM-_YZuLLXYoR2ZzYcxmUkK1dufn5ngQDfeTKfLptSgEM8EUW30fgXnkb4L_BWrjhci7D1ToInnExHTVVfOFXJit5x1_mC39HVMCyP9uuseiREaAxfvxNRjXJbNYS-76MqHJVcL1IFec3Qzq4YCRjq4CFf1gUvSTjvq_HXXDUtWQ-y0LQZimo0pHbButdVFb4QjPJqw"
            alt="Dog resting in sunny room corner"
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 text-white max-w-md space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-brand-sand" />
            <span className="text-[9px] font-mono tracking-widest text-brand-sand uppercase">
              Curator Club Access
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-light leading-tight">
            Cultivate the <br />
            <span className="font-semibold text-brand-sand">Bond.</span>
          </h2>
          <p className="text-sm text-[#EAE5DB]/80 font-light leading-relaxed">
            Register your companions to access exclusive tailored recommendations, premium collection waitlists, and VIP rewards tracking.
          </p>
        </div>
      </div>

      {/* Right Column: Interactive Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md space-y-8 bg-white border border-brand-warm-gray p-8 md:p-10 shadow-sm">
          {/* Form Header */}
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-display font-medium text-brand-charcoal">
              {authMode === "login" ? "Welcome Back" : "Register Companion"}
            </h1>
            <p className="text-xs font-mono text-brand-charcoal/50 uppercase tracking-widest mt-1.5">
              {authMode === "login" ? "Enter VIP Account details" : "Join The Paws Store circle"}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-brand-terracotta/10 border-l-2 border-brand-terracotta text-brand-terracotta text-xs font-mono">
              Error: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {authMode === "signup" && (
              <>
                {/* Full name input for signup */}
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Sarah Jenkins"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
                    />
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-charcoal/40" />
                  </div>
                </div>

                {/* Companion info for customized wellness */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                      Companion Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        placeholder="Max"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
                      />
                      <PawPrint className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-charcoal/40" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                      Companion Type
                    </label>
                    <div className="grid grid-cols-2 border border-brand-warm-gray text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setPetType("dog")}
                        className={`py-2.5 text-center transition-all ${
                          petType === "dog" ? "bg-brand-charcoal text-white font-bold" : "bg-white text-brand-charcoal/60 hover:bg-brand-oatmeal/40"
                        }`}
                      >
                        Dog
                      </button>
                      <button
                        type="button"
                        onClick={() => setPetType("cat")}
                        className={`py-2.5 text-center transition-all ${
                          petType === "cat" ? "bg-brand-charcoal text-white font-bold" : "bg-white text-brand-charcoal/60 hover:bg-brand-oatmeal/40"
                        }`}
                      >
                        Cat
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Type Radio Selector */}
                <div className="pt-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-2.5">
                    Account Role
                  </label>
                  <div className="flex gap-6 font-mono text-xs text-brand-charcoal py-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="requestedRole"
                        value="CUSTOMER"
                        checked={requestedRole === "CUSTOMER"}
                        onChange={() => setRequestedRole("CUSTOMER")}
                        className="accent-brand-charcoal w-3.5 h-3.5"
                      />
                      <span>Customer</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="requestedRole"
                        value="PARTNER"
                        checked={requestedRole === "PARTNER"}
                        onChange={() => setRequestedRole("PARTNER")}
                        className="accent-brand-charcoal w-3.5 h-3.5"
                      />
                      <span>Boutique Partner</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarah@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-charcoal/40" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block">
                  Secure Password
                </label>
                {authMode === "login" && (
                  <span className="text-[10px] font-mono text-brand-terracotta hover:underline cursor-pointer">
                    Forgot Password?
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-charcoal/40" />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-charcoal text-white hover:bg-brand-sage text-xs font-mono uppercase tracking-widest font-bold transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : authMode === "login" ? (
                "Sign Into Account"
              ) : (
                "Complete Registration"
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="pt-6 border-t border-brand-warm-gray text-center space-y-4">
            <span className="text-[9px] font-mono uppercase tracking-wider text-brand-charcoal/40 block">
              Or Express Authenticate With
            </span>

            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: "sarah.curator@example.com", password: "demo" })
                  });
                  const data = await res.json();
                  setLoading(false);
                  if (res.ok && data.accessToken) {
                    onLoginSuccess(data.user?.name || "Sarah", data.accessToken);
                  } else {
                    onLoginSuccess("Sarah");
                  }
                  onNavigate("customer-portal");
                } catch (err) {
                  setLoading(false);
                  onLoginSuccess("Sarah");
                  onNavigate("customer-portal");
                }
              }}
              className="w-full py-3 px-4 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all text-xs font-sans font-medium text-gray-800 flex items-center justify-center gap-3 bg-white shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.23 21.3 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.98 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.23 2.7 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              Sign in with Google Account
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="text-center pt-2">
            {authMode === "login" ? (
              <p className="text-xs text-brand-charcoal/60 font-light">
                Don't have a companion profile yet?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className="font-mono text-brand-terracotta hover:underline uppercase font-bold text-[11px]"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-xs text-brand-charcoal/60 font-light">
                Already have a curation profile?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="font-mono text-brand-terracotta hover:underline uppercase font-bold text-[11px]"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
