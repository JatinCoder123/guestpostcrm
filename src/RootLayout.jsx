import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";
import { useContext, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { viewEmailAction } from "./store/Slices/viewEmail";
import { PageContext } from "./context/pageContext";
import DisplayIntro from "./components/DisplayIntro";
import Footer from "./components/Footer";
import { SocketContext } from "./context/SocketContext";
import { getDomain } from "./assets/assets";
import LowCreditWarning from "./components/LowCreditWarning";
import useRefresh from "./hooks/useRefresh";
import OnBoarding from "./components/OnBoarding";
import { useTimeline } from "./context/TimelineContext";
import toast from "react-hot-toast";
import { queryClient } from "./lib/queryClient";
import { motion } from "framer-motion";
import RefreshReminder from "./components/RefreshReminder";

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
        left: 0,
        behavior: "smooth",
      });
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
    return <DisplayIntro key="intro" />;
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
          <main
            ref={mainRef}
            className="
              min-h-0
              flex-1
              w-full
              overflow-y-auto
              hide-scrollbar
            "
          >
            <div className="w-full">
              {/* Low credit warning */}
              <LowCreditWarning
                open={showRechargeWarn}
                score={currentScore}
                onClose={() => setShowRechargeWarn(false)}
              />

              {/* Page content */}
              <div className="m-3">
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