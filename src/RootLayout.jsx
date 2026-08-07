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
import WelcomeHeader from "./components/WelcomeHeader";
import Footer from "./components/Footer";
import LowCreditWarning from "./components/LowCreditWarning";
import RefreshReminder from "./components/RefreshReminder";
import OnBoarding from "./components/OnBoarding";

import { getDomain } from "./assets/assets";
import useRefresh from "./hooks/useRefresh";
import toast from "react-hot-toast";
import { queryClient } from "./lib/queryClient";

const RootLayout = () => {
  const { message, error } = useSelector((state) => state.viewEmail);
  const { crmEndpoint, currentScore } = useSelector((state) => state.user);

  const {
    displayIntro,
    setActivePage,
    collapsed,
    showRefreshReminder, setShowRefreshReminder
  } = useContext(PageContext);

  const { setCrm } = useContext(SocketContext);

  useTimeline();
  useRefresh();

  const dispatch = useDispatch();

  const location = useLocation().pathname.split("/")[2];
  const pathname = useLocation().pathname;

  const mainRef = useRef(null);

  const [showRechargeWarn, setShowRechargeWarn] = useState(
    Number(currentScore) <= 0
  );


  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [pathname]);

  useEffect(() => {
    if (crmEndpoint) {
      setCrm(getDomain(crmEndpoint));
    }
  }, [crmEndpoint]);

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

  useEffect(() => {
    setActivePage(location);
  }, [location, setActivePage]);

  if (displayIntro) {
    return <DisplayIntro />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-hidden">

      <RefreshReminder />

      <motion.div
        animate={{
          paddingTop: showRefreshReminder ? 57 : 0,
        }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="min-h-screen"
      >
        <TopNav />

        <div className="flex h-[calc(100vh-100px)]">

          <div className="overflow-y-auto overflow-x-hidden custom-scrollbar">
            <Sidebar />
          </div>

          <main
            ref={mainRef}
            className={`flex-1 min-w-0 overflow-y-auto overflow-x-hidden hide-scrollbar transition-all duration-300 ${collapsed ? "ml-4" : "ml-0"
              }`}
          >
            <div
              className="p-3"
              data-tour="main-workspace"
            >
              <LowCreditWarning
                open={showRechargeWarn}
                score={currentScore}
                onClose={() =>
                  setShowRechargeWarn(false)
                }
              />

              <div className="p-3">
                <WelcomeHeader />
                <Outlet />
              </div>
            </div>

            <OnBoarding />

            <Footer />
          </main>
        </div>
      </motion.div>
    </div>
  );
};

export default RootLayout;