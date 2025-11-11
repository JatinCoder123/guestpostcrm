import { ToastContainer } from "react-toastify";
import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";
import { useState } from "react";
import { Outlet } from "react-router-dom";
const RootLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
