import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import toast from "react-hot-toast";

const SUBJECT_OPTIONS = [
  { value: "", label: "Select a topic" },
  { value: "order", label: "Order Issue" },
  { value: "restaurant", label: "Restaurant Partner" },
  { value: "delivery", label: "Delivery Problem" },
  { value: "account", label: "Account Help" },
  { value: "other", label: "Other" },
];

const CONTACT_INFO = [
  { icon: Mail, label: "Email", value: "hello@foodrush.pk", href: "mailto:hello@foodrush.pk" },
  { icon: Phone, label: "Phone", value: "+92 300 123 4567", href: "tel:+923001234567" },
  { icon: MapPin, label: "Office", value: "123 Food Street, Karachi, Pakistan", href: null },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.subject) e.subject = "Please select a topic";
    if (!form.message.trim() || form.message.length < 10) e.message = "Message must be at least 10 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    // Simulate form submission
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
    toast.success("Message sent! We'll respond within 24 hours.");
  };

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black mb-3">Contact <span className="text-orange-400">Us</span></h1>
        <p className="text-slate-300 text-sm max-w-md mx-auto">
          Have a question, feedback, or need help? We're here 24/7.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Get in Touch</h2>
            {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
                  {href ? (
                    <a href={href} className="text-sm font-semibold text-slate-700 hover:text-orange-500 transition-colors">
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-slate-700">{value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="bg-orange-500 rounded-2xl p-5 text-white mt-4">
              <h3 className="font-bold mb-2">Support Hours</h3>
              <div className="space-y-1 text-sm text-orange-100">
                <div className="flex justify-between">
                  <span>Mon – Fri</span><span>9 AM – 11 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Weekends</span><span>10 AM – 10 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle size={56} className="text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Message Sent!</h3>
                <p className="text-slate-500 text-sm max-w-sm mb-6">
                  Thanks for reaching out. Our support team will get back to you within 24 hours.
                </p>
                <Button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }} variant="outline">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-lg font-bold text-slate-800 mb-1">Send a Message</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Your Name"
                    required
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange("name")}
                    error={errors.name}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange("email")}
                    error={errors.email}
                  />
                </div>

                <Select
                  label="Topic"
                  required
                  value={form.subject}
                  onChange={handleChange("subject")}
                  options={SUBJECT_OPTIONS}
                  error={errors.subject}
                />

                <Textarea
                  label="Message"
                  required
                  rows={5}
                  placeholder="Describe your question or issue..."
                  value={form.message}
                  onChange={handleChange("message")}
                  error={errors.message}
                />

                <Button type="submit" loading={loading} icon={Send} fullWidth size="lg">
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
