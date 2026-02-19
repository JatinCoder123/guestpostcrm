import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";
import { useContext, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { viewEmailAction, } from "./store/Slices/viewEmail";
import { PageContext } from "./context/pageContext";
import DisplayIntro from "./components/DisplayIntro";
import { AnimatePresence } from "framer-motion";
import WelcomeHeader from "./components/WelcomeHeader";
import Footer from "./components/Footer";
import { SocketContext } from "./context/SocketContext";
import Avatar from "./components/Avatar";
import ErrorBoundary from "./components/ErrorBoundary";
import { getDomain } from "./assets/assets";
import LowCreditWarning from "./components/LowCreditWarning";
import { toast } from "react-toastify";
import useRefresh from "./hooks/useRefresh";
const RootLayout = () => {
  const [showAvatar, setShowAvatar] = useState(true);
  const { message } = useSelector((state) => state.viewEmail);
  const { crmEndpoint, currentScore } = useSelector((state) => state.user);
  const {
    displayIntro,
    setActivePage,
    collapsed,
  } = useContext(PageContext);
  const { currentAvatar, setCrm, setNotificationCount } =
    useContext(SocketContext);
  useRefresh()
  const dispatch = useDispatch();
  const location = useLocation().pathname.split("/")[2];
  const pathname = useLocation().pathname;
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [pathname]);
  useEffect(() => {
    if (crmEndpoint) {
      setCrm(getDomain(crmEndpoint));
    }
  }, [crmEndpoint]);
  // Show avatar when new avatar arrives
  useEffect(() => {
    setShowAvatar(true);
  }, [currentAvatar]);
  useEffect(() => {
    setNotificationCount((prev) => ({
      ...prev,
      refreshUnreplied: Date.now(),
    }));
    toast.success(message)
    dispatch(viewEmailAction.clearAllMessage())
  }, [message]);

  // Set active page based on URL
  useEffect(() => {
    setActivePage(location);
  }, [location, setActivePage]);

  // Initial data fetch when timeline or email changes

  const isLowCredit = Number(currentScore) <= 0;

  return (
    <AnimatePresence mode="wait">
      {displayIntro ? (
        <DisplayIntro key="intro" />
      ) : (
        <ErrorBoundary>
          <div className="min-h-screen bg-[#F8FAFC] ">
            <TopNav setShowAvatar={setShowAvatar} />
            <div className="flex h-[calc(100vh-100px)] ">
              {/* Sidebar scrolls independently */}
              <div className="overflow-y-auto overflow-x-hidden custom-scrollbar">
                <Sidebar />
              </div>

              {/* Main content scrolls independently */}
              <main
                ref={mainRef}
                className={`flex-1 overflow-y-auto hide-scrollbar transition-all duration-300 ${collapsed ? "ml-4" : "ml-0"
                  }`}
              >
                <div className="p-6">
                  {isLowCredit && <LowCreditWarning score={currentScore} />}
                  <div className="p-6">
                    <WelcomeHeader />
                    <Outlet />
                  </div>

                  {/* {showAvatar && currentAvatar && (
                  <Avatar
                    setShowAvatar={setShowAvatar}
                    avatarUrl={currentAvatar?.url}
                    mute={currentAvatar}
                  />
                )} */}
                </div>
                <Footer />
              </main>
            </div>

            {/* <div className="fixed bottom-1 right-2 cursor-pointer">
            <img
              width="80"
              height="80"
              src="https://img.icons8.com/3d-fluency/94/whatsapp-logo.png"
              alt="whatsapp-logo"
            />
          </div> */}
          </div>
        </ErrorBoundary>
      )}
    </AnimatePresence>
  );
};

export default RootLayout;
