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
import { useContact } from "../queries/contact.queries";
import { useTimeline } from "../context/TimelineContext";
import { useDealsByEmail, useInfiniteDeals } from "../queries/deals.queries";
import he from "he";
import { useCrmUsers } from "../queries/users.queries";
import ActionButton from "./ActionButton";
import { useMailerSummary } from "../queries/mailerSummary.queries";
import { Titletooltip } from "./TitleTooltip";

/* 🔥 Modern Hashtag Badge */
function HashTag({ text, color }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${color} text-white`}
    >
      #{text}
    </span>
  );
}

const ContactHeader = () => {
  const sidebarRef = useRef(null);
  const { currentEmail } = useTimeline();
  const { data: users, isPending: loading } = useCrmUsers();

  const navigate = useNavigate();
  const { data, isPending } = useContact(currentEmail);
  const { data: summaryData, isPending: summaryLoading } =
    useMailerSummary(currentEmail);
  const contactInfo = data?.contact;
  const mailersSummary = summaryData?.mailers_summary;
  const hashtags = contactInfo?.hashtag?.data?.hashtags;
  const email = contactInfo?.email1;
  const { showNextPrev, handleDateClick } = useContext(PageContext);
  const { data: dealsData } = useDealsByEmail(currentEmail);
  const emailDeals = dealsData?.data ?? [];
  const { showBrandTimeline, contacts = [] } = useSelector(
    (state) => state.brandTimeline,
  );
  const [showSidebar, setShowSidebar] = useState(false);

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
    { Icon: Rocket, label: "Stage", value: data?.stage },
    { Icon: Hourglass, label: "Status", value: data?.status },
    { Icon: Lock, label: "Category", value: data?.customer_type },
    {
      Icon: ArrowBigDown,
      label: "Direction",
      value: contactInfo?.direction ?? "-",
    },
    {
      Icon: Flame,
      label: "Assign To",
      value:
        users?.find((user) => user.id === contactInfo?.gpc_assigned_to)?.name ||
        "Unassigned",
    },
    {
      Icon: Signature,
      label: "Last Activity",
      value: contactInfo?.last_activity ?? "-",
    },
    {
      Icon: CircleUser,
      label: "Last Activity By",
      value: contactInfo?.last_user ?? "-",
    },
    {
      Icon: Clock,
      label: "Last Updated At",
      value: contactInfo?.last_activity_date ?? "-",
    },
  ];
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowSidebar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const isBrand = contactInfo?.type?.toLowerCase() === "brand";

  return (
    <div className="relative flex flex-col gap-4">
      {/* RIGHT MINI SIDEBAR */}
      {showBrandTimeline && (
        <div
          ref={sidebarRef}
          className={`absolute top-28 right-0 z-50 h-[75vh] transition-all duration-300 ${showSidebar ? "w-72" : "w-10"}`}
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
            className={`ml-10 h-[300px] bg-white border border-gray-200 shadow-2xl rounded-l-2xl overflow-hidden ${
              showSidebar ? "block" : "hidden"
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
                    onClick={() =>
                      handleDateClick({
                        email: item?.email1,
                        navigate: "/",
                        showNextPrev: false,
                      })
                    }
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
      <div className="w-full bg-white border border-sky-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center min-h-[86px]">
          {/* LEFT */}
          <div className="flex items-center gap-4 px-5 py-1 min-w-[360px]">
            {!isPending && (
              <>
                <img
                  src={"Rectangle.png"}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/contacts?email=${currentEmail ?? ""}`}
                      className="text-[18px] font-semibold text-gray-900 hover:text-blue-600 mt-3"
                      title={he.decode(
                        contactInfo?.full_name?.trim()
                          ? contactInfo.full_name
                          : (email ?? ""),
                      )}
                    >
                      {(() => {
                        const text = he.decode(
                          contactInfo?.full_name?.trim()
                            ? contactInfo.full_name
                            : (email ?? ""),
                        );

                        return text.length > 8
                          ? `${text.slice(0, 9)}...`
                          : text;
                      })()}
                    </Link>

                    <SocialButtons
                      displayCount={contactInfo?.duplicate_threads ?? 0}
                      trust_score={contactInfo?.trust_score}
                    />
                  </div>

                  <div className="flex gap-2 mb-1 flex-wrap">
                    {/* Mobile */}
                    <div className="flex gap-2 flex-wrap lg:hidden">
                      {hashtags?.slice(0, 2).map((tag) => (
                        <HashTag
                          key={tag.id}
                          text={tag.name}
                          color="bg-gradient-to-r from-search-primary to-search-secondary"
                        />
                      ))}

                      {hashtags?.length > 1 && (
                        <button
                          className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200"
                          onClick={() => setShowAllTags(true)}
                        >
                          ...
                        </button>
                      )}
                    </div>

                    {/* Desktop */}
                    <div className="hidden lg:flex gap-2 flex-wrap mt-1">
                      {hashtags?.map((tag) => (
                        <HashTag
                          key={tag.id}
                          text={tag.name}
                          color="bg-gradient-to-r from-search-primary to-search-secondary"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="w-px h-12 bg-gray-200" />

          <div className="px-6 min-w-[180px]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">
              CREATED AT
            </p>

            <p className="text-[15px] font-semibold text-gray-900 mt-1">
              {summaryLoading
                ? "Loading..."
                : mailersSummary?.date_entered_formatted || "N/A"}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {mailersSummary?.date_entered || ""}
            </p>
          </div>

          <div className="w-px h-12 bg-gray-200" />

          <div className="px-6 min-w-[200px]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">
              SUBJECT
            </p>

            <Titletooltip content={mailersSummary?.subject || "No Subject"}>
              <p className="text-[15px] font-semibold text-gray-900 mt-1 truncate max-w-[230px]">
                {summaryLoading
                  ? "Loading..."
                  : mailersSummary?.subject || "No Subject"}
              </p>
            </Titletooltip>
          </div>

          <div className="w-px h-12 bg-gray-200" />

          <div className="px-6 min-w-[180px]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">
              MOTIVE
            </p>

            <Titletooltip content={mailersSummary?.correct_motive || "N/A"}>
              <p className="text-[15px] font-semibold text-gray-900 mt-1 truncate max-w-[200px]">
                {summaryLoading
                  ? "Loading..."
                  : mailersSummary?.correct_motive || "N/A"}
              </p>
            </Titletooltip>
          </div>

          <div className="ml-auto flex items-center gap-3 px-5">
            {emailDeals?.length > 0 && (
              <div
                onClick={() => navigate("/deals")}
                className="flex items-center gap-3 rounded-full bg-slate-100 px-3 py-1.5 cursor-pointer hover:bg-slate-200 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Handshake size={16} className="text-white" />
                </div>

                <span className="font-semibold text-gray-900">
                  $<CountUpWithBlast value={maxDeal} email={email} />
                </span>
              </div>
            )}

            {showNextPrev && <NextPrev />}
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 xl:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)] gap-4 h-[200px]">
        {/* STATUS */}
        {!isPending && (
          <div className="gap-2 p-2 flex flex-wrap items-center  bg-white border border-sky-200 rounded-xl shadow-sm overflow-hidden">
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
        <div className="relative z-40 w-full bg-white border border-sky-200 rounded-xl shadow-sm overflow-visible">
          <ActionButton />
        </div>
      </div>
    </div>
  );
};

export default ContactHeader;

function StatusCard({ Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl p-3 bg-background border-gray-200 shadow-sm hover:shadow-md transition-all min-w-[100px]">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100">
        <Icon className="text-blue-500" size={18} />
      </div>

      <div className="flex flex-col">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </p>

        <p className="text-sm font-semibold text-black-800 mt-1">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}
