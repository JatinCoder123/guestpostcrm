import { useSelector } from "react-redux";
import {
  Search,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
  Minimize2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import LadgerCard from "./LadgerCard";
import { useInfiniteLedger } from "../queries/ledger.queries";
import { useTimeline } from "../context/TimelineContext";

const TimelineEvent = ({ handleMessageClick }) => {
  const { currentEmail } = useTimeline()
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteLedger(currentEmail);
  const ladger = useMemo(
    () => data?.pages?.flatMap((page) => page.data || []) ?? [],
    [data]
  );


  const loading = isPending || isFetchingNextPage;
  const { showBrandTimeline } = useSelector(
    (state) => state.brandTimeline
  );

  const selectedView = "important";

  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const [showScrollButtons, setShowScrollButtons] =
    useState(false);

  const topRef = useRef(null);
  const headerRef = useRef(null);
  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);

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

  const visibleTimelineData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return timelineData;

    return timelineData.filter((item) =>
      [item?.description, item?.type_c, item?.date_entered, item?.parent_type]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [searchQuery, timelineData]);

  useEffect(() => {
    if (!isExpanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsExpanded(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isExpanded]);

  // Preserve scroll position on ledger load
  useEffect(() => {
    const scrollParent = scrollContainerRef.current;

    if (!scrollParent) return;

    scrollParent.scrollTop =
      previousScrollTop.current;
  }, [timelineData]);

  // Track scroll position
  useEffect(() => {
    const scrollParent = scrollContainerRef.current;

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
    const scrollParent = scrollContainerRef.current;

    if (!scrollParent || !bottomRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {

        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
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
    const scrollParent = scrollContainerRef.current;

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
    <div
      className={`h-full min-h-0 bg-white transition-all duration-300 ${isExpanded
        ? "fixed inset-0 z-[9998] flex flex-col p-4 sm:p-7"
        : "relative"
        }`}
      role={isExpanded ? "dialog" : undefined}
      aria-modal={isExpanded ? "true" : undefined}
    >
      <div ref={topRef} className="flex h-full min-h-0 flex-col">
        <div ref={headerRef} className="flex items-center justify-between px-3 pb-3 pt-4 sm:px-6 sm:pt-5">
          <h1 className="text-base font-medium text-blue-600">
            {showBrandTimeline && "Brand "}Timeline
          </h1>
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            title={isExpanded ? "Exit enlarged timeline" : "Enlarge timeline"}
            aria-label={isExpanded ? "Exit enlarged timeline" : "Enlarge timeline"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {isExpanded ? <Minimize2 size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="px-3 sm:px-6">
          <div className="relative flex h-8 items-center rounded-full border border-gray-300 bg-white pl-3 pr-[72px] shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
            <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search anything..."
              className="min-w-0 flex-1 bg-transparent px-3 text-xs text-gray-700 outline-none"
            />

            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                }}
                className="mr-1 text-gray-400 transition hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <span className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-4 py-1 text-[10px] font-medium text-white">
              Search
            </span>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="mx-3 mb-3 mt-4 min-h-0 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white sm:mx-6"
        >
          <LadgerCard
            timelineData={visibleTimelineData}
            handleMessageClick={handleMessageClick}
          />

          {isFetchingNextPage && <TimelineSkeleton />}
          {visibleTimelineData.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-gray-500">No matching timeline activities.</p>
          )}
          <div ref={bottomRef} className="flex min-h-14 items-center justify-center px-4 py-3">
            {hasNextPage && (
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-blue-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
              >
                {isFetchingNextPage ? "Loading activities..." : "Load more activities"}
                {!isFetchingNextPage && <ArrowDown className="ml-1 inline h-3 w-3" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Scroll Buttons */}
      {!isExpanded && timelineData?.length > 8 && (
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
