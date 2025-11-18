import { createContext, useEffect, useState } from "react";

export const PageContext = createContext();

export const PageContextProvider = (props) => {
  const [activePage, setActivePage] = useState("");
  const [displayIntro, setDisplayIntro] = useState(true);
  const [enteredEmail, setEnteredEmail] = useState(null);

  // Set activePage based on current URL
  useEffect(() => {
    const path = window.location.pathname; // e.g. "/orders/123"
    const firstPart = path.split("/")[1]; // "orders"

    setActivePage(firstPart || ""); // set "" if no path
  }, []);

  const value = {
    activePage,
    setActivePage,
    displayIntro,
    setDisplayIntro,
    enteredEmail,
    setEnteredEmail,
  };

  return (
    <PageContext.Provider value={value}>{props.children}</PageContext.Provider>
  );
};
