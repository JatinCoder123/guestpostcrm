import { createContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ladgerAction } from "../store/Slices/ladger";
import { toast } from "react-toastify";

export const PageContext = createContext();

export const PageContextProvider = (props) => {
  const [activePage, setActivePage] = useState("");
  const showConsole = true;
  const navigateTo = useNavigate()
  const dispatch = useDispatch()
  const [displayIntro, setDisplayIntro] = useState(localStorage.getItem("displayIntro") === "true");
  const [collapsed, setSidebarCollapsed] = useState(true);
  const [showNextPrev, setShowNextPrev] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [enteredEmail, setEnteredEmail] = useState(
    localStorage.getItem("searchTerm") || null,
  );


  /* ❌ Clear */
  const handleClear = () => {
    localStorage.removeItem("searchTerm");
    setEnteredEmail("");
    setCurrentIndex(0)
    setShowNextPrev(true)
  };
  const handleDateClick = ({ email, navigate, index = null, nextPrev = false }) => {
    if (email == null) {
      toast.error("NO Email Is There!")
      return
    }
    localStorage.setItem("searchTerm", email);
    setEnteredEmail(email);
    dispatch(ladgerAction.setTimeline(null));
    if (index != null) setCurrentIndex(index);
    setShowNextPrev(nextPrev)
    navigateTo(navigate);
  };

  // Set activePage based on current URL
  useEffect(() => {
    const path = window.location.pathname;
    const firstPart = path.split("/")[1];
    setActivePage(firstPart || "");
    setSidebarCollapsed(true);
    localStorage.setItem("showConsole", showConsole);
  }, []);
  useEffect(() => {
    localStorage.setItem("currentIndex", currentIndex)
  }, [currentIndex]);
  const value = {
    activePage,
    setActivePage,
    displayIntro,
    setDisplayIntro,
    handleClear,
    enteredEmail,
    setEnteredEmail,
    collapsed,
    setSidebarCollapsed,
    handleDateClick,
    currentIndex,
    showNextPrev, setShowNextPrev,
    setCurrentIndex,
  };

  return (
    <PageContext.Provider value={value}>{props.children}</PageContext.Provider>
  );
};
