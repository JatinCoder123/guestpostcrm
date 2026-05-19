import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";
import { useContext, useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { viewEmailAction } from "./store/Slices/viewEmail";
import { PageContext } from "./context/pageContext";
import DisplayIntro from "./components/DisplayIntro";
import WelcomeHeader from "./components/WelcomeHeader";
import Footer from "./components/Footer";
import { SocketContext } from "./context/SocketContext";
import { getDomain } from "./assets/assets";
import LowCreditWarning from "./components/LowCreditWarning";
import { toast } from "react-toastify";
import useRefresh from "./hooks/useRefresh";
import { unrepliedAction } from "./store/Slices/unrepliedEmails";
const RootLayout = () => {
  const [showAvatar, setShowAvatar] = useState(true);
  const { message, error } = useSelector((state) => state.viewEmail);
  const { crmEndpoint, currentScore } = useSelector((state) => state.user);
  const {
    displayIntro,
    setActivePage,
    collapsed,
  } = useContext(PageContext);
  const { currentAvatar, setCrm } = useContext(SocketContext);
  useRefresh();
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
    if (message) {
      dispatch(viewEmailAction.clearAllMessage());
      toast.success(message);
    }
    if (error) {
      dispatch(viewEmailAction.clearAllErrors());
      toast.error(error);
    }
  }, [message, error]);

  // Set active page based on URL
  useEffect(() => {
    setActivePage(location);
  }, [location, setActivePage]);
  const isLowCredit = Number(currentScore) <= 0;
  if (displayIntro) {
    return <DisplayIntro key="intro" />;
  }
  return (
    <div className="min-h-screen bg-[#F8FAFC] ">
      <TopNav setShowAvatar={setShowAvatar} />
      <div className="flex h-[calc(100vh-100px)] ">
        <div className="overflow-y-auto overflow-x-hidden custom-scrollbar">
          <Sidebar />
        </div>
        <main
          ref={mainRef}
          className={`flex-1 min-w-0 overflow-y-auto overflow-x-hidden hide-scrollbar transition-all duration-300 ${collapsed ? "ml-4" : "ml-0"
            }`}
        >
          <div className="p-3">
            {isLowCredit && <LowCreditWarning score={currentScore} />}
            <div className="p-3">
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
    </div>
  );
};

export default RootLayout;
