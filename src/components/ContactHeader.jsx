import { useDispatch, useSelector } from "react-redux";
import {
  Handshake,
  Clock,
  Lock,
  Tag,
  Rocket,
  Flame,
  Hourglass,
  Signature,
  CircleUser,
  ArrowBigDown,
  Eye,
  EyeOff,
  ChevronLeft,
  Users,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import SocialButtons from "./SocialButtons";
import { useEffect, useState, useRef, useContext } from "react";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";
import NextPrev from "./NextPrev";
import { PageContext } from "../context/pageContext";
import {
  brandTimelineAction,
  getBrandTimeline,
} from "../store/Slices/brandTimeline";
import IconButton from "./ui/Buttons/IconButton";
import { getLadger } from "../store/Slices/ladger";
import { getOffers } from "../store/Slices/offers";
import { getDeals } from "../store/Slices/deals";
import { getOrders } from "../store/Slices/orders";

/* 🔥 Modern Hashtag Badge */
function HashTag({ text, color }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-md font-semibold bg-gradient-to-r ${color} text-white shadow-sm hover:scale-105 hover:shadow-md transition-all duration-200`}
    >
      #{text}
    </span>
  );
}

const ContactHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { showNextPrev, handleDateClick } = useContext(PageContext);

  const {
    contactInfo,
    contactLoading,
    stage,
    status,
    customer_type,
    hashtags,
  } = useSelector((state) => state.viewEmail);

  const { deals } = useSelector((state) => state.deals);

  const { showBrandTimeline, contacts = [] } = useSelector(
    (state) => state.brandTimeline,
  );

  const email = contactInfo?.email1;

  const [showSidebar, setShowSidebar] = useState(false);

  const goToDeal = () => navigate("/deals");

  const handleBrandTimeline = () => {
    dispatch(getLadger({ email: contactInfo?.email1, brand: !showBrandTimeline }))
    dispatch(getOffers({ email: contactInfo?.email1, brand: !showBrandTimeline }))
    dispatch(getDeals({ email: contactInfo?.email1, brand: !showBrandTimeline }))
    dispatch(getOrders({ email: contactInfo?.email1, brand: !showBrandTimeline }))
    if (showBrandTimeline) {
      dispatch(brandTimelineAction.setShowBrandTimeline(false));
    } else {
      dispatch(getBrandTimeline({ email }));
    }
  };

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
      value: contactInfo?.last_activity ?? "-",
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

  const isBrand = contactInfo?.type?.toLowerCase() === "brand";

  return (
    <div className="relative flex flex-col gap-4">
      {/* RIGHT MINI SIDEBAR */}
      {showBrandTimeline && (
        <div
          className={`absolute top-28 right-0 z-50 h-[75vh] transition-all duration-300 ${showSidebar ? "w-72" : "w-10"
            }`}
        >
          {/* Toggle */}
          <div
            onClick={() => setShowSidebar(!showSidebar)}
            className="absolute left-0 top-0 h-12 w-10 bg-blue-600 text-white flex items-center justify-center rounded-l-xl cursor-pointer shadow-lg"
          >
            {showSidebar ? <ChevronRight size={18} /> : <Users size={18} />}
          </div>

          {/* Content */}
          <div
            className={`ml-10 h-[300px] bg-white border border-gray-200 shadow-2xl rounded-l-2xl overflow-hidden ${showSidebar ? "block" : "hidden"
              }`}
          >
            <div className="p-4 border-b bg-blue-50 font-bold text-gray-700">
              Brand Contacts ({contacts?.length || 0})
            </div>

            <div className="overflow-y-auto h-full pb-20">
              {contacts?.length > 0 ? (
                contacts.map((item, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 border-b hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => handleDateClick({ email: item?.email1, navigate: "/", showNextPrev: false })}
                  >
                    <p className="font-semibold text-sm text-gray-800">
                      {item?.name || "No Name"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item?.email1}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-gray-500">
                  No contacts found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between w-full py-4 px-4 rounded-t-xl bg-gradient-to-r from-sky-600 via-cyan-500 to-cyan-400 text-white shadow-lg">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {!contactLoading && (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Link to={"/contacts/id"} className="text-lg font-extrabold">
                  {contactInfo?.full_name?.trim()
                    ? contactInfo.full_name
                    : email}
                </Link>

                {isBrand && (
                  <IconButton
                    icon={showBrandTimeline ? EyeOff : Eye}
                    label={
                      showBrandTimeline
                        ? "Hide Brand Timeline"
                        : "Show Brand Timeline"
                    }
                    onClick={handleBrandTimeline}
                  />
                )}
              </div>
            </div>
          )}

          <SocialButtons />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <div className="flex gap-2 flex-wrap">
            {hashtags?.map((tag) => (
              <HashTag
                key={tag.id}
                text={tag.name}
                color={
                  tag.type === "dynamic"
                    ? "from-emerald-500 to-teal-500"
                    : "from-amber-500 to-orange-500"
                }
              />
            ))}
          </div>

          {emailDeals?.length > 0 && (
            <div
              onClick={goToDeal}
              className="flex items-center gap-4 p-1 rounded-4xl bg-cyan-300 shadow-sm cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-4xl bg-blue-500">
                <Handshake size={20} className="text-white" />
              </div>

              <span className="text-lg font-bold text-slate-800">
                $<CountUpWithBlast value={maxDeal} />
              </span>
            </div>
          )}

          {showNextPrev && <NextPrev />}
        </div>
      </div>

      {/* STATUS */}
      {!contactLoading && (
        <div className="gap-3 p-2 flex flex-wrap items-center">
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
    <div className="flex items-start gap-3 rounded-xl p-3 bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all min-w-[150px]">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100">
        <Icon className="text-blue-500" size={18} />
      </div>

      <div className="flex flex-col">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </p>

        <p className="text-sm font-bold text-gray-800 mt-1">{value || "N/A"}</p>
      </div>
    </div>
  );
}
