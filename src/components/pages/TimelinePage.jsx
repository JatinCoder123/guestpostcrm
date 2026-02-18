import { Mail, Pencil, Reply, SparkleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getLadger, ladgerAction } from "../../store/Slices/ladger";
import EmailBox from "../EmailBox";
import { sendEmail, viewEmailAction } from "../../store/Slices/viewEmail";
import { motion } from "framer-motion";
import Avatar from "../Avatar";
import LoadingSkeleton from "../LoadingSkeleton";
import Ip from "../Ip";
import { getAvatar } from "../../store/Slices/avatarSlice";
import TimelineEvent from "../TimelineEvent";
import MailerSummaryHeader from "../MailerSummaryHeader";
import ContactHeader from "../ContactHeader";
import ActionButton from "../ActionButton";
import { addEvent } from "../../store/Slices/eventSlice";
import { useContext } from "react";
import { PageContext } from "../../context/pageContext";
import { NoSearchFoundPage } from "../NoSearchFoundPage";
import { SocketContext } from "../../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { PreviewTemplate } from "../PreviewTemplate";

const decodeHTMLEntities = (str = "") => {
  if (typeof str !== "string") return str;
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};
export function TimelinePage() {
  const navigateTo = useNavigate();
  const [showEmail, setShowEmail] = useState(false);
  const [aiReply, setAiReply] = useState("");
  const [showThread, setShowThread] = useState(false);
  const [showIP, setShowIP] = useState(false);
  const { currentIndex, setCurrentIndex, enterEmail, search } =
    useContext(PageContext);
  const { setNotificationCount } = useContext(SocketContext);
  const [showAvatar, setShowAvatar] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const {
    error: sendError,
    message,
    loading: viewEmailLoading,
    viewEmail,
    sending,
    threadId,
  } = useSelector((state) => state.viewEmail);

  const dispatch = useDispatch();
  const { ladger, email, mailersSummary, searchNotFound, loading, error } =
    useSelector((state) => state.ladger);
  const {
    emails,
    loading: unrepliedLoading,
    showNewEmailBanner,
  } = useSelector((state) => state.unreplied);
  const currentThreadId = emails?.length > 0 && emails[currentIndex]?.thread_id;
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(ladgerAction.clearAllErrors());
    }
    if (message) {
      setNotificationCount((prev) => ({
        ...prev,
        refreshUnreplied: Date.now(),
      }));
      setShowPreview(false);
      dispatch(
        addEvent({
          email: email,
          thread_id: currentThreadId,
          recent_activity: message,
        }),
      );
      dispatch(viewEmailAction.clearAllMessage());
    }
  }, [dispatch, error, sendError, message]);
  useEffect(() => {
    setAiReply(mailersSummary?.ai_response);
  }, [mailersSummary]);
  const handleMoveSuccess = () => {
    dispatch(getLadger({ email }));
  };
  const handleActionBtnClick = (btnBody) => {
    if (emails.length == 0) {
      toast.info("No Unreplied Email found");
      return;
    }
    dispatch(
      sendEmail({ reply: btnBody, threadId: "Quick Action Button Reply Sent" }),
    );
    dispatch(
      addEvent({
        email: email,
        thread_id: emails[currentIndex]?.thread_id,
        recent_activity: "Quick Action Button Reply Sent",
      }),
    );
  };

  const handleMoveToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleAiAutoReply = () => {
    dispatch(
      sendEmail({
        reply: editorContent,
        threadId: "Ai Reply Send Successfully",
      }),
    );
  };
  const handleNext = () => {
    if (currentIndex < emails?.length - 1) {
      setCurrentIndex((p) => p + 1);
    }
  };
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((p) => p - 1);
    }
  };

  if (searchNotFound) {
    return <NoSearchFoundPage />;
  }
  if (showEmail) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
        <EmailBox
          onClose={() => setShowEmail(false)}
          view={true}
          tempEmail={email}
        />
      </div>
    );
  }

  if (showThread) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
        <EmailBox
          onClose={() => setShowThread(false)}
          threadId={currentThreadId}
          tempEmail={email}
        />
      </div>
    );
  }
  if (showPreview) {
    return (
      <PreviewTemplate
        editorContent={editorContent}
        initialContent={aiReply}
        templateContent=""
        aiReply={aiReply}
        threadId={threadId}
        setEditorContent={setEditorContent}
        onClose={() => setShowPreview(false)}
        onSubmit={handleAiAutoReply}
        loading={sending}
      />
    );
  }

  if (showIP) {
    return <Ip onClose={() => setShowIP(false)} />;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleMoveToTop}
          className="bg-gradient-to-r from-purple-600 to-blue-600 
               text-white px-4 py-2 rounded-full shadow-lg
               hover:scale-110 transition-all duration-300"
        >
          Move To Top ↑
        </button>
      </div>

      {showAvatar && <Avatar setShowAvatar={setShowAvatar} onPlay={true} />}
    </>
  );
}

export default TimelinePage;
