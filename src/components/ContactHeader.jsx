import { LoadingAll, LoadingChase } from "./Loading";
import { useSelector } from "react-redux";
import { Mail, ChevronLeft, ChevronRight, Handshake, Lock, Diameter, ArrowUpAz, Tag, TimerOffIcon, Rocket, Gamepad2Icon, Flame, TriangleDashed, Hourglass, User, Signature, CircleUser } from "lucide-react";
import { Link } from "react-router-dom";
import SocialButtons from "./SocialButtons";
import { useEffect, useState, useRef, useContext } from "react";
import confetti from "canvas-confetti";
// start
import { useNavigate } from "react-router-dom";
import NextPrev from "./NextPrev";
import { PageContext } from "../context/pageContext";

const ContactHeader = () => {
  const navigate = useNavigate();
  const goToDeal = () => {
    navigate("/deals");
  };
  const { email } = useSelector((state) => state.ladger);
  const { contactInfo, contactLoading, stage, status, customer_type, } =
    useSelector((state) => state.viewEmail);
  const { enteredEmail, search, welcomeHeaderContent } = useContext(PageContext)


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


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between w-full">
        {/* LEFT SIDE CONTENT */}
        <div
          className={`flex  gap-4 ${contactLoading ? "items-center" : "item-start"
            }`}
        >
          {contactLoading && <LoadingChase size="30" color="blue" />}
          {!contactLoading && (
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-5">
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
                </div>
              </div>

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
          {(welcomeHeaderContent == "Unreplied" || welcomeHeaderContent == "") && <NextPrev />
          }
        </div>

      </div>
      {/* STATUS GRID */}

      <div>
        {!contactLoading && (
          <div className="flex flex-wrap gap-3">
            <StatusCard
              Icon={Tag}
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
              Icon={Rocket}
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
              Icon={Hourglass}
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
              Icon={Lock}
              label="Category"
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
                Icon={Tag}
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
            <StatusCard
              Icon={TriangleDashed}
              label="Direction"
              value={contactInfo?.direction ?? "-"}
              color={{
                bg: "bg-cyan-50",
                border: "border-cyan-200",
                icon: "text-cyan-600",
                label: "text-cyan-500",
                text: "text-cyan-700",
              }}
            />
            <StatusCard
              Icon={Flame}
              label="Assign To"
              value={contactInfo?.gpc_assigned_to ?? "-"}
              color={{
                bg: "bg-indigo-50",
                border: "border-indigo-200",
                icon: "text-indigo-600",
                label: "text-indigo-500",
                text: "text-indigo-700",
              }}
            />
            <StatusCard
              Icon={Signature}
              label="Last Activity "
              value={contactInfo?.last_activity ?? "GPC"}
              color={{
                bg: "bg-yellow-50",
                border: "border-yellow-200",
                icon: "text-yellow-600",
                label: "text-yellow-500",
                text: "text-yellow-700",
              }}
            />
            <StatusCard
              Icon={CircleUser}
              label="Last Activity By"
              value={contactInfo?.last_user ?? "GPC User"}
              color={{
                bg: "bg-pink-50",
                border: "border-pink-200",
                icon: "text-pink-600",
                label: "text-pink-500",
                text: "text-pink-700",
              }}
            />
          </div>
        )}
      </div>
    </div>

  );
};

export default ContactHeader;

function StatusCard({ Icon, label, value, color }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${color.bg} border ${color.border}`}
    >
      <span className={`${color.icon} text-lg`}><Icon /></span>
      <div>
        <p className={`text-xs font-medium ${color.label}`}>{label}</p>
        <p className={`font-semibold ${color.text}`}>{value || "N/A"}</p>
      </div>
    </div>
  );
}
