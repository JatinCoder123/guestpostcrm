import { useContext } from "react";
import { ThreadContext } from "../context/ThreadContext";
import { useNavigate } from "react-router-dom";

export const useThreadContext = () => {
  const navigateTo = useNavigate();
  const context = useContext(ThreadContext);
  const moveToThread = (viewEmails, loadAiReply) => {
    navigateTo(`/thread/view`, {
      state: {
        viewEmails: loadAiReply ? undefined : viewEmails,
        loadAiReply,
      },
    });
  };
  const moveToReply = (initialContent, files) => {
    console.log("files", files);
    navigateTo(`/thread/reply`, {
      state: { initialContent, files: files ? [files] : [] },
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
    files = null,
  }) => {
    context.handleSetCurrent({ email, thread: threadId });
    reply !== false
      ? moveToReply(reply, files)
      : moveToThread(viewEmail, loadAiReply);
    (addActivity || !reply) && localStorage.setItem("addActivity", true);
  };
  return { context, handleMove };
};
