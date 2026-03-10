import { LoadingAll, LoadingChase } from "./Loading";
import { useSelector } from "react-redux";
import {
  Mail,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Lock,
  Diameter,
  ArrowUpAz,
  Tag,
  TimerOffIcon,
  Rocket,
  Gamepad2Icon,
  Flame,
  TriangleDashed,
  Hourglass,
  User,
  Signature,
  CircleUser,
} from "lucide-react";
import { Link } from "react-router-dom";
import SocialButtons from "./SocialButtons";
import { useEffect, useState, useRef, useContext } from "react";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";
import NextPrev from "./NextPrev";
import { PageContext } from "../context/pageContext";

/* 🔥 Modern Hashtag Badge */
function HashTag({ text, color }) {
  return (
    <span
      className={`
      px-2.5 py-1 rounded-full text-xs font-semibold
      bg-gradient-to-r ${color}
      text-white shadow-sm
      hover:scale-105 hover:shadow-md
      transition-all duration-200
    `}
    >
      #{text}
    </span>
  );
}

const ContactHeader = ({ isMark }) => {
  const navigate = useNavigate();
  const goToDeal = () => {
    navigate("/deals");
  };

  const { email } = useSelector((state) => state.ladger);

  const { contactInfo, contactLoading, stage, status, customer_type } =
    useSelector((state) => state.viewEmail);

  const { welcomeHeaderContent } = useContext(PageContext);

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

          sessionStorage.setItem(storageKey, "true");

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
            String(d.dealamount || d.amount || "0").replace(/[^0-9.]/g, "")
          )
        )
      )
      : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between w-full">
        {/* LEFT SIDE */}
        <div
          className={`flex gap-4 ${contactLoading ? "items-center" : "item-start"
            }`}
        >
          {contactLoading && <LoadingChase size="30" color="blue" />}

          {!contactLoading && (
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-5">
                <div className="flex flex-col leading-tight gap-1">
                  {/* Name */}
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

                  {/* 🔥 Modern Hashtags */}

                </div>
              </div>
            </div>
          )}

          <SocialButtons />
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          {emailDeals?.length > 0 && (
            <div className="flex items-center">
              <div
                onClick={goToDeal}
                className="
                flex items-center gap-4
                p-2
                rounded-4xl
                bg-white
                border border-slate-200
                shadow-sm
                cursor-pointer
                hover:shadow-md
                hover:-translate-y-0.5
                transition-all
              "
              >
                <div className="flex items-center  justify-center w-9 h-9 rounded-4xl  bg-gradient-to-r from-violet-600 via-blue-500 to-violet-500
">
                  <Handshake size={22} className="text-white" />
                </div>

                <span className="text-xl font-semibold text-slate-900">
                  $<CountUpWithBlast value={maxDeal} />
                </span>
              </div>

            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            {contactInfo?.favorite === "1" && (
              <HashTag
                text="favorite"
                color="from-pink-500 to-rose-500"
              />
            )}

            {contactInfo?.exchange === "1" && (
              <HashTag
                text="linkexchange"
                color="from-blue-500 to-indigo-500"
              />
            )}

            {isMark && (
              <HashTag
                text="marketplace"
                color="from-violet-500 to-purple-500"
              />
            )}
          </div>

          {(welcomeHeaderContent === "Unreplied" ||
            welcomeHeaderContent === "") && <NextPrev />}
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
              label="Last Activity"
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
      <span className={`${color.icon} text-lg`}>
        <Icon />
      </span>

      <div>
        <p className={`text-xs font-medium ${color.label}`}>{label}</p>
        <p className={`font-semibold ${color.text}`}>{value || "N/A"}</p>
      </div>
    </div>
  );
}