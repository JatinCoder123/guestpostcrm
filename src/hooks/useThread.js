import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getThreadEmail } from "../store/Slices/threadEmail";

function useThread() {
  const [showEmail, setShowEmails] = useState(false);
  const dispatch = useDispatch();
  const handleThreadClick = (email, threadId) => {
    dispatch(getThreadEmail(email, threadId));
    setShowEmails(true);
  };
  useEffect(() => {
    if (showEmail) {
      document.body.style.overflow = "hidden"; // Disable background scroll
    } else {
      document.body.style.overflow = "auto"; // Restore when closed
    }

    return () => {
      document.body.style.overflow = "auto"; // Cleanup
    };
  }, [showEmail]);
  return [handleThreadClick, showEmail, setShowEmails];
}

export default useThread;
