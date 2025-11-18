import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getThreadEmail, threadEmailAction } from "../store/Slices/threadEmail";
import { toast } from "react-toastify";

function useThread() {
  const [showEmail, setShowEmails] = useState(false);
  const {
    message,
    error: sendError,
    loading: sendLoading,
  } = useSelector((state) => state.threadEmail);
  const [currentThreadId, setCurrentThreadId] = useState(null);
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
  useEffect(() => {
    if (sendError) {
      toast.error(sendError);
      dispatch(threadEmailAction.clearAllErrors());
    }
    if (message) {
      toast.success(message);
      dispatch(threadEmailAction.clearAllMessage());
    }
  }, [dispatch, sendError, sendLoading, message]);
  return [
    handleThreadClick,
    showEmail,
    setShowEmails,
    currentThreadId,
    setCurrentThreadId,
  ];
}

export default useThread;
