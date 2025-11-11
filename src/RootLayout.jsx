import { ToastContainer } from "react-toastify";
import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getLadger, getLadgerEmail } from "./store/Slices/ladger";
import { getUnansweredEmails } from "./store/Slices/unansweredEmails";
import { getUnrepliedEmail } from "./store/Slices/unrepliedEmails";
const RootLayout = () => {
  console.log("IN rootlayour")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { ladger, email,timeline } = useSelector((state) => state.ladger);
  const dispatch = useDispatch();
  useEffect(() => {
 dispatch(getLadger());
  }, []);
   useEffect(() => {
    if(email){
      dispatch(getLadgerEmail(email));
    }
 
  }, [email,timeline]);
  useEffect(() => {
    if (email) {
      dispatch(getUnansweredEmails(timeline, email));
      dispatch(getUnrepliedEmail(timeline, email));
    }
  }, [email,timeline]);
  return (
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
  );
};

export default RootLayout;
