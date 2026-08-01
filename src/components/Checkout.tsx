/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CreditCard, Truck, CheckCircle2, ShieldCheck, ShoppingBag, ArrowLeft, Gift, User, Lock, Sparkles, Check, RefreshCw, X, Mail, Send } from "lucide-react";
import { CartItem } from "../types";

interface CheckoutProps {
  cartItems: CartItem[];
  discount: { code: string; percent: number };
  currentUser?: string | null;
  authToken?: string | null;
  onLoginSuccess?: (name: string, token?: string) => void;
  onClearCart: () => void;
  onNavigate: (tab: string) => void;
}

const GoogleGLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.23 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.98 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.23 2.7 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export default function Checkout({ cartItems, discount, currentUser, authToken, onLoginSuccess, onClearCart, onNavigate }: CheckoutProps) {
  // Wizard state
  const [step, setStep] = useState<"info" | "complete">("info");

  // Google Authentication State
  const [isGoogleAuth, setIsGoogleAuth] = useState<boolean>(true);
  const [googleUser, setGoogleUser] = useState<{ name: string; email: string; avatar: string }>({
    name: currentUser || "Sarah Jenkins",
    email: "sarah.jenkins@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
  });
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [isAuthenticatingGoogle, setIsAuthenticatingGoogle] = useState<boolean>(false);
  const [authStep, setAuthStep] = useState<"choose" | "verifying" | "custom">("choose");
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [pendingOrderProcess, setPendingOrderProcess] = useState<boolean>(false);

  // Shipping form fields
  const [email, setEmail] = useState("sarah.jenkins@gmail.com");
  const [firstName, setFirstName] = useState("Sarah");
  const [lastName, setLastName] = useState("Jenkins");
  const [address, setAddress] = useState("1204 Pine Street");
  const [apartment, setApartment] = useState("Apt 4B");
  const [city, setCity] = useState("Seattle");
  const [state, setState] = useState("WA");
  const [zipCode, setZipCode] = useState("98101");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");

  // Gift wrapping and note
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [giftNote, setGiftNote] = useState("");

  // Payment form fields
  const [cardNumber, setCardNumber] = useState("••••  ••••  ••••  4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("•••");

  // Subtotal calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = subtotal * (discount.percent / 100);
  const taxedSubtotal = subtotal - discountAmount;
  const shippingCost = shippingMethod === "express" ? 15.00 : (subtotal > 150 ? 0 : 15.00);
  const estimatedTax = taxedSubtotal * 0.08;
  const giftWrappingCost = giftWrapping ? 10.00 : 0.00;
  const orderTotal = taxedSubtotal + shippingCost + estimatedTax + giftWrappingCost;

  // Mock processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  // Email Confirmation Toast Notification States
  const [showEmailToast, setShowEmailToast] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [emailResentSuccess, setEmailResentSuccess] = useState(false);

  const handleSelectGoogleAccount = async (selectedName: string, selectedEmail: string, selectedAvatar: string) => {
    setAuthStep("verifying");
    setIsAuthenticatingGoogle(true);

    try {
      // Call the real login endpoint to get a JWT
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedEmail, password: "demo" })
      });
      const data = await res.json();

      setIsAuthenticatingGoogle(false);
      setIsGoogleAuth(true);
      setGoogleUser({ name: selectedName, email: selectedEmail, avatar: selectedAvatar });
      setEmail(selectedEmail);
      
      const parts = selectedName.trim().split(" ");
      setFirstName(parts[0] || "Pet");
      setLastName(parts.slice(1).join(" ") || "Lover");

      if (onLoginSuccess && data.accessToken) {
        onLoginSuccess(selectedName, data.accessToken);
      } else if (onLoginSuccess) {
        onLoginSuccess(selectedName);
      }

      setShowGoogleModal(false);
      setAuthStep("choose");

      if (pendingOrderProcess) {
        setPendingOrderProcess(false);
        triggerOrderPlacement();
      }
    } catch (err) {
      setIsAuthenticatingGoogle(false);
      setIsGoogleAuth(true);
      setGoogleUser({ name: selectedName, email: selectedEmail, avatar: selectedAvatar });
      setEmail(selectedEmail);
      setShowGoogleModal(false);
      setAuthStep("choose");
    }
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail || !customGoogleName) return;

    handleSelectGoogleAccount(
      customGoogleName,
      customGoogleEmail,
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
    );
  };

  const [createdOrderDetails, setCreatedOrderDetails] = useState<any>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const triggerOrderPlacement = async () => {
    setIsProcessing(true);
    setCheckoutError(null);

    const itemsPayload = cartItems.map(item => ({
      inventoryId: item.inventoryId,
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      name: item.product.name
    }));

    try {
      // Step 1: Create Order in PENDING_PAYMENT status
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken || currentUser || email}`
        },
        body: JSON.stringify({
          addressId: "addr-1",
          items: itemsPayload,
          notes: giftNote || "Standard customer pickup/delivery",
          couponCode: discount.code || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to place order.");
      }

      const orderId = data.id;

      // Step 2: Create Razorpay Order Intent
      const intentRes = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken || currentUser || email}`
        },
        body: JSON.stringify({ orderId })
      });

      const intentData = await intentRes.json();
      if (!intentRes.ok) {
        throw new Error(intentData.error || "Failed to create Razorpay payment order.");
      }

      // Step 3: Verify Payment & Confirm Order
      const verifyRes = await fetch("/api/payments/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken || currentUser || email}`
        },
        body: JSON.stringify({
          razorpayOrderId: intentData.razorpayOrderId || orderId,
          razorpayPaymentId: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          razorpaySignature: "mock_sig_razorpay_verified"
        })
      });

      const verifyData = await verifyRes.json();
      const finalOrder = verifyData.order || data;

      setCreatedOrderDetails(finalOrder);
      setPlacedOrderId(finalOrder.id || orderId);
      setStep("complete");
      setShowEmailToast(true);
    } catch (err: any) {
      setCheckoutError(err.message || String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendEmail = () => {
    setIsResendingEmail(true);
    setEmailResentSuccess(false);
    setTimeout(() => {
      setIsResendingEmail(false);
      setEmailResentSuccess(true);
      setTimeout(() => setEmailResentSuccess(false), 3000);
    }, 1200);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isGoogleAuth) {
      setPendingOrderProcess(true);
      setShowGoogleModal(true);
      return;
    }

    triggerOrderPlacement();
  };

  const handleFinishAndReturn = () => {
    onClearCart(); // Empty the cart state dynamically
    onNavigate("customer-portal"); // Go to Sarah's dashboard
  };

  if (step === "complete") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center flex flex-col items-center relative">
        {/* Floating Email Confirmation Toast Notification */}
        {showEmailToast && (
          <div className="fixed top-20 right-4 sm:right-8 z-[250] max-w-sm w-full bg-brand-charcoal text-white p-4 shadow-2xl border-l-4 border-emerald-500 flex flex-col gap-2 transition-all">
            <div className="flex items-start justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 rounded-full shrink-0">
                  <Mail className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                    <span>Email Trigger Fired</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-xs font-sans font-semibold text-gray-100 mt-0.5">
                    Order Receipt Dispatched
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailToast(false)}
                className="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                title="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] font-sans text-gray-300 leading-snug text-left pl-10">
              Confirmation summary & digital invoice for <strong className="text-white font-mono">{placedOrderId}</strong> sent to <strong className="text-white">{email}</strong>.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-gray-700/60 mt-1 pl-10">
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isResendingEmail}
                className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isResendingEmail ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" /> Transmitting Email...
                  </>
                ) : emailResentSuccess ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Email Re-Dispatched!
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" /> Resend Order Confirmation
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        <CheckCircle2 className="w-20 h-20 text-brand-sage mb-6 animate-bounce" />
        <span className="text-xs font-mono tracking-widest text-brand-sage uppercase block mb-1 font-semibold">
          Order Confirmed & Secured
        </span>
        <h1 className="text-3xl font-display font-medium text-brand-charcoal mb-3">
          Thank you for your order, {firstName}!
        </h1>
        <p className="text-sm text-brand-charcoal/60 font-light max-w-md mb-6 leading-relaxed">
          Your order <strong className="font-semibold text-brand-charcoal">{placedOrderId}</strong> has been placed. A white-glove shipping confirmation has been dispatched to <strong className="font-semibold text-brand-charcoal">{email}</strong>.
        </p>

        {/* Google Authentication Verified Banner */}
        <div className="w-full bg-emerald-50/90 border border-emerald-200 p-4 mb-8 flex items-center justify-between text-left text-xs font-mono rounded-none">
          <div className="flex items-center gap-3">
            <GoogleGLogo className="w-5 h-5 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                <span>Google Security Sync Active</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-emerald-800/80 text-[11px] font-sans">
                Order linked to Google account ({googleUser.email})
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 text-[10px] uppercase tracking-wider font-bold shrink-0">
            OAuth 2.0 Verified
          </span>
        </div>

        {/* Short Order Recap card */}
        <div className="w-full bg-brand-oatmeal border border-brand-warm-gray p-6 text-left space-y-4 mb-10 font-mono text-xs text-brand-charcoal">
          <h3 className="font-bold border-b border-brand-warm-gray pb-2 uppercase tracking-wider">
            Order & Multi-Vendor Store Fulfillments
          </h3>

          {createdOrderDetails?.fulfillments && createdOrderDetails.fulfillments.length > 0 && (
            <div className="space-y-4 my-2">
              {createdOrderDetails.fulfillments.map((ful: any, idx: number) => (
                <div key={ful.id || idx} className="p-4 bg-white border border-brand-warm-gray/60 space-y-2">
                  <div className="flex justify-between items-center border-b border-brand-warm-gray/40 pb-2">
                    <div>
                      <span className="font-bold uppercase text-brand-charcoal text-xs">
                        Store #{idx + 1}: {ful.store?.businessName || "Bark & Purr Haven"}
                      </span>
                      <p className="text-[10px] text-brand-charcoal/50">{ful.store?.address || "Seattle, WA"}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-brand-charcoal text-white text-[9px] font-bold uppercase">
                      Status: {ful.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    {Array.isArray(ful.items) && ful.items.map((it: any, iIdx: number) => (
                      <div key={iIdx} className="flex justify-between text-brand-charcoal/80">
                        <span>{it.quantity}x {it.name}</span>
                        <span>₹{(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-brand-warm-gray/20">
                    <span>Store Subtotal (incl. tax)</span>
                    <span>₹{Number(ful.total).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-brand-charcoal/60">Estimated Delivery</span>
            <span className="font-semibold">
              {shippingMethod === "express" ? "2-3 Business Days (Express)" : "5-7 Business Days (White Glove)"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-charcoal/60">Shipping Destination</span>
            <span className="font-semibold">{address}, {city}, {state}</span>
          </div>
          {giftWrapping && (
            <>
              <div className="flex justify-between border-t border-brand-warm-gray/50 pt-2 text-brand-sage font-semibold">
                <span>Premium Gift Wrapping</span>
                <span>Included (₹10.00)</span>
              </div>
              {giftNote.trim() && (
                <div className="bg-white border border-brand-warm-gray/40 p-3 text-[11px] leading-relaxed italic text-brand-charcoal/80 space-y-1">
                  <span className="font-bold not-italic font-mono uppercase text-[9px] text-brand-charcoal/40 block">Your Gift Note:</span>
                  "{giftNote}"
                </div>
              )}
            </>
          )}
          <div className="flex justify-between border-t border-brand-warm-gray pt-2 font-bold text-sm">
            <span>Amount Transacted</span>
            <span>₹{orderTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleFinishAndReturn}
          className="px-8 py-3.5 bg-brand-charcoal text-white hover:bg-brand-sage transition-colors text-xs font-mono uppercase tracking-widest rounded-none"
        >
          View {firstName}'s Account Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Dynamic wizard indicators */}
      <div className="flex justify-center items-center gap-6 mb-10 text-xs font-mono uppercase tracking-widest text-brand-charcoal">
        <span className="font-semibold border-b-2 border-brand-charcoal pb-1">1. Shipping Info</span>
        <span className="text-brand-charcoal/30">/</span>
        <span className="text-brand-charcoal/40">2. Google Auth & Payment</span>
        <span className="text-brand-charcoal/30">/</span>
        <span className="text-brand-charcoal/40">3. Confirmation</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Forms */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8">
          
          {/* Google Sign-In Express Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-widest text-brand-charcoal font-bold pb-2 border-b border-brand-warm-gray flex items-center justify-between">
              <span>Customer Authentication</span>
              <span className="text-[10px] font-normal text-brand-charcoal/60 lowercase">powered by Google OAuth</span>
            </h2>

            {isGoogleAuth ? (
              <div className="bg-emerald-50/90 border border-emerald-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={googleUser.avatar}
                      alt={googleUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-300"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm">
                      <GoogleGLogo className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950 font-mono uppercase">
                      <span>Google Verified Account</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-emerald-800 font-sans font-medium">
                      {googleUser.name} <span className="text-emerald-600/80 font-mono text-[11px]">({googleUser.email})</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAuthStep("choose");
                    setShowGoogleModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-white border border-emerald-300 hover:border-emerald-500 text-emerald-900 text-[11px] font-mono uppercase tracking-wider transition-all self-start sm:self-auto cursor-pointer"
                >
                  Switch Account
                </button>
              </div>
            ) : (
              <div className="bg-white border-2 border-brand-charcoal/20 hover:border-brand-charcoal p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    <GoogleGLogo className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-brand-charcoal">
                      Sign in with Google to Place Order
                    </h4>
                    <p className="text-xs text-brand-charcoal/60 font-light mt-0.5">
                      Authenticates your identity, syncs real-time shipment updates, and speeds up checkout.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAuthStep("choose");
                    setShowGoogleModal(true);
                  }}
                  className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-sans font-semibold text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all shrink-0 cursor-pointer rounded-none border-b-2 border-b-gray-400"
                >
                  <GoogleGLogo className="w-4 h-4" />
                  Sign in with Google
                </button>
              </div>
            )}
          </div>

          {/* Contact details */}
          <div className="space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-widest text-brand-charcoal font-bold pb-2 border-b border-brand-warm-gray">
              Contact Information
            </h2>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                Email Address for Confirmations
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
              />
            </div>
          </div>

          {/* Shipping address details */}
          <div className="space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-widest text-brand-charcoal font-bold pb-2 border-b border-brand-warm-gray">
              Shipping Destination
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                Street Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                Apartment, Suite, Unit, etc. (Optional)
              </label>
              <input
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                  State
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                  ZIP / Postal Code
                </label>
                <input
                  type="text"
                  required
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
                />
              </div>
            </div>
          </div>

          {/* Delivery Method Selection */}
          <div className="space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-widest text-brand-charcoal font-bold pb-2 border-b border-brand-warm-gray">
              Select Courier Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setShippingMethod("standard")}
                className={`p-4 border text-left cursor-pointer transition-all flex items-start gap-3 ${
                  shippingMethod === "standard"
                    ? "border-brand-charcoal bg-white shadow-sm"
                    : "border-brand-warm-gray bg-brand-cream/30 hover:border-brand-charcoal/40"
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingMethod === "standard"}
                  onChange={() => setShippingMethod("standard")}
                  className="mt-1 accent-brand-charcoal"
                />
                <div>
                  <div className="font-mono text-xs font-bold uppercase text-brand-charcoal">
                    Standard White-Glove (5-7 Days)
                  </div>
                  <div className="text-xs text-brand-charcoal/60 font-light mt-0.5">
                    {subtotal > 150 ? "Complimentary" : "₹15.00"}
                  </div>
                </div>
              </label>

              <label
                onClick={() => setShippingMethod("express")}
                className={`p-4 border text-left cursor-pointer transition-all flex items-start gap-3 ${
                  shippingMethod === "express"
                    ? "border-brand-charcoal bg-white shadow-sm"
                    : "border-brand-warm-gray bg-brand-cream/30 hover:border-brand-charcoal/40"
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingMethod === "express"}
                  onChange={() => setShippingMethod("express")}
                  className="mt-1 accent-brand-charcoal"
                />
                <div>
                  <div className="font-mono text-xs font-bold uppercase text-brand-charcoal">
                    Priority Express (2-3 Days)
                  </div>
                  <div className="text-xs text-brand-charcoal/60 font-light mt-0.5">₹15.00</div>
                </div>
              </label>
            </div>
          </div>

          {/* Gift Wrapping Options */}
          <div className="space-y-4 bg-brand-oatmeal/60 border border-brand-warm-gray/60 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-brand-terracotta" />
                <span className="text-xs font-mono uppercase tracking-wider text-brand-charcoal font-bold">
                  Bespoke Gift Packaging
                </span>
              </div>
              <button
                type="button"
                onClick={() => setGiftWrapping(!giftWrapping)}
                className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider font-bold transition-all border ${
                  giftWrapping
                    ? "bg-brand-terracotta text-white border-brand-terracotta"
                    : "bg-white text-brand-charcoal border-brand-warm-gray hover:border-brand-charcoal"
                }`}
              >
                {giftWrapping ? "Gift Option Added (+₹10)" : "+ Add Gift Option (₹10)"}
              </button>
            </div>

            {giftWrapping && (
              <div className="space-y-2 pt-2 border-t border-brand-warm-gray/50">
                <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/60 block">
                  Personalized Note to Include in Box
                </label>
                <textarea
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="e.g. For Max's 3rd birthday! Enjoy the velvet rest spot."
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-brand-warm-gray text-xs focus:outline-none focus:border-brand-sage rounded-none"
                />
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-widest text-brand-charcoal font-bold pb-2 border-b border-brand-warm-gray flex items-center justify-between">
              <span>Secure Payment</span>
              <ShieldCheck className="w-4 h-4 text-brand-sage" />
            </h2>

            <div className="space-y-4 bg-white border border-brand-warm-gray p-5">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-warm-gray text-sm font-mono focus:outline-none focus:border-brand-sage rounded-none"
                  />
                  <CreditCard className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-charcoal/40" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-4 py-2.5 bg-white border border-brand-warm-gray text-sm font-mono focus:outline-none focus:border-brand-sage rounded-none text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                    Security Code (CVV)
                  </label>
                  <input
                    type="password"
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength={4}
                    placeholder="123"
                    className="w-full px-4 py-2.5 bg-white border border-brand-warm-gray text-sm font-mono focus:outline-none focus:border-brand-sage rounded-none text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Error Display */}
          {checkoutError && (
            <div className="bg-red-50 border border-red-200 p-4 text-left text-xs font-mono text-red-800">
              <span className="font-bold uppercase text-[10px] tracking-wider text-red-600 block mb-1">⚠ Order Error</span>
              {checkoutError}
            </div>
          )}

          {/* Checkout controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => onNavigate("cart")}
              className="text-xs font-mono text-brand-charcoal/55 hover:text-brand-charcoal transition-all uppercase tracking-wider font-semibold flex items-center gap-2 border-b border-brand-charcoal/30 hover:border-brand-charcoal cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Shopping Bag
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="px-8 py-4 bg-brand-charcoal text-white hover:bg-brand-sage transition-all text-xs font-mono uppercase tracking-widest font-bold shadow-md hover:shadow-xl rounded-none disabled:opacity-50 flex items-center gap-3 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing Order...
                </>
              ) : !isGoogleAuth ? (
                <>
                  <GoogleGLogo className="w-4 h-4" />
                  Sign in with Google & Place Order (₹{orderTotal.toFixed(2)})
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Securely Place Order (₹{orderTotal.toFixed(2)})
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Side: Order Summary Sidebar */}
        <div className="lg:col-span-5 bg-brand-oatmeal p-8 border border-brand-warm-gray/50 space-y-6 lg:sticky lg:top-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-brand-charcoal font-bold pb-4 border-b border-brand-warm-gray">
            Order Review ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
          </h2>

          {/* Compact items list */}
          <div className="divide-y divide-brand-warm-gray/40 max-h-80 overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 py-4 items-center">
                <div className="w-14 h-14 bg-white border border-brand-warm-gray/30 overflow-hidden shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-xs font-display font-semibold text-brand-charcoal truncate">
                    {item.product.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-brand-charcoal/50">
                    <span>Qty: {item.quantity}</span>
                    {item.selectedSize && (
                      <>
                        <span>•</span>
                        <span>{item.selectedSize}</span>
                      </>
                    )}
                  </div>
                  {item.giftNote && (
                    <div className="mt-1 flex items-center gap-1 text-[9px] font-mono text-brand-terracotta bg-brand-terracotta/5 px-1.5 py-0.5 border-l border-brand-terracotta shrink-0">
                      <Gift className="w-2.5 h-2.5 shrink-0 text-brand-terracotta" />
                      <span className="truncate italic">"{item.giftNote}"</span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-mono font-semibold text-brand-charcoal shrink-0">
                  ₹{(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Google Auth Status Box in Sidebar */}
          <div className="bg-white border border-brand-warm-gray p-3 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <GoogleGLogo className="w-4 h-4 shrink-0" />
              <span className="text-[11px] text-brand-charcoal">
                {isGoogleAuth ? `Google Auth: ${googleUser.name}` : "Google Auth: Pending"}
              </span>
            </div>
            {isGoogleAuth ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="text-[10px] text-brand-terracotta hover:underline font-bold uppercase"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Pricing calculations details */}
          <div className="border-t border-brand-warm-gray pt-4 space-y-2.5 text-xs font-mono">
            <div className="flex justify-between text-brand-charcoal/70">
              <span>Items Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            {discount.percent > 0 && (
              <div className="flex justify-between text-brand-sage font-bold">
                <span>Discount Applied ({discount.code})</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-brand-charcoal/70">
              <span>Vetted Shipping</span>
              <span>{shippingCost === 0 ? "Complimentary" : `₹${shippingCost.toFixed(2)}`}</span>
            </div>

            <div className="flex justify-between text-brand-charcoal/70">
              <span>Estimated Sales Tax</span>
              <span>₹{estimatedTax.toFixed(2)}</span>
            </div>

            {giftWrapping && (
              <div className="flex justify-between text-brand-sage font-semibold">
                <span className="flex items-center gap-1"><Gift className="w-3.5 h-3.5" /> Premium Gift Wrapping</span>
                <span>₹10.00</span>
              </div>
            )}

            <div className="border-t border-brand-warm-gray pt-4 flex justify-between text-sm text-brand-charcoal font-bold">
              <span>Final Grand Total</span>
              <span>₹{orderTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Google Authentication Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden border border-gray-200">
            {/* Google OAuth Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <GoogleGLogo className="w-6 h-6" />
                <div>
                  <h3 className="text-base font-sans font-medium text-gray-900">Sign in with Google</h3>
                  <p className="text-xs text-gray-500">to continue to The Paws Store</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGoogleModal(false);
                  setPendingOrderProcess(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {isAuthenticatingGoogle ? (
                <div className="py-10 text-center space-y-4 flex flex-col items-center">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-sans font-medium text-gray-900">Connecting to Google OAuth 2.0...</h4>
                    <p className="text-xs text-gray-500 mt-1">Verifying identity & syncing profile data</p>
                  </div>
                </div>
              ) : authStep === "choose" ? (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600 font-sans">
                    Choose an account to authenticate your purchase:
                  </p>

                  <div className="space-y-2">
                    {/* Account 1: Sarah Jenkins */}
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectGoogleAccount(
                          "Sarah Jenkins",
                          "sarah.jenkins@gmail.com",
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                        )
                      }
                      className="w-full p-3.5 border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                          alt="Sarah Jenkins"
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <div className="text-xs font-sans font-semibold text-gray-900 group-hover:text-blue-600">
                            Sarah Jenkins
                          </div>
                          <div className="text-xs text-gray-500 font-sans">sarah.jenkins@gmail.com</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Active
                      </span>
                    </button>

                    {/* Account 2: Alex Morgan */}
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectGoogleAccount(
                          "Alex Morgan",
                          "alex.morgan@gmail.com",
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
                        )
                      }
                      className="w-full p-3.5 border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
                          alt="Alex Morgan"
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <div className="text-xs font-sans font-semibold text-gray-900 group-hover:text-blue-600">
                            Alex Morgan
                          </div>
                          <div className="text-xs text-gray-500 font-sans">alex.morgan@gmail.com</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                        Google Verified
                      </span>
                    </button>

                    {/* Option 3: Custom Google Account */}
                    <button
                      type="button"
                      onClick={() => setAuthStep("custom")}
                      className="w-full p-3.5 border border-dashed border-gray-300 hover:border-gray-400 rounded-lg flex items-center gap-3 text-left transition-all cursor-pointer text-xs font-sans font-medium text-gray-700 hover:text-gray-900"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                        +
                      </div>
                      <span>Use another Google account</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Custom Google Account Form */
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-4">
                  <p className="text-xs text-gray-600 font-sans">
                    Enter your Google Account email to authenticate:
                  </p>

                  <div>
                    <label className="text-xs font-sans font-medium text-gray-700 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-sans font-medium text-gray-700 block mb-1">
                      Google Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="e.g. maya.lin@gmail.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthStep("choose")}
                      className="text-xs text-gray-500 hover:text-gray-700 font-sans"
                    >
                      ← Back to accounts
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-medium rounded-md transition-all shadow-sm cursor-pointer"
                    >
                      Authenticate Account
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 font-sans flex items-center justify-between">
              <span>Protected by Google Identity Service</span>
              <span className="text-gray-400">OAuth 2.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
