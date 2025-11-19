import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";
import { useContext, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getLadger, getLadgerEmail } from "./store/Slices/ladger";
import { getUnansweredEmails } from "./store/Slices/unansweredEmails";
import { getUnrepliedEmail } from "./store/Slices/unrepliedEmails";
import { getOrders } from "./store/Slices/orders";
import { getDeals } from "./store/Slices/deals";
import { getInvoices } from "./store/Slices/invoices";
import { getOffers } from "./store/Slices/offers";
import { getDetection } from "./store/Slices/detection";
import { getViewEmail } from "./store/Slices/viewEmail";
import { getAiCredits } from "./store/Slices/aiCredits";
import { PageContext } from "./context/pageContext";
import DisplayIntro from "./components/DisplayIntro";
import { AnimatePresence } from "framer-motion";
import WelcomeHeader from "./components/WelcomeHeader";
import Footer from "./components/Footer";
import Pagination from "./components/Pagination";
import Avatar from "./components/Avatar";
const RootLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const { timeline } = useSelector((state) => state.ladger);
  const { displayIntro, setActivePage, enteredEmail } = useContext(PageContext);
  const location = useLocation().pathname.split("/")[2];
  useEffect(() => {
    setActivePage(location);
  }, [location]);
  const dispatch = useDispatch();
  useEffect(() => {
    enteredEmail
      ? dispatch(getLadgerEmail(enteredEmail))
      : dispatch(getLadger());
    dispatch(getAiCredits(timeline));
    dispatch(getUnansweredEmails(timeline, enteredEmail));
    dispatch(getUnrepliedEmail(timeline, enteredEmail));
    dispatch(getOrders(timeline, enteredEmail));
    dispatch(getDeals(timeline, enteredEmail));
    dispatch(getInvoices(timeline, enteredEmail));
    dispatch(getOffers(timeline, enteredEmail));
    dispatch(getDetection(timeline, enteredEmail));
    dispatch(getViewEmail(enteredEmail));
  }, [enteredEmail, timeline]);

  return (
    <AnimatePresence mode="wait">
      {displayIntro ? (
        <DisplayIntro key="intro" />
      ) : (
        <div className="min-h-screen bg-[#F8FAFC]">
          <TopNav setShowAvatar={setShowAvatar} />
          <div className="flex h-[calc(100vh-100px)]">
            {/* Sidebar scrolls independently */}
            <div className="overflow-y-auto overflow-x-hidden custom-scrollbar">
              <Sidebar
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </div>

            {/* Main content scrolls independently */}
            <main
              className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-300 ${
                sidebarCollapsed ? "ml-4" : "ml-0"
              }`}
            >
              <div className="p-6">
                <WelcomeHeader />
                <Outlet />
                {showAvatar && <Avatar />}
              </div>
              <Footer />
            </main>
          </div>

          <div className="fixed bottom-1 right-2 cursor-pointer">
            <img
              width="80"
              height="80"
              src="https://img.icons8.com/3d-fluency/94/whatsapp-logo.png"
              alt="whatsapp-logo"
            />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RootLayout;
