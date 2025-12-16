import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";
import { useContext, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getLadger, getLadgerEmail, getLadgerWithOutLoading } from "./store/Slices/ladger";
import {
  getUnansweredEmails,
  getUnansweredEmailWithOutLoading,
} from "./store/Slices/unansweredEmails";
import {
  getUnrepliedEmail,
  getUnrepliedEmailWithOutLoading,
} from "./store/Slices/unrepliedEmails";
import { getOrders } from "./store/Slices/orders";
import { getDeals } from "./store/Slices/deals";
import { getInvoices } from "./store/Slices/invoices";
import { getOffers } from "./store/Slices/offers";
import { getDetection } from "./store/Slices/detection";
import { getContact, getViewEmail } from "./store/Slices/viewEmail";
import { getAiCredits } from "./store/Slices/aiCredits";
import { PageContext } from "./context/pageContext";
import DisplayIntro from "./components/DisplayIntro";
import { AnimatePresence } from "framer-motion";
import WelcomeHeader from "./components/WelcomeHeader";
import Footer from "./components/Footer";
import Avatar from "./components/Avatar";
import { getOrderRem } from "./store/Slices/orderRem";
import { getForwardedEmails } from "./store/Slices/forwardedEmailSlice";
import { getFavEmails } from "./store/Slices/favEmailSlice";
import { getLinkExchange } from "./store/Slices/linkExchange";
import { getBulkEmails } from "./store/Slices/markBulkSlice";
import { getAllAvatar } from "./store/Slices/avatarSlice";

import { getdefaulterEmails } from "./store/Slices/defaulterEmails";
import { getmovedEmails } from "./store/Slices/movedEmails";
import { SocketContext } from "./context/SocketContext";
import { hotAction } from "./store/Slices/hotSlice";
import { eventActions } from "./store/Slices/eventSlice";
const RootLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);
  const { timeline, email } = useSelector((state) => state.ladger);
  const { emails } = useSelector((state) => state.unreplied);
  const {
    displayIntro,
    setActivePage,
    enteredEmail,
    currentIndex,
    setCurrentIndex,
  } = useContext(PageContext);
  const { currentAvatar, notificationCount, setNotificationCount } =
    useContext(SocketContext);
  useEffect(() => {
    setShowAvatar(true);
  }, [currentAvatar]);
  const location = useLocation().pathname.split("/")[2];
  useEffect(() => {
    setActivePage(location);
  }, [location]);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAiCredits(timeline));
    dispatch(getUnansweredEmails(timeline, enteredEmail));
    dispatch(getUnrepliedEmail(timeline, enteredEmail));
    dispatch(getForwardedEmails(timeline, enteredEmail));
    dispatch(getFavEmails(timeline, enteredEmail));
    dispatch(getLinkExchange(timeline, enteredEmail));
    dispatch(getBulkEmails(timeline, enteredEmail));
    dispatch(getOrders(enteredEmail));
    dispatch(getDeals(enteredEmail));
    dispatch(getInvoices(enteredEmail));
    dispatch(getOffers(enteredEmail));
    dispatch(getDetection(timeline, enteredEmail));
    dispatch(getdefaulterEmails(timeline, enteredEmail));
    dispatch(getmovedEmails(timeline, enteredEmail));
    dispatch(getAllAvatar());
    setCurrentIndex(0);
  }, [enteredEmail, timeline]);
  const firstEmail =
    emails?.[currentIndex]?.from?.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0];

  useEffect(() => {
    if (enteredEmail) {
      dispatch(getLadgerEmail(enteredEmail));
    } else if (firstEmail) {
      dispatch(getLadgerEmail(firstEmail));
    }
  }, [enteredEmail, firstEmail]);

  useEffect(() => {
    if (email) {
      dispatch(getViewEmail());
      dispatch(getContact());
    }
  }, [email]);
  useEffect(() => {
    if (notificationCount.unreplied_email) {
      dispatch(getUnrepliedEmailWithOutLoading(timeline, enteredEmail, true));
      dispatch(getUnansweredEmailWithOutLoading(timeline, enteredEmail));
      setNotificationCount((prev) => ({
        ...prev,
        unreplied_email: null,
      }));
    }
    if (notificationCount.outr_el_process_audit) {
      dispatch(hotAction.updateCount(1));
      setNotificationCount((prev) => ({
        ...prev,
        outr_el_process_audit: null,
      }));
    }
    if (notificationCount.outr_deal_fetch) {
      dispatch(getDeals());
      if (enteredEmail) {
        dispatch(getLadgerWithOutLoading(enteredEmail))
      }
      else if (firstEmail) {
        dispatch(getLadgerWithOutLoading(firstEmail))
      }
      dispatch(hotAction.updateCount(1));
      setNotificationCount((prev) => ({
        ...prev,
        outr_deal_fetch: null,
      }));
    }
    if (notificationCount.outr_order_gp_li) {
      dispatch(getOrders());
      if (enteredEmail) {
        dispatch(getLadgerWithOutLoading(enteredEmail))
      }
      else if (firstEmail) {
        dispatch(getLadgerWithOutLoading(firstEmail))
      }
      dispatch(hotAction.updateCount(1));
      setNotificationCount((prev) => ({
        ...prev,
        outr_order_gp_li: null,
      }));
    }
    if (notificationCount.outr_self_test) {
      dispatch(getInvoices());
      if (enteredEmail) {
        dispatch(getLadgerWithOutLoading(enteredEmail))
      }
      else if (firstEmail) {
        dispatch(getLadgerWithOutLoading(firstEmail))
      }
      dispatch(hotAction.updateCount(1));
      setNotificationCount((prev) => ({
        ...prev,
        outr_self_test: null,
      }));
    }
    if (notificationCount.outr_offer) {
      dispatch(getOffers());
      if (enteredEmail) {
        dispatch(getLadgerWithOutLoading(enteredEmail))
      }
      else if (firstEmail) {
        dispatch(getLadgerWithOutLoading(firstEmail))
      }
      dispatch(hotAction.updateCount(1));
      setNotificationCount((prev) => ({
        ...prev,
        outr_offer: null,
      }));
    }
    if (notificationCount.outr_recent_activity) {
      dispatch(eventActions.updateCount(1));
      setNotificationCount((prev) => ({
        ...prev,
        outr_recent_activity: null,
      }));
    }


  }, [notificationCount]);
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
                setSidebarCollapsed={setSidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </div>

            {/* Main content scrolls independently */}
            <main
              className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-300 ${sidebarCollapsed ? "ml-4" : "ml-0"
                }`}
            >
              <div className="p-6">
                <WelcomeHeader />
                <Outlet />
                {showAvatar && currentAvatar && (
                  <Avatar
                    setShowAvatar={setShowAvatar}
                    avatarUrl={currentAvatar?.url}
                    mute={currentAvatar}
                  />
                )}
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
