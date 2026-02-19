import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getThreadEmail, threadEmailAction } from "../store/Slices/threadEmail";
import { toast } from "react-toastify";
import { updateUnansweredEmails } from "../store/Slices/unansweredEmails";
import { updateUnrepliedEmails } from "../store/Slices/unrepliedEmails";
function useThread(type) {
  const [showEmail, setShowEmails] = useState(false);
  const [email, setEmail] = useState(null);
  const {
    message,
    error: sendError,
    loading: sendLoading,
  } = useSelector((state) => state.threadEmail);
  const {
    emails: unrepliedEmails
  } = useSelector((state) => state.unreplied);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const dispatch = useDispatch();
  const handleThreadClick = (email, threadId) => {
    dispatch(getThreadEmail(email, threadId));
    setShowEmails(true);
  };
  useEffect(() => {
    if (sendError) {
      toast.error(sendError);
      dispatch(threadEmailAction.clearAllErrors());
    }
    if (message) {
      toast.success(message);
      if (type === "unreplied") {
        const newEmail = unrepliedEmails.find((email) => email.thread_id == currentThreadId);
        dispatch(updateUnrepliedEmails(currentThreadId));
        dispatch(updateUnansweredEmails(c));

      }
      dispatch(threadEmailAction.clearAllMessage());
    }
  }, [dispatch, sendError, sendLoading, message]);
  return [
    handleThreadClick,
    showEmail,
    setShowEmails,
    currentThreadId,
    setCurrentThreadId,
    email,
    setEmail,
  ];
}

export default useThread;
