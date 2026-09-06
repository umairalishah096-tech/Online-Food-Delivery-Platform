import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, CreditCard, Clock, CheckCircle,
  ShoppingBag, ChevronRight, Banknote,
} from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { createDocument, COLLECTIONS, serverTimestamp } from "../../firebase/firestore";
import toast from "react-hot-toast";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";

const PAYMENT_METHODS = [
  { id: "card", icon: CreditCard, label: "Credit / Debit Card" },
  { id: "cod", icon: Banknote, label: "Cash on Delivery" },
];

const TIME_SLOTS = [
  { value: "asap", label: "As soon as possible (~30 min)" },
  { value: "30", label: "In 30 minutes" },
  { value: "60", label: "In 1 hour" },
  { value: "90", label: "In 1.5 hours" },
];

const Checkout = () => {
  const { items, subtotal, deliveryFee, tax, total, clearCart, restaurantId, restaurantName } = useCart();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=success
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    street: userProfile?.address || "",
    city: "",
    notes: "",
    timeSlot: "asap",
  });
  const [addressErrors, setAddressErrors] = useState({});

  const [payment, setPayment] = useState({
    method: "cod",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });
  const [paymentErrors, setPaymentErrors] = useState({});

  const [orderId, setOrderId] = useState(null);

  const validateAddress = () => {
    const e = {};
    if (!address.street.trim()) e.street = "Street address is required";
    if (!address.city.trim()) e.city = "City is required";
    return e;
  };

  const validatePayment = () => {
    const e = {};
    if (payment.method === "card") {
      if (!payment.cardNumber.replace(/\s/g, "").match(/^\d{16}$/)) e.cardNumber = "Enter a valid 16-digit card number";
      if (!payment.cardName.trim()) e.cardName = "Cardholder name is required";
      if (!payment.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = "Enter expiry as MM/YY";
      if (!payment.cvv.match(/^\d{3,4}$/)) e.cvv = "Enter a valid CVV";
    }
    return e;
  };

  const handleStep1 = () => {
    const errs = validateAddress();
    if (Object.keys(errs).length) { setAddressErrors(errs); return; }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    const errs = validatePayment();
    if (Object.keys(errs).length) { setPaymentErrors(errs); return; }

    setLoading(true);
    try {
      const orderData = {
        userId: currentUser.uid,
        userDisplayName: userProfile?.displayName || currentUser.email || "Guest",
        userEmail: currentUser.email,
        restaurantId: restaurantId || "",
        restaurantName: restaurantName || "Restaurant",
        items: items.map(({ id, name, price, quantity, imageUrl }) => ({
          id, name, price, quantity, imageUrl: imageUrl || "",
        })),
        subtotal,
        deliveryFee,
        tax,
        total,
        deliveryAddress: address,
        paymentMethod: payment.method,
        status: "pending",
        statusHistory: [{ status: "pending", timestamp: new Date().toISOString() }],
      };

      const id = await createDocument(COLLECTIONS.ORDERS, orderData);
      setOrderId(id);

      // Create notification
      await createDocument(COLLECTIONS.NOTIFICATIONS, {
        userId: currentUser.uid,
        title: "Order Placed!",
        message: `Your order from ${restaurantName || "our restaurant"} has been received.`,
        type: "order",
        orderId: id,
        read: false,
      });

      // Send email notification to admin via Web3Forms
      try {
        const formData = new FormData();
        formData.append("access_key", "6a452d69-eda5-4331-a32d-aee8dad7c00d");
        formData.append("subject", `New Order #${id.slice(-6).toUpperCase()} Received!`);
        formData.append("from_name", "Online Food Delivery Platform");
        formData.append("email", currentUser.email); 
        formData.append("replyto", currentUser.email); 
        
        const originUrl = window.location.origin;
        
        formData.append("message", `A new order has been placed by ${userProfile?.displayName || currentUser.email || "Guest"}!
        
----- ORDER DETAILS -----
Order ID: ${id}
Restaurant: ${restaurantName || "Restaurant"}
Payment Method: ${payment.method === "cod" ? "Cash on Delivery (COD)" : "Credit/Debit Card"}

----- ITEMS -----
${items.map(item => `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

----- BILLING BREAKDOWN -----
Subtotal: $${subtotal.toFixed(2)}
Delivery Fee: $${deliveryFee.toFixed(2)}
Tax: $${tax.toFixed(2)}
------------------------
TOTAL: $${total.toFixed(2)}
------------------------

----- CUSTOMER & DELIVERY INFO -----
Name: ${userProfile?.displayName || currentUser.email || "Guest"}
Email: ${currentUser.email}
Phone: ${userProfile?.phone || "Not provided"}

Address: ${address.street}, ${address.city}
Time Slot: ${address.timeSlot === 'asap' ? 'As soon as possible' : address.timeSlot + ' minutes'}
Delivery Instructions: ${address.notes || "None"}

----- ADMIN ACTIONS -----
View this order in Admin Dashboard: 
${originUrl}/admin/orders
`);

        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        }).catch(err => console.error("Web3Forms error:", err));
      } catch (emailErr) {
        console.error("Failed to send email notification", emailErr);
      }

      clearCart();
      setStep(3);
      toast.success("Order placed successfully!");
      window.scrollTo(0, 0);
    } catch (err) {
      toast.error("Failed to place order. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCard = (val) => val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  // ── Success screen ───────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={44} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">Order Confirmed!</h1>
        <p className="text-slate-500 mb-1 text-sm">Your order has been placed successfully.</p>
        <p className="text-xs text-slate-400 mb-8">
          Order ID: <span className="font-mono font-bold text-slate-600">#{orderId?.slice(-8).toUpperCase()}</span>
        </p>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-left mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Clock size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Estimated delivery</p>
              <p className="font-bold text-slate-800 text-sm">30–45 minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <MapPin size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Delivering to</p>
              <p className="font-bold text-slate-800 text-sm">{address.street}, {address.city}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(`/order/${orderId}`)}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            Track Order Live <ChevronRight size={16} />
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 border border-slate-200 text-slate-600 font-semibold rounded-2xl hover:bg-slate-50 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-black text-slate-800 mb-8">Checkout</h1>

      {/* Progress stepper */}
      <div className="flex items-center gap-2 mb-8">
        {["Delivery Address", "Payment"].map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                active ? "bg-orange-500 text-white" : done ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  active ? "bg-white text-orange-500" : done ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {done ? "✓" : n}
                </span>
                {label}
              </div>
              {i < 1 && <ChevronRight size={14} className="text-slate-300" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {/* ── Step 1: Address ── */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <MapPin size={18} className="text-orange-500" /> Delivery Address
              </h2>

              <Input
                label="Street Address"
                required
                placeholder="123 Main Street, Apt 4B"
                value={address.street}
                onChange={(e) => { setAddress((p) => ({ ...p, street: e.target.value })); setAddressErrors((p) => ({ ...p, street: "" })); }}
                error={addressErrors.street}
                icon={MapPin}
              />
              <Input
                label="City"
                required
                placeholder="Karachi"
                value={address.city}
                onChange={(e) => { setAddress((p) => ({ ...p, city: e.target.value })); setAddressErrors((p) => ({ ...p, city: "" })); }}
                error={addressErrors.city}
              />
              <Textarea
                label="Delivery Instructions (optional)"
                rows={3}
                placeholder="Gate code, floor number, landmark..."
                value={address.notes}
                onChange={(e) => setAddress((p) => ({ ...p, notes: e.target.value }))}
              />
              <Select
                label="Delivery Time"
                value={address.timeSlot}
                onChange={(e) => setAddress((p) => ({ ...p, timeSlot: e.target.value }))}
                options={TIME_SLOTS}
              />

              <button
                onClick={handleStep1}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                Continue to Payment <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <CreditCard size={18} className="text-orange-500" /> Payment Method
              </h2>

              {/* Method selector */}
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setPayment((p) => ({ ...p, method: id }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      payment.method === id
                        ? "border-orange-500 bg-orange-50"
                        : "border-slate-200 hover:border-orange-300"
                    }`}
                  >
                    <Icon size={22} className={payment.method === id ? "text-orange-500" : "text-slate-400"} />
                    <span className={`text-xs font-semibold ${payment.method === id ? "text-orange-600" : "text-slate-600"}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Card fields */}
              {payment.method === "card" && (
                <div className="space-y-4 pt-2">
                  <Input
                    label="Card Number"
                    required
                    placeholder="1234 5678 9012 3456"
                    value={payment.cardNumber}
                    onChange={(e) => setPayment((p) => ({ ...p, cardNumber: formatCard(e.target.value) }))}
                    error={paymentErrors.cardNumber}
                    maxLength={19}
                  />
                  <Input
                    label="Cardholder Name"
                    required
                    placeholder="John Doe"
                    value={payment.cardName}
                    onChange={(e) => setPayment((p) => ({ ...p, cardName: e.target.value }))}
                    error={paymentErrors.cardName}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry"
                      required
                      placeholder="MM/YY"
                      value={payment.expiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                        setPayment((p) => ({ ...p, expiry: v }));
                      }}
                      error={paymentErrors.expiry}
                      maxLength={5}
                    />
                    <Input
                      label="CVV"
                      required
                      placeholder="123"
                      value={payment.cvv}
                      onChange={(e) => setPayment((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                      error={paymentErrors.cvv}
                      maxLength={4}
                    />
                  </div>
                </div>
              )}

              {payment.method === "cod" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                  💵 Please have the exact amount ready. Our rider will collect payment upon delivery.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><ShoppingBag size={16} /> Place Order</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-fit">
          <h3 className="font-bold text-slate-800 mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-slate-600">
                <span className="truncate flex-1 mr-2">{item.name} × {item.quantity}</span>
                <span className="flex-shrink-0 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery</span><span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax</span><span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-800 text-base pt-1 border-t border-slate-100">
              <span>Total</span>
              <span className="text-orange-500">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
