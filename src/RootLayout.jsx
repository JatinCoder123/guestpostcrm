import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";
import { useContext, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getLadger } from "./store/Slices/ladger";
import {
  checkForDuplicates,
  getDuplicateCount,
} from "./store/Slices/duplicateEmailSlice";
import {
  getUnansweredEmails,
} from "./store/Slices/unansweredEmails";
import {
  getUnrepliedEmail,
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
import ErrorBoundary from "./components/ErrorBoundary";
import { getQuickActionBtn } from "./store/Slices/quickActionBtn";
import Avatar from "./components/Avatar";
import { getDomain } from "./assets/assets";
import LowCreditWarning from "./components/LowCreditWarning";
const RootLayout = () => {
  const [showAvatar, setShowAvatar] = useState(true);

  const { timeline, email } = useSelector((state) => state.ladger);
  const { emails } = useSelector((state) => state.unreplied);
  const { crmEndpoint, currentScore } = useSelector((state) => state.user);
  const {
    displayIntro,
    setActivePage,
    enteredEmail,
    currentIndex,
    setCurrentIndex,
    search,
    setWelcomeHeaderContent,
    collapsed,
  } = useContext(PageContext);

  const { currentAvatar, setCrm, notificationCount, setNotificationCount } =
    useContext(SocketContext);

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
      // console.log("crmEndpoint", getDomain(crmEndpoint));
      setCrm(getDomain(crmEndpoint))
    }
  }, [crmEndpoint])
  // Show avatar when new avatar arrives
  useEffect(() => {
    setShowAvatar(true);
  }, [currentAvatar]);

  // Set active page based on URL
  useEffect(() => {
    setActivePage(location);
  }, [location, setActivePage]);

  // Initial data fetch when timeline or email changes
  useEffect(() => {
    dispatch(getAiCredits());
    dispatch(getUnansweredEmails({ email: enteredEmail }));
    dispatch(getUnrepliedEmail({ email: enteredEmail }));
    dispatch(getForwardedEmails({ email: enteredEmail }));
    dispatch(getFavEmails({ email: enteredEmail }));
    dispatch(getLinkExchange(enteredEmail));
    dispatch(getBulkEmails(enteredEmail));
    dispatch(getOrders({ email: enteredEmail }));
    dispatch(getDeals({ email: enteredEmail }));
    dispatch(getInvoices({ email: enteredEmail }));
    dispatch(getOffers({ email: enteredEmail }));
    dispatch(getDetection(enteredEmail));
    dispatch(getdefaulterEmails(enteredEmail));
    dispatch(getmovedEmails(enteredEmail));
    dispatch(getAllAvatar());
    dispatch(getQuickActionBtn());
    dispatch(getDuplicateCount());
    setCurrentIndex(0);
  }, [enteredEmail, timeline, dispatch, setCurrentIndex]); // ✅ Added dependencies

  const firstEmail =
    emails?.length > 0
      ? emails[currentIndex].from?.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0]
      : null;
  useEffect(() => {
    if (emails?.length > 0) {
      setWelcomeHeaderContent("Unreplied");
    }
  }, [emails]);

  // Fetch ladger when email changes
  useEffect(() => {
    if (enteredEmail) {
      dispatch(getLadger({ email: enteredEmail, search }));
    } else if (firstEmail) {
      dispatch(getLadger({ email: firstEmail, search }));
    } else {
      dispatch(getLadger({ search, isEmail: false }));
    }
  }, [enteredEmail, firstEmail, timeline, dispatch]);

  // Fetch view email and contact when ladger email is set
  useEffect(() => {
    if (email) {
      dispatch(getViewEmail());
      dispatch(getContact());
    }
  }, [email, dispatch]);

  // Handle socket notifications
  useEffect(() => {
    const refreshLadger = () => {
      if (enteredEmail) {
        dispatch(getLadger({ email: enteredEmail, search }));
        dispatch(getViewEmail(enteredEmail));
        dispatch(getContact(enteredEmail));
      } else if (firstEmail) {
        dispatch(getLadger({ email: firstEmail, search }));
        dispatch(getViewEmail(firstEmail));
        dispatch(getContact(firstEmail));
      } else {
        dispatch(getLadger({ search, isEmail: false }));
        dispatch(getViewEmail());
        dispatch(getContact());
      }
    };
    if (notificationCount.unreplied_email) {
      refreshLadger();
      dispatch(getUnrepliedEmail({ email: enteredEmail, newEmail: true, loading: false }));
      dispatch(getUnansweredEmails({ email: enteredEmail, loading: false }));
      setCurrentIndex(0);
      dispatch(checkForDuplicates());
      setNotificationCount((prev) => ({
        ...prev,
        unreplied_email: null,
      }));
    }

    if (notificationCount.refreshUnreplied) {
      refreshLadger();

      dispatch(getUnrepliedEmail({ email: enteredEmail, newEmail: true, loading: true }));
      dispatch(getUnansweredEmails({ email: enteredEmail, loading: false }));
      setCurrentIndex(0);
      setNotificationCount((prev) => ({
        ...prev,
        refreshUnreplied: null,
      }));
    }

    if (notificationCount.outr_el_process_audit) {
      refreshLadger();

      dispatch(hotAction.updateCount(1));
      setNotificationCount((prev) => ({
        ...prev,
        outr_el_process_audit: null,
      }));
    }

    if (notificationCount.outr_deal_fetch) {
      refreshLadger();

      dispatch(getDeals({}));
      dispatch(getUnrepliedEmail({ email: enteredEmail, newEmail: true, loading: false }));
      dispatch(getUnansweredEmails({ email: enteredEmail, loading: false }));
      dispatch(hotAction.updateCount(1));
      setNotificationCount((prev) => ({
        ...prev,
        outr_deal_fetch: null,
      }));
    }

    // ✅ FIXED: Changed outr_order_gp_li to outr_order_gp_list (matches SocketContext)
    if (notificationCount.outr_order_gp_li) {
      dispatch(getOrders({}));
      dispatch(getInvoices({ loading: false }));
      refreshLadger();

      dispatch(getUnrepliedEmail({ email: enteredEmail, newEmail: true, loading: false }));
      dispatch(getUnansweredEmails({ email: enteredEmail, loading: false }));
      dispatch(hotAction.updateCount(1));
      setNotificationCount((prev) => ({
        ...prev,
        outr_order_gp_li: null,
      }));
    }

    if (notificationCount.outr_self_test) {
      refreshLadger();

      dispatch(getInvoices({ loading: false }));
      dispatch(hotAction.updateCount(1));
      setNotificationCount((prev) => ({
        ...prev,
        outr_self_test: null,
      }));
    }

    if (notificationCount.outr_offer) {
      refreshLadger();

      dispatch(getOffers({}));
      dispatch(getUnrepliedEmail({ email: enteredEmail, newEmail: true, loading: false }));
      dispatch(getUnansweredEmails({ email: enteredEmail, loading: false }));
      dispatch(hotAction.updateCount(1));
      setNotificationCount((prev) => ({
        ...prev,
        outr_offer: null,
      }));
    }
    if (notificationCount.outr_paypal_invoice_links) {
      dispatch(hotAction.updateCount(1));
      setNotificationCount((prev) => ({
        ...prev,
        outr_paypal_invoice_links: null,
      }));
    }

    if (notificationCount.outr_recent_activity) {
      dispatch(eventActions.updateCount(1));
      setNotificationCount((prev) => ({
        ...prev,
        outr_recent_activity: null,
      }));
    }
    if (notificationCount.refresh_ladger) {
      refreshLadger();
      setNotificationCount((prev) => ({
        ...prev,
        refresh_ladger: null,
      }));
    }
  }, [notificationCount, dispatch, setNotificationCount]);
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
                  {isLowCredit && (
                    <LowCreditWarning score={currentScore} />
                  )}
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
