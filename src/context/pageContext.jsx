import { createContext, useEffect, useState } from "react";

export const PageContext = createContext();

export const PageContextProvider = (props) => {
  const [activePage, setActivePage] = useState("");
  const [showConsole, setShowConsole] = useState(localStorage.getItem("showConsole") || false);
  const [displayIntro, setDisplayIntro] = useState(true);
  const [collapsed, setSidebarCollapsed] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [enteredEmail, setEnteredEmail] = useState(
    localStorage.getItem("email") || null
  );
  const [search, setSearch] = useState(localStorage.getItem("email") || "");
  const [welcomeHeaderContent, setWelcomeHeaderContent] = useState(
    search.trim() !== "" ? "Search" : ""
  );

  // Set activePage based on current URL
  useEffect(() => {
    const path = window.location.pathname;
    const firstPart = path.split("/")[1];
    setActivePage(firstPart || "");
    setSidebarCollapsed(true);
    localStorage.setItem("showConsole", showConsole);
  }, []);

  const value = {
    activePage,
    setActivePage,
    displayIntro,
    setDisplayIntro,
    enteredEmail,
    setEnteredEmail,
    search,
    setSearch,
    welcomeHeaderContent,
    setWelcomeHeaderContent,
    collapsed,
    setSidebarCollapsed,
    currentIndex,
    setCurrentIndex,
  };

  return (
    <PageContext.Provider value={value}>{props.children}</PageContext.Provider>
  );
};
