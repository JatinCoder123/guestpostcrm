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
      title={`#${text}`}
      className={`max-w-[110px] shrink-0 truncate rounded-full px-2.5 py-1 text-xs font-medium sm:max-w-[140px] sm:px-3 ${color} text-white`}
    >
      #{text}
    </span>
  );
}
function getInitials(name) {
  if (!name) return "?";

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();
}
const ContactHeader = () => {
  const sidebarRef = useRef(null);
  const { currentEmail } = useTimeline();
  const { data: users, isPending: loading } = useCrmUsers();

  const navigate = useNavigate();
  const { data, isPending } = useContact(currentEmail);

  const contactInfo = data?.contact;
  const hashtags = contactInfo?.hashtag?.data?.hashtags;
  const email = contactInfo?.email1;
  const threadId = contactInfo?.thread_id;
  const { data: summaryData, isPending: summaryLoading } = useMailerSummary({ email, threadId });
  const mailersSummary = summaryData?.mailers_summary;

  const { showNextPrev, handleDateClick } = useContext(PageContext);
  const { data: dealsData } = useDealsByEmail(currentEmail);
  const emailDeals = dealsData?.data ?? [];
  const { showBrandTimeline, contacts = [] } = useSelector(
    (state) => state.brandTimeline,
  );
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    setShowAllTags(false);
  }, [currentEmail]);

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
          className={`absolute top-28 right-0 z-30 h-[75vh] transition-all duration-300 ${showSidebar ? "w-72" : "w-10"
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
        <div className="flex min-h-[86px] flex-col divide-y divide-gray-100 2xl:flex-row 2xl:flex-nowrap 2xl:items-center 2xl:divide-y-0">
          {/* ROW 1 (small screens): IDENTITY + NAV — becomes part of the single row at 2xl */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-3 2xl:contents">
            {/* LEFT */}
            <div className="flex min-w-0 basis-full items-center gap-3 sm:basis-auto sm:flex-1 2xl:order-1 2xl:w-[420px] 2xl:flex-none 2xl:basis-auto 2xl:px-5 2xl:py-3">
            {!isPending && (
              <>
                <div
                  className="
    flex
    h-12
    w-12
    shrink-0
    items-center
    justify-center
    border
    border-border
    rounded-full
    bg-background
    text-sm
    font-semibold
    text-primary
    uppercase
  "
                >
                  {getInitials(
                    contactInfo?.full_name?.trim() ||
                    email ||
                    "?"
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-hidden">
                    <Link
                      to={`/entity/contacts/${currentEmail}`}
                      className="min-w-0 shrink truncate text-[15px] font-semibold text-gray-900 hover:text-blue-600 sm:text-[18px]"
                      title={he.decode(
                        contactInfo?.full_name?.trim()
                          ? contactInfo.full_name
                          : (email ?? ""),
                      )}
                    >
                      {he.decode(
                        contactInfo?.full_name?.trim()
                          ? contactInfo.full_name
                          : (email ?? ""),
                      )}
                    </Link>

                    <SocialButtons
                      displayCount={contactInfo?.duplicate_threads ?? 0}
                      trust_score={contactInfo?.trust_score}
                    />
                  </div>

                  <div className="mt-1 flex max-w-full min-w-0 flex-wrap items-center gap-2">
                    {(showAllTags ? hashtags : hashtags?.slice(0, 2))?.map((tag) => (
                      <HashTag
                        key={tag.id}
                        text={tag.name}
                        color="bg-gradient-to-r from-search-primary to-search-secondary"
                      />
                    ))}

                    {hashtags?.length > 2 && (
                      <button
                        type="button"
                        className="shrink-0 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-300"
                        onClick={() => setShowAllTags((visible) => !visible)}
                        aria-expanded={showAllTags}
                      >
                        {showAllTags ? "Show less" : "..."}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
            </div>

            {/* NAV / DEAL — sits next to the avatar on small screens, far right at 2xl */}
            {(emailDeals?.length > 0 || showNextPrev) && (
              <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto 2xl:order-4 2xl:ml-auto 2xl:w-auto 2xl:gap-3 2xl:px-5 2xl:py-3">
                {emailDeals?.length > 0 && (
                  <div
                    onClick={() => navigate(`/deals/view?email=${currentEmail}`)}
                    className="flex min-w-0 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1.5 transition hover:bg-slate-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Handshake size={16} className="text-white" />
                    </div>

                    <span className="truncate text-sm font-semibold text-gray-900">
                      $<CountUpWithBlast value={maxDeal} email={email} />
                    </span>
                  </div>
                )}

                {showNextPrev && <NextPrev />}
              </div>
            )}
          </div>

          <div className="hidden h-12 w-px bg-gray-200 2xl:order-2 2xl:block" />

          {/* SUMMARY ROW */}
          <div className="grid min-w-0 grid-cols-2 items-start gap-x-4 gap-y-3 px-3 py-3 md:flex md:flex-nowrap md:items-center md:gap-0 2xl:order-3 2xl:flex-1 2xl:px-0">

            <div className="min-w-0 max-sm:col-span-2 md:flex-1 md:px-4 2xl:min-w-[150px] 2xl:px-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary sm:text-[12px]">
                CREATED AT
              </p>

              <p className="mt-1 truncate text-[12px] font-semibold text-gray-900">
                {summaryLoading
                  ? "Loading..."
                  : mailersSummary?.date_entered_formatted || "N/A"}
              </p>

              <p className="mt-1 truncate text-xs text-gray-500">
                {mailersSummary?.date_entered || ""}
              </p>
            </div>

            <div className="hidden h-12 w-px shrink-0 bg-gray-200 md:block" />

            <div className="min-w-0 md:flex-[1.3] md:px-4 2xl:min-w-[170px] 2xl:px-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary sm:text-[12px]">
                SUBJECT
              </p>

              <Titletooltip content={mailersSummary?.subject || "No Subject"}>
                <p className="mt-1 truncate text-[12px] font-semibold text-gray-900">
                  {summaryLoading
                    ? "Loading..."
                    : mailersSummary?.subject || "No Subject"}
                </p>
              </Titletooltip>
            </div>

            <div className="hidden h-12 w-px shrink-0 bg-gray-200 md:block" />

            <div className="min-w-0 md:flex-1 md:px-4 2xl:min-w-[150px] 2xl:px-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary sm:text-[12px]">
                MOTIVE
              </p>

              <Titletooltip content={mailersSummary?.correct_motive || "N/A"}>
                <p className="mt-1 truncate text-[12px] font-semibold text-gray-900">
                  {summaryLoading
                    ? "Loading..."
                    : mailersSummary?.correct_motive || "N/A"}
                </p>
              </Titletooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 xl:min-h-[200px] xl:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)]">
        {/* STATUS */}
        {!isPending && (
          <div className="flex flex-wrap items-stretch gap-2 overflow-hidden rounded-xl border border-sky-200 bg-white p-2 shadow-sm xl:items-center">
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
    <div className="flex min-w-0 flex-1 basis-[160px] items-start gap-3 rounded-xl border-gray-200 bg-background p-3 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100">
        <Icon className="text-primary" size={18} />
      </div>

      <div className="flex min-w-0 flex-col">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-black-800">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}
