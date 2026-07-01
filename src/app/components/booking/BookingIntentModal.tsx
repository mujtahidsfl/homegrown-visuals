import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router";
import { PACKAGE_DISPLAY, PACKAGE_ROUTE_MAP, type PackageKey } from "../../booking/config";

type BookingIntentModalProps = {
  packageKey: PackageKey | null;
  onClose: () => void;
};

export function BookingIntentModal({ packageKey, onClose }: BookingIntentModalProps) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>({});

  useEffect(() => {
    if (!packageKey) return;
    const name = localStorage.getItem("hgv_lead_name") ?? "";
    const savedEmail = localStorage.getItem("hgv_lead_email") ?? "";
    setFullName(name);
    setEmail(savedEmail);
  }, [packageKey]);

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!packageKey) return null;

  const validate = () => {
    const next: { fullName?: string; email?: string } = {};
    if (!fullName.trim()) next.fullName = "Full name is required";
    if (!email.trim()) next.email = "Email is required";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    localStorage.setItem("hgv_lead_name", fullName.trim());
    localStorage.setItem("hgv_lead_email", email.trim());
    navigate(PACKAGE_ROUTE_MAP[packageKey]);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      <button
        className="absolute inset-0 bg-[#0f1d2f]/55 backdrop-blur-[2px]"
        aria-label="Close popup"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[520px] bg-[#ffffff] border border-[#d9d0c4] rounded-[20px] shadow-[0_28px_80px_rgba(15,29,47,0.35)] p-6 sm:p-8">
        <button
          type="button"
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-[#1F3A5F]/20 flex items-center justify-center text-[#1F3A5F] hover:bg-[#1F3A5F]/5"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <p
          className="text-[#2FA4A9] text-[12px] tracking-[0.16em] uppercase"
          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
        >
          {PACKAGE_DISPLAY[packageKey].name}
        </p>
        <h3
          className="text-[#1F3A5F] text-[34px] mt-3"
          style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600, lineHeight: 1.15 }}
        >
          Let's get you booked
        </h3>
        <p
          className="text-[#40506b] text-[16px] mt-3"
          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.6 }}
        >
          We just need two things to get started.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="text-[#1F3A5F] text-[13px] block mb-1.5"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-12 rounded-[12px] border border-[#d8dfea] px-4 text-[#1F3A5F] outline-none focus:border-[#2FA4A9]"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
            />
            {errors.fullName && <p className="text-[#c44848] text-[12px] mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label
              className="text-[#1F3A5F] text-[13px] block mb-1.5"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 rounded-[12px] border border-[#d8dfea] px-4 text-[#1F3A5F] outline-none focus:border-[#2FA4A9]"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
            />
            {errors.email && <p className="text-[#c44848] text-[12px] mt-1">{errors.email}</p>}
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-full bg-[#1F3A5F] text-white hover:bg-[#162a45] transition-colors"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700, letterSpacing: "0.02em" }}
          >
            Continue to Book →
          </button>
          <p
            className="text-center text-[#5a677f] text-[13px]"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
          >
            No payment required now
          </p>
        </form>
      </div>
    </div>
  );
}

