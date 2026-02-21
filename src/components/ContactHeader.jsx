import { LoadingAll, LoadingChase } from "./Loading";
import { useSelector } from "react-redux";
import { Mail, ChevronLeft, ChevronRight, Handshake } from "lucide-react";
import { Link } from "react-router-dom";
import SocialButtons from "./SocialButtons";
import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
// start
import { useNavigate } from "react-router-dom";

const ContactHeader = ({ onPrev, onNext, currentIndex, setShowEmails }) => {
  const navigate = useNavigate();
  const goToDeal = () => {
    navigate("/deals");
  };
  const { email } = useSelector((state) => state.ladger);
  const { contactInfo, contactLoading, stage, status, customer_type, count } =
    useSelector((state) => state.viewEmail);

  const { deals } = useSelector((state) => state.deals);

  const CountUpWithBlast = ({ value, email }) => {
    const storageKey = `maxDealAnimated_${email}`;
    const hasAnimatedBefore = sessionStorage.getItem(storageKey);

    const [count, setCount] = useState(hasAnimatedBefore ? value : 0);

    const hasBlasted = useRef(false);
    const amountRef = useRef(null);

    useEffect(() => {
      if (hasAnimatedBefore) return;

      const duration = 900;
      const startTime = performance.now();

      const animate = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const current = Math.floor(progress * value);
        setCount(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else if (!hasBlasted.current && amountRef.current) {
          hasBlasted.current = true;

          // ✅ mark animation as done
          sessionStorage.setItem(storageKey, "true");

          // 🎯 confetti only on amount
          const rect = amountRef.current.getBoundingClientRect();
          const x = (rect.left + rect.width / 2) / window.innerWidth;
          const y = (rect.top + rect.height / 2) / window.innerHeight;

          confetti({
            particleCount: 28,
            spread: 40,
            startVelocity: 16,
            gravity: 0.9,
            origin: { x, y },
            colors: ["#0f172a", "#2563eb"],
          });
        }
      };

      requestAnimationFrame(animate);
    }, [value, email, hasAnimatedBefore]);

    return <span ref={amountRef}>{count.toLocaleString()}</span>;
  };

  const emailDeals = deals?.filter((d) => {
    const dealEmail = (
      d.email ||
      d.contact_email ||
      d.email1 ||
      ""
    ).toLowerCase();

    return email && dealEmail === email;
  });

  const maxDeal =
    emailDeals?.length > 0
      ? Math.max(
          ...emailDeals.map((d) =>
            Number(
              String(d.dealamount || d.amount || "0").replace(/[^0-9.]/g, ""),
            ),
          ),
        )
      : 0;
  // end

  const { emails } = useSelector((state) => state.unreplied);

  return (
    <div className="flex items-start justify-between w-full">
      {/* LEFT SIDE CONTENT */}
      <div
        className={`flex  gap-4 ${
          contactLoading ? "items-center" : "item-start"
        }`}
      >
        {contactLoading && <LoadingChase size="30" color="blue" />}
        {!contactLoading && (
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-5">
  {/* Inbox Button */}
  <button
    onClick={() => setShowEmails(true)}
    className="relative rounded-xl bg-white border border-gray-200 shadow-md
               hover:shadow-lg hover:-translate-y-1 active:scale-95
               transition-all flex items-center justify-center"
  >
    <img
      src="https://img.icons8.com/keek/100/new-post.png"
      alt="new-post"
      className="w-12 h-12"
    />
    {count > 0 && (
      <span className="absolute -top-2 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
        {count}
      </span>
    )}
  </button>

  {/* Name + Email */}
  <div className="flex flex-col leading-tight">
    <Link
      to="/contacts"
      className="
        relative text-lg font-extrabold
        bg-gradient-to-r from-violet-600 via-blue-500 to-pink-500
        bg-[length:300%_100%] bg-clip-text text-transparent
        animate-[gradientMove_4s_linear_infinite]
      "
    >
      {contactInfo?.full_name?.trim()
        ? contactInfo.full_name
        : email}
    </Link>

    {/* Email sub text */}
    {contactInfo?.full_name && (
      <span className="text-sm text-gray-500 truncate max-w-[220px]">
        {email}
      </span>
    )}
  </div>

  {/* Verified Badge */}
  {contactInfo?.customer_type === "verified" && (
    <img
      src="https://img.icons8.com/bubbles/100/verified-account.png"
      alt="verified"
      className="w-7 h-7"
    />
  )}
</div>
            {/* STATUS GRID */}
            {!contactLoading && (
              <div className="flex flex-wrap gap-3">
                <StatusCard
                  icon="🏷️"
                  label="Type"
                  value={contactInfo?.type}
                  color={{
                    bg: "bg-violet-50",
                    border: "border-violet-200",
                    icon: "text-violet-600",
                    label: "text-violet-500",
                    text: "text-violet-700",
                  }}
                />

                <StatusCard
                  icon="🚀"
                  label="Stage"
                  value={stage}
                  color={{
                    bg: "bg-blue-50",
                    border: "border-blue-200",
                    icon: "text-blue-600",
                    label: "text-blue-500",
                    text: "text-blue-700",
                  }}
                />

                <StatusCard
                  icon="⏳"
                  label="Status"
                  value={status}
                  color={{
                    bg: "bg-amber-50",
                    border: "border-amber-200",
                    icon: "text-amber-600",
                    label: "text-amber-500",
                    text: "text-amber-700",
                  }}
                />

                <StatusCard
                  icon="🔒"
                  label="Customer Type"
                  value={customer_type}
                  color={{
                    bg: "bg-rose-50",
                    border: "border-rose-200",
                    icon: "text-rose-600",
                    label: "text-rose-500",
                    text: "text-rose-700",
                  }}
                />

                {contactInfo?.moved_label && (
                  <StatusCard
                    icon="🏷️"
                    label="Email Label"
                    value={contactInfo.moved_label}
                    color={{
                      bg: "bg-emerald-50",
                      border: "border-emerald-200",
                      icon: "text-emerald-600",
                      label: "text-emerald-500",
                      text: "text-emerald-700",
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}
        <SocialButtons />
      </div>

      {/* 🔘 PREV + NEXT BUTTONS */}
      <div className="flex items-center gap-3">
        {/* start by kjl */}
        {emailDeals?.length > 0 && (
          <div className="flex items-center">
            <div
              onClick={goToDeal}
              className="
        flex items-center gap-4
        p-2
        rounded-xl
        bg-white
        border border-slate-200
        shadow-sm
        cursor-pointer
        hover:shadow-md
        hover:-translate-y-0.5
        transition-all
      "
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-slate-900">
                <Handshake size={22} className="text-white" />
              </div>

              <span className="text-2xl font-semibold text-slate-900">
                $<CountUpWithBlast value={maxDeal} />
              </span>
            </div>
          </div>
        )}
        {/* end by kjl */}

        {/* PREV BUTTON (Disable if index is 0) */}
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className={`p-2 rounded-lg border bg-white shadow-sm active:scale-95 transition
                        ${
                          currentIndex === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }
                    `}
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* NEXT BUTTON (Disable if last email) */}
        <button
          onClick={onNext}
          disabled={currentIndex === emails?.length - 1}
          className={`p-2 rounded-lg border bg-white shadow-sm active:scale-95 transition
                        ${
                          currentIndex === emails?.length - 1
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }
                    `}
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default ContactHeader;

function StatusCard({ icon, label, value, color }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${color.bg} border ${color.border}`}
    >
      <span className={`${color.icon} text-lg`}>{icon}</span>
      <div>
        <p className={`text-xs font-medium ${color.label}`}>{label}</p>
        <p className={`font-semibold ${color.text}`}>{value || "N/A"}</p>
      </div>
    </div>
  );
}
