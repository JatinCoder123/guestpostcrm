import { ToastContainer } from "react-toastify";
import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";
import { useContext, useEffect, useState } from "react";
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
const RootLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { email, timeline } = useSelector((state) => state.ladger);
  const { displayIntro, setActivePage } = useContext(PageContext);
  const location = useLocation().pathname.split("/")[2];
  useEffect(() => {
    setActivePage(location);
  }, [location]);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getLadger());
  }, [timeline]);
  useEffect(() => {
    if (email) {
      dispatch(getLadgerEmail(email));
    }
  }, [email, timeline]);
  useEffect(() => {
    if (email) {
      dispatch(getUnansweredEmails(timeline, email));
      dispatch(getUnrepliedEmail(timeline, email));
      dispatch(getOrders(timeline, email));
      dispatch(getDeals(timeline, email));
      dispatch(getInvoices(timeline, email));
      dispatch(getOffers(timeline, email));
      dispatch(getDetection(timeline, email));
      dispatch(getViewEmail(email));
      dispatch(getAiCredits(timeline));
    }
  }, [email, timeline]);

  return (
    <AnimatePresence mode="wait">
      {displayIntro ? (
        <DisplayIntro key="intro" />
      ) : (
        <div className="min-h-screen bg-[#F8FAFC]">
          <TopNav />
          <div className="flex">
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <main
              className={`flex-1 transition-all duration-300 ${
                sidebarCollapsed ? "ml-16" : "ml-0"
              }`}
            >
              <Outlet />
            </main>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark" // you can change to "light"
            />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RootLayout;
