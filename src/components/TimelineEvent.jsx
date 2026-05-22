import { useDispatch, useSelector } from "react-redux";
import {
  Eye,
  SparkleIcon,
  FileText,
  MessageSquare,
  Search,
  Cross,
  Workflow,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { getLadger } from "../store/Slices/ladger";
import Pagination from "./Pagination";
import LadgerCard from "./LadgerCard";
const TimelineEvent = ({ handleMessageClick }) => {
  const { ladger, email, pageCount, pageIndex, loading } = useSelector(
    (state) => state.ladger,
  );
  const { showBrandTimeline } = useSelector((state) => state.brandTimeline);
  const { contactInfo } = useSelector((state) => state.viewEmail);
  const dispatch = useDispatch();
  const [selectedView, setSelectedView] = useState("important");

  const [timelineData, setTimelineData] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const topRef = useRef(null);
  const headerRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    // Walk up to the nearest scrollable ancestor (app scrolls inside <main>, not window)
    let scrollParent = header.parentElement;
    while (
      scrollParent &&
      !/(auto|scroll|overlay)/.test(getComputedStyle(scrollParent).overflowY)
    ) {
      scrollParent = scrollParent.parentElement;
    }

    const update = () => {
      const view = scrollParent?.getBoundingClientRect() ?? {
        top: 0,
        bottom: window.innerHeight,
      };
      const headerBottom = header.getBoundingClientRect().bottom;
      const bottomTop =
        bottomRef.current?.getBoundingClientRect().top ?? Infinity;
      setShowScrollButtons(
        headerBottom < view.top && bottomTop > view.bottom - 40,
      );
    };

    const target = scrollParent ?? window;
    update();
    target.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      target.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [timelineData]);
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };
  useEffect(() => {
    if (!ladger) return;

    if (selectedView === "all") {
      setTimelineData(ladger);
    } else if (selectedView === "important") {
      const finalData = ladger.filter(
        (item) =>
          !(
            item.parent_type === "outr_snts" &&
            item.type_c !== "First Reply Sent" &&
            item.type_c !== "First Reply Scheduled"
          ),
      );
      setTimelineData(finalData);
    } else if (selectedView === "orderMain") {
      const finalData = ladger.filter(
        (item) =>
          item.parent_type === "outr_order_gp_li" ||
          item.parent_type === "outr_paypal_invoice_links",
      );
      setTimelineData(finalData);
    }
  }, [selectedView, ladger]);

  const navigateTo = useNavigate();

  const getContactIdFromEvent = (event) => {
    if (event.contact_id) {
      return event.contact_id;
    }

    if (event.module === "Contacts" && event.parent_id) {
      return event.parent_id;
    }

    if (event.parent_type === "Contacts" && event.parent_id) {
      return event.parent_id;
    }

    if (event.description || event.subject) {
      const text = (event.description || event.subject).toLowerCase();
      const idMatch = text.match(/id[: ]\s*(\d+)/i);
      if (idMatch) {
        return idMatch[1];
      }
    }

    return null;
  };

  const getReminderFilterType = (eventType) => {
    if (!eventType) return "";

    const type = eventType.toLowerCase();

    const mappings = {
      reply: "Before_Reply_Reminder",
      offer: "Before_Offer_Reminder",
      deal: "Deal_Reminder",
      order: "Order_Reminder",
      invoice: "Invoice_Reminder",
      payment: "Payment_Reminder",
      follow: "Followup_Reminder",
    };

    for (const key in mappings) {
      if (type.includes(key)) {
        return mappings[key];
      }
    }

    return eventType
      .replace(/scheduled|reminder/gi, "")
      .trim()
      .replace(/\s+/g, "_");
  };



  const scrollToTop = () => {
    topRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  if (!loading && (!ladger || ladger.length === 0)) {
    return (
      <div className="py-[2%] px-[30%] ">
        <h1 className="font-mono text-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-2xl text-center text-white">
          {showBrandTimeline && "BRAND "} TIMELINE
        </h1>
        <p className="text-gray-700 text-sm text-center leading-relaxed mt-2">
          No timeline events found.
        </p>
      </div>
    );
  }
  return (
    <div className="relative">
      <div ref={topRef} className="py-[2%] px-[30%]">
        <h1
          ref={headerRef}
          onClick={scrollToTop}
          className="font-mono text-2xl bg-gradient-to-r from-purple-600 to-blue-600 
             p-2 rounded-2xl text-center text-white
             cursor-pointer hover:opacity-90 transition-opacity"
        >
          {showBrandTimeline && "BRAND "}TIMELINE
        </h1>

        <div className="flex justify-center mt-6">
          <div className="relative w-[360px]">
            {/* 🔍 SEARCH MODE */}
            {isSearchOpen ? (
              <div className="relative flex items-center bg-white rounded-full shadow-md border border-gray-300 p-4">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search timeline..."
                  className="flex-1 px-3 bg-transparent focus:outline-none text-sm"
                />

                {/* ❌ CLOSE SEARCH */}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div className="relative flex items-center bg-gray-100 rounded-full p-1 shadow-inner w-[360px]">
                {/* 🔍 Search icon (outside pill area) */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-purple-600 transition z-10"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Tabs wrapper (pill only moves here) */}
                <div className="relative flex flex-1 items-center">
                  {/* Sliding pill */}
                  <motion.div
                    layout
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    className={`absolute top-1 left-1 h-[calc(100%-8px)]
        w-[calc(33.333%-4px)]
        rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-md
        ${selectedView === "all"
                        ? "translate-x-0"
                        : selectedView === "important"
                          ? "translate-x-full"
                          : "translate-x-[200%]"
                      }`}
                  />

                  {[
                    { key: "all", label: "All" },
                    { key: "important", label: "Important" },
                    { key: "orderMain", label: "Orders" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedView(tab.key)}
                      className={`relative z-10 flex-1 py-4 text-sm font-semibold rounded-full
          transition-colors duration-300
          ${selectedView === tab.key
                          ? "text-white"
                          : "text-gray-600 hover:text-purple-600"
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <LadgerCard timelineData={timelineData} handleMessageClick={handleMessageClick} />
      </div>

      {timelineData?.length > 8 && (
        <div
          className={`fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50
            transition-all duration-300 ease-out
            ${showScrollButtons
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 translate-x-4 pointer-events-none"
            }`}
        >
          {/* Go to Top */}
          <button
            onClick={scrollToTop}
            title="Go to top"
            className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 
                 text-white shadow-xl flex items-center justify-center 
                 hover:scale-110 transition-all duration-300"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>

          {/* Go to Bottom */}
          <button
            onClick={scrollToBottom}
            title="Go to bottom"
            className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 
                 text-white shadow-xl flex items-center justify-center 
                 hover:scale-110 transition-all duration-300"
          >
            <ArrowDown size={16} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TimelineEvent;
