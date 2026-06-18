import { useSelector } from "react-redux";
import {
  Search,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import LadgerCard from "./LadgerCard";
import { useInfiniteLedger } from "../queries/ledger.queries";
import { useTimeline } from "../context/TimelineContext";

const TimelineEvent = ({ handleMessageClick }) => {
  const { currentEmail } = useTimeline()
  const { showBrandTimeline } = useSelector(state => state.brandTimeline)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteLedger(currentEmail, showBrandTimeline);
  const ladger =
    data?.pages?.flatMap(
      (page) => page.data || []
    ) ?? [];
  const pages = data?.pages ?? [];

  const lastPage = pages[pages.length - 1] ?? {};
  const firstPage = pages[0] ?? {};


  const loading = isPending || isFetchingNextPage;

  const [selectedView, setSelectedView] =
    useState("important");

  const [searchQuery, setSearchQuery] = useState("");

  const [showScrollButtons, setShowScrollButtons] =
    useState(false);

  const topRef = useRef(null);
  const headerRef = useRef(null);
  const bottomRef = useRef(null);

  // Prevent scroll jumping when ledger updates
  const previousScrollTop = useRef(0);

  // Timeline Data
  const timelineData = useMemo(() => {
    if (!ladger) return [];

    if (selectedView === "all") {
      return ladger;
    }

    if (selectedView === "important") {
      return ladger.filter(
        (item) =>
          !(
            item.parent_type === "outr_snts" &&
            item.type_c !== "First Reply Sent" &&
            item.type_c !== "First Reply Scheduled"
          )
      );
    }

    if (selectedView === "orderMain") {
      return ladger.filter(
        (item) =>
          item.parent_type === "outr_order_gp_li" ||
          item.parent_type ===
          "outr_paypal_invoice_links"
      );
    }

    return ladger;
  }, [selectedView, ladger]);

  // Preserve scroll position on ledger load
  useEffect(() => {
    const scrollParent = document.querySelector(
      ".hide-scrollbar"
    );

    if (!scrollParent) return;

    scrollParent.scrollTop =
      previousScrollTop.current;
  }, [timelineData]);

  // Track scroll position
  useEffect(() => {
    const scrollParent = document.querySelector(
      ".hide-scrollbar"
    );

    if (!scrollParent) return;

    const handleScroll = () => {
      previousScrollTop.current =
        scrollParent.scrollTop;
    };

    scrollParent.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      scrollParent.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);
  useEffect(() => {
    const scrollParent = document.querySelector(".hide-scrollbar");

    if (!scrollParent || !bottomRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {

        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          console.log("Fetching next page");
          fetchNextPage();
        }
      },
      {
        root: scrollParent,
        rootMargin: "300px",
        threshold: 0,
      }
    );

    observer.observe(bottomRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  useEffect(() => {
    const header = headerRef.current;

    if (!header) return;

    let scrollParent = header.parentElement;

    while (
      scrollParent &&
      !/(auto|scroll|overlay)/.test(
        getComputedStyle(scrollParent).overflowY
      )
    ) {
      scrollParent = scrollParent.parentElement;
    }

    const update = () => {
      const view =
        scrollParent?.getBoundingClientRect() ?? {
          top: 0,
          bottom: window.innerHeight,
        };

      const headerBottom =
        header.getBoundingClientRect().bottom;

      const bottomTop =
        bottomRef.current?.getBoundingClientRect()
          .top ?? Infinity;

      setShowScrollButtons(
        headerBottom < view.top &&
        bottomTop > view.bottom - 40
      );
    };

    const target = scrollParent ?? window;

    update();

    target.addEventListener("scroll", update, {
      passive: true,
    });

    window.addEventListener("resize", update);

    return () => {
      target.removeEventListener(
        "scroll",
        update
      );

      window.removeEventListener(
        "resize",
        update
      );
    };
  }, []);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToBottom = () => {
    const scrollParent = document.querySelector(
      ".hide-scrollbar"
    );

    if (!scrollParent) return;

    scrollParent.scrollTo({
      top: scrollParent.scrollHeight,
      behavior: "smooth",
    });
  };

  if (!loading && (!ladger || ladger.length === 0)) {
    return (
      <div className="py-[2%] px-[30%]">
        <h1
          className="
            font-mono text-2xl
            bg-gradient-to-r from-purple-600 to-blue-600
            p-2 rounded-2xl text-center text-white
          "
        >
          {showBrandTimeline && "BRAND "}
          TIMELINE
        </h1>

        <p
          className="
            text-gray-700 text-sm text-center
            leading-relaxed mt-2
          "
        >
          No timeline events found.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={topRef}
        className="py-[2%] px-[30%]"
      >
        <h1
          ref={headerRef}
          onClick={scrollToTop}
          className="
            font-mono text-2xl
            bg-gradient-to-r from-purple-600 to-blue-600
            p-2 rounded-2xl text-center text-white
            cursor-pointer hover:opacity-90
            transition-opacity
          "
        >
          {showBrandTimeline && "BRAND "}
          TIMELINE
        </h1>

        {/* Search */}
        <div className="flex justify-center mt-6">
          <div className="relative w-[360px]">
            <div
              className="
                relative flex items-center
                bg-white rounded-full shadow-md
                border border-gray-300 p-4
              "
            >
              <Search className="w-4 h-4" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search timeline..."
                className="
                  flex-1 px-3 bg-transparent
                  focus:outline-none text-sm
                "
              />

              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  className="
                    text-gray-400
                    hover:text-gray-600
                    transition
                  "
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cards */}
        <LadgerCard
          timelineData={timelineData}
          handleMessageClick={handleMessageClick}
        />


        {isFetchingNextPage && <TimelineSkeleton />}

        <div ref={bottomRef} className="h-10 w-full" />
      </div>

      {/* Floating Scroll Buttons */}
      {timelineData?.length > 8 && (
        <div
          className={`
            fixed right-4 top-1/2 -translate-y-1/2
            flex flex-col gap-3 z-50
            transition-all duration-300 ease-out
            ${showScrollButtons
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 translate-x-4 pointer-events-none"
            }
          `}
        >
          {/* Top */}
          <button
            onClick={scrollToTop}
            title="Go to top"
            className="
              w-8 h-8 rounded-full
              bg-gradient-to-r from-purple-600 to-blue-600
              text-white shadow-xl
              flex items-center justify-center
              hover:scale-110
              transition-all duration-300
            "
          >
            <ArrowUp
              size={16}
              strokeWidth={2.5}
            />
          </button>

          {/* Bottom */}
          <button
            onClick={scrollToBottom}
            title="Go to bottom"
            className="
              w-8 h-8 rounded-full
              bg-gradient-to-r from-blue-600 to-purple-600
              text-white shadow-xl
              flex items-center justify-center
              hover:scale-110
              transition-all duration-300
            "
          >
            <ArrowDown
              size={16}
              strokeWidth={2.5}
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default TimelineEvent;
const TimelineSkeleton = () => (
  <div className="mt-6 space-y-6">
    {[1, 2, 3].map((item) => (
      <div
        key={item}
        className="flex gap-4 animate-pulse"
      >
        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />

        <div className="flex-1">
          <div className="h-14 bg-gray-200 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);