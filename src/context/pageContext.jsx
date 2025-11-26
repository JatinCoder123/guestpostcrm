import { createContext, useEffect, useState } from "react";

export const PageContext = createContext();

export const PageContextProvider = (props) => {
  const [activePage, setActivePage] = useState("");
  const [displayIntro, setDisplayIntro] = useState(true);
  const [enteredEmail, setEnteredEmail] = useState(null);
  const [search, setSearch] = useState("");

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
  };

  return (
    <PageContext.Provider value={value}>{props.children}</PageContext.Provider>
  );
};
