import { useSelector } from "react-redux";
import {
  Handshake,
  Clock,
  Lock,
  Tag,
  Rocket,
  Flame,
  Hourglass,
  User,
  Signature,
  CircleUser,
  ArrowBigDown,
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
      px-2.5 py-1 rounded-full text-md font-semibold
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
  const { contactInfo, contactLoading, stage, status, customer_type } =
    useSelector((state) => state.viewEmail);
  const email = contactInfo?.email1;
  const { showNextPrev } = useContext(PageContext);

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
              String(d.dealamount || d.amount || "0").replace(/[^0-9.]/g, ""),
            ),
          ),
        )
      : 0;
  const statusItems = [
    { Icon: Tag, label: "Type", value: contactInfo?.type },
    { Icon: Rocket, label: "Stage", value: stage },
    { Icon: Hourglass, label: "Status", value: status },
    { Icon: Lock, label: "Category", value: customer_type },
    ...(contactInfo?.moved_label
      ? [{ Icon: Tag, label: "Email Label", value: contactInfo.moved_label }]
      : []),
    {
      Icon: ArrowBigDown,
      label: "Direction",
      value: contactInfo?.direction ?? "-",
    },
    {
      Icon: Flame,
      label: "Assign To",
      value: contactInfo?.gpc_assigned_to ?? "-",
    },
    {
      Icon: Signature,
      label: "Last Activity",
      value: contactInfo?.last_activity ?? "GPC",
    },
    {
      Icon: CircleUser,
      label: "Last Activity By",
      value:
        useSelector((state) => state.crmUser.currentUser?.name) ?? "GPC User",
    },
    {
      Icon: Clock,
      label: "Last Updated At",
      value: contactInfo?.last_activity_date ?? "-",
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div
        className="
    flex items-center justify-between w-full
    py-4 px-4
    rounded-t-xl
    bg-gradient-to-r from-sky-600 via-cyan-500 to-cyan-400 
    text-white
    shadow-lg
  "
      >
        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">
          {!contactLoading && (
            <div className="flex flex-col">
              {/* Name */}
              <div className="flex items-center gap-2">
                <Link to={"/contacts/id"} className="text-lg font-extrabold">
                  {contactInfo?.full_name?.trim()
                    ? contactInfo.full_name
                    : email}
                </Link>
              </div>
            </div>
          )}
          <SocialButtons />
        </div>

        {/* RIGHT SIDE (UNCHANGED) */}
        <div className="flex items-center gap-3">
          {emailDeals?.length > 0 && (
            <div className="flex items-center">
              <div
                onClick={goToDeal}
                className="
                flex items-center gap-4
                p-1
                rounded-4xl
                bg-cyan-300
                shadow-sm
                cursor-pointer
                hover:shadow-md
                hover:-translate-y-0.5
                transition-all
              "
              >
                <div
                  className="flex items-center  justify-center w-8 h-8 rounded-4xl  bg-blue-500
"
                >
                  <Handshake size={20} className="text-white" />
                </div>

                <span className="text-lg font-bold text-slate-800">
                  $<CountUpWithBlast value={maxDeal} />
                </span>
              </div>
            </div>
          )}

          {/* TAGS */}
          <div className="flex gap-2 flex-wrap">
            {contactInfo?.favorite === "1" && (
              <HashTag text="favorite" color="from-pink-500 to-rose-500" />
            )}

            {contactInfo?.exchange === "1" && (
              <HashTag
                text="linkexchange"
                color="from-blue-500 to-indigo-500"
              />
            )}

            {contactInfo?.is_stop === "1" && (
              <HashTag text="stop" color="from-red-500 to-rose-500" />
            )}

            {isMark && (
              <HashTag
                text="marketplace"
                color="from-violet-500 to-purple-500"
              />
            )}
          </div>

          {showNextPrev && <NextPrev />}
        </div>
      </div>

      {/* STATUS GRID */}

      {!contactLoading && (
        <div className=" gap-3 p-2 flex flex-wrap items-center ">
          {statusItems.map((item, index) => (
            <StatusCard
              key={index}
              Icon={item.Icon}
              label={item.label}
              value={item.value}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactHeader;

function StatusCard({ Icon, label, value }) {
  return (
    <div
      className="
        flex items-start gap-3
        rounded-xl p-3
        bg-gray-50
        border border-gray-200
        shadow-sm
        hover:shadow-md
        transition-all duration-200
        min-w-[150px]
      "
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100">
        <Icon className="text-blue-500" size={18} />
      </div>

      {/* Content */}
      <div className="flex flex-col">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </p>

        <p className="text-sm font-bold text-gray-800 mt-1">{value || "N/A"}</p>
      </div>
    </div>
  );
}
