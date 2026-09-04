import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";
import { useContext, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";

import { viewEmailAction } from "./store/Slices/viewEmail";
import { PageContext } from "./context/pageContext";
import { SocketContext } from "./context/SocketContext";
import { useTimeline } from "./context/TimelineContext";

import DisplayIntro from "./components/DisplayIntro";
import Footer from "./components/Footer";
import LowCreditWarning from "./components/LowCreditWarning";
import RefreshReminder from "./components/RefreshReminder";
import OnBoarding from "./components/OnBoarding";

import { getDomain } from "./assets/assets";
import useRefresh from "./hooks/useRefresh";
import toast from "react-hot-toast";
import { queryClient } from "./lib/queryClient";

const RootLayout = () => {
  const { message, error } = useSelector(
    (state) => state.viewEmail
  );

  const {
    crmEndpoint,
    currentScore,
  } = useSelector((state) => state.user);

  const {
    displayIntro,
    setActivePage,
    collapsed,
    showRefreshReminder,
  } = useContext(PageContext);

  const [showRechargeWarn, setShowRechargeWarn] = useState(
    Number(currentScore) <= 0
  );

  const { setCrm } = useContext(SocketContext);

  useTimeline();
  useRefresh();

  const dispatch = useDispatch();
  const location = useLocation();

  const pathname = location.pathname;
  const activePage = pathname.split("/")[2];

  const mainRef = useRef(null);

  /* -------------------------------------------------------
   * Scroll main content to top when route changes
   * ----------------------------------------------------- */
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      /* Smooth scrolling can be interrupted mid-flight, which would leave a
         horizontal offset behind. Pin the inline axis synchronously. */
      mainRef.current.scrollLeft = 0;
    }
  }, [pathname]);

  /* -------------------------------------------------------
   * Set CRM endpoint
   * ----------------------------------------------------- */
  useEffect(() => {
    if (crmEndpoint) {
      setCrm(getDomain(crmEndpoint));
    }
  }, [crmEndpoint, setCrm]);

  /* -------------------------------------------------------
   * Toast messages
   * ----------------------------------------------------- */
  useEffect(() => {
    if (message) {
      dispatch(viewEmailAction.clearAllMessage());

      toast.success(message, {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });

      queryClient.invalidateQueries({
        queryKey: ["emails"],
      });

      queryClient.invalidateQueries({
        queryKey: ["threads"],
      });
    }

    if (error) {
      dispatch(viewEmailAction.clearAllErrors());

      toast.error(error, {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  }, [message, error, dispatch]);

  /* -------------------------------------------------------
   * Active sidebar page
   * ----------------------------------------------------- */
  useEffect(() => {
    setActivePage(activePage);
  }, [activePage, setActivePage]);

  /* -------------------------------------------------------
   * Intro screen
   * ----------------------------------------------------- */
  if (displayIntro) {
    return <DisplayIntro />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Refresh reminder */}
      <RefreshReminder />

      {/* Main application wrapper */}
      <motion.div
        animate={{
          paddingTop: showRefreshReminder ? 60 : 0,
        }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex min-h-0 w-full flex-1"
      >
        {/* =====================================================
            LEFT SIDEBAR
        ====================================================== */}
        <Sidebar />

        {/* =====================================================
            RIGHT CONTENT
        ====================================================== */}
        <div
          className={`
            flex
            min-w-0
            flex-1
            flex-col
            overflow-hidden
            p-2
          `}
        >
          {/* Top Navigation */}
          <TopNav />

          {/* ===================================================
              MAIN CONTENT
          ==================================================== */}
          {/*
            overflow-x-hidden is deliberate and load-bearing.

            With only `overflow-y-auto`, CSS computes the other axis from
            `visible` to `auto`, so this element silently becomes a HORIZONTAL
            scroll container too — and `hide-scrollbar` hides the scrollbar
            that would reveal it. Any transient overflow (a hover/highlight
            `scale-*`, a popover, a wide bar) then lets `main` be scrolled
            inline by a stray focus/scrollIntoView/touch drag, and because
            scrollLeft is only reset on route change the page stays offset —
            content flush left with dead space on the right until reload.

            Pinning overflow-x makes that state unreachable. Wide content
            (tables etc.) already carries its own overflow-x-auto wrapper.
          */}
          <main
            ref={mainRef}
            className="
        min-h-0
        flex-1
        w-full
        overflow-y-auto
        overflow-x-hidden
        hide-scrollbar
    "
          >
            <div className="flex min-h-full w-full flex-col">

              {/* Low credit warning */}

              <LowCreditWarning
                open={showRechargeWarn}
                score={currentScore}
                onClose={() => setShowRechargeWarn(false)}
              />

              {/* Page content */}

              <div className="m-3 flex min-h-0 flex-1 flex-col">
                <Outlet />
              </div>

            </div>
          </main>

          {/* ===================================================
              BOTTOM
          ==================================================== */}
          <OnBoarding />

          <Footer />
        </div>
      </motion.div>
    </div>
  );
};

export default RootLayout;