import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const PageContext = createContext();

export const PageContextProvider = (props) => {
  const [activePage, setActivePage] = useState("");
  const [displayIntro, setDisplayIntro] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [enteredEmail, setEnteredEmail] = useState(
    localStorage.getItem("email") || null
  );
  const [search, setSearch] = useState(localStorage.getItem("email") || "");
  const [welcomeHeaderContent, setWelcomeHeaderContent] = useState(search.trim() !== "" ? "Search" : "");


  // Set activePage based on current URL
  useEffect(() => {
    const path = window.location.pathname;

    const firstPart = path.split("/")[1];
    setActivePage(firstPart || "");
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
    currentIndex,
    setCurrentIndex,
  };

  return (
    <PageContext.Provider value={value}>{props.children}</PageContext.Provider>
  );
};
