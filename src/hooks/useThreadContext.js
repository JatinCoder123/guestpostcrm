import { useContext } from "react";
import { ThreadContext } from "../context/ThreadContext";
import { useNavigate } from "react-router-dom";

export const useThreadContext = () => {
  const navigateTo = useNavigate();
  const context = useContext(ThreadContext);
  const moveToThread = (email, threadId) => {
    navigateTo(`/thread/view?email=${email}&thread=${threadId}`);
  };
  const moveToReply = (email, threadId, initialContent, htmlFile, handleAfterSuccessMailSent) => {
    navigateTo(`/thread/reply?email=${email}&thread=${threadId}`, {
      state: { initialContent, htmlFile, handleAfterSuccessMailSent },
    });
  };
  if (!context) {
    throw new Error(
      "useThreadContext must be used inside ThreadContextProvider",
    );
  }
  const handleMove = ({
    email,
    threadId,
    viewEmail = null,
    reply = false,
    addActivity = false,
    loadAiReply = false,
    htmlFile = null,
    handleAfterSuccessMailSent = null,
  }) => {
    context.handleSetCurrent({ email, thread: threadId });
    reply !== false
      ? moveToReply(email, threadId, reply, htmlFile, handleAfterSuccessMailSent)
      : moveToThread(email, threadId, viewEmail, loadAiReply);
    (addActivity || !reply) && localStorage.setItem("addActivity", true);
  };
  return { context, handleMove };
};
