import {
  Globe,
  Send,
  ChevronLeft,
} from "lucide-react";
import { TbMessageStar } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendEmail, viewEmailAction } from "../../../store/Slices/viewEmail";
import { aiReplyAction, getAiReply } from "../../../store/Slices/aiReply";
import { CREATE_DEAL_API_KEY } from "../../../store/constants";
import { toast } from "react-toastify";
import { base64ToUtf8, getDomain } from "../../../assets/assets";
import useModule from "../../../hooks/useModule";
import PageLoader from "../../PageLoader";
import Attachment from "../../Attachment";
import { useNavigate, useOutletContext } from "react-router-dom";
import useIdle from "../../../hooks/useIdle";
import { useThreadContext } from "../../../hooks/useThreadContext";
import MailHeaderLeft from "./MailHeaderLeft";
import TinyEditor from "../../TinyEditor";
import MessageModal from "../../MessageModal";
import axios from "axios";
import { SendingOverlay } from "./SendingOverlay";
import ReplyButtons from "./ReplyButtons";
const ThreadReply = () => {
  const editorRef = useRef(null);
  const [showBriefReason, setShowBriefReason] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const { emails, editorContent, setEditorContent, files, setFiles, to, cc } = useOutletContext() || [];
  const [showMessageModal, setShowMessageModal] = useState(false);
  const lastMessage = emails?.[emails.length - 1];
  const {
    context: { currentEmail, currentThread: threadId },
  } = useThreadContext();
  useIdle({ idle: false });
  const dispatch = useDispatch();
  const {
    message: sendMessage,
    sending,
    sendFailedResponse,
  } = useSelector((s) => s.viewEmail);
  const navigate = useNavigate();
  const { crmEndpoint, user } = useSelector((s) => s.user);


  const [checkingThreadId, setCheckingTheadId] = useState(false);
  const [templateId, setTemplateId] = useState(null);
  const [editorReady, setEditorReady] = useState(false);
  const modalRef = useRef(null);

  const { loading: aiLoading } = useSelector((state) => state.aiReply);



  // DEFAULT TEMPLATE
  const { loading: defTemplateLoading, data: defaultTemplate } = useModule({
    url: `${getDomain(crmEndpoint)}/index.php?entryPoint=updateOffer&email=${currentEmail}`,
    name: "DEFAULT TEMPLATE",
    dependencies: [currentEmail],
  });
  const { loading: priceTempLoading, data: priceTemp } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: {
      module: "EmailTemplates",
      where: {
        name: "PRICE_LIST",
      },
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: "Price Template",
    dependencies: [currentEmail],
  });


  useEffect(() => {
    if (sendFailedResponse) {
      setShowFailedModal(true);
    }
  }, [sendFailedResponse]);

  const handleSendClick = async (forceSend = 0) => {
    try {
      setCheckingTheadId(true);
      const { data } = await axios.get(
        `${crmEndpoint}&type=re_check_thread&email=${currentEmail}`,
      );
      console.log("MATHED THREAD ID", data);

      if (!data?.success) {
        toast.error("Failed to verify thread!");
        return;
      }
      console.log("THREAD", threadId);
      // 🔹 Check thread match
      if (data.thread_id !== threadId) {
        toast.error("Thread mismatch! Cannot send email ");
        return;
      }
      console.log("TO AND CC", cc, to);
      const contentToSend = editorContent;
      const formData = new FormData();
      formData.append("threadId", data.thread_id);
      formData.append("replyBody", contentToSend);
      formData.append("email", currentEmail);
      formData.append("current_email", user.email);
      formData.append("force_send", forceSend);
      formData.append("cc", cc.join(","));
      formData.append("to", to.join(","));
      files.forEach((file) => {
        formData.append("attachments[]", file.file);
      });

      dispatch(sendEmail(formData));
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while checking thread!");
    } finally {
      setCheckingTheadId(false);
    }
  };
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        showFailedModal &&
        modalRef.current &&
        !modalRef.current.contains(e.target)
      ) {
        setShowFailedModal(false);
        dispatch(viewEmailAction.clearFailedResponse());
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showFailedModal]);
  return (
    <>
      <SendingOverlay sending={sending} email={currentEmail} />
      <MessageModal
        showMessageModal={showMessageModal}
        closeMessageModal={() => setShowMessageModal(false)}
        messageId={lastMessage?.message_id}
        email={currentEmail}
        threadId={threadId}
        viewEmail={emails}
        count={emails?.length || 0}
      />
      {/* {(aiLoading || templateLoading) && <PageLoader />} */}
      <motion.div
        initial={{ x: 0, opacity: 1 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed inset-0 z-[999] bg-white w-screen h-screen flex flex-col overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex gap-3 justify-between items-center px-6 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center gap-3">
              {/* OPEN GMAIL */}
              <div
                className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition"
                onClick={() =>
                  window.open(
                    `https://mail.google.com/mail/u/0/#inbox/${threadId}`,
                    "_blank",
                  )
                }
              >
                <Send className="w-5 h-5" />
                <h2 className="text-xl font-bold tracking-tight">
                  Compose Email
                </h2>
              </div>

              {/* COPY LINK */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // ⛔ prevent opening gmail
                  const link = `https://mail.google.com/mail/u/0/#inbox/${threadId}`;
                  navigator.clipboard.writeText(link);
                  toast.success("Email thread link copied!");
                }}
                title="Copy Gmail link"
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition shadow-sm"
              >
                <Globe className="w-6 h-6" />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMessageModal(true)}
                className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 transition shadow-sm"
              >
                <TbMessageStar className="w-6 h-6 text-yellow-400" />
              </motion.button>
            </div>
          </div>
          <MailHeaderLeft
          />
        </div>
        <div className="flex flex-col h-full w-full">
          <TinyEditor
            setEditorContent={setEditorContent}
            editorContent={editorContent}
            setEditorReady={setEditorReady}
            editorRef={editorRef}
          />

          {/* ✅ SUCCESS OVERLAY */}

          <div className="p-6 border-t bg-gradient-to-r from-white to-gray-50 flex items-center justify-between gap-4 shadow-2xl">

            <ReplyButtons editorRef={editorRef} editorReady={editorReady} />
            {/* SEND BUTTON */}
            <div className="flex gap-2 items-center justify-center">
              <motion.button
                whileHover={
                  !(checkingThreadId || sending)
                    ? { scale: 1.05, y: -2 }
                    : {}
                }
                whileTap={
                  !(checkingThreadId || sending)
                    ? { scale: 0.98 }
                    : {}
                }
                onClick={() => handleSendClick()}
                disabled={checkingThreadId || sending || editorContent == ""}
                className={`px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 transition-all duration-200
      ${checkingThreadId || sending || editorContent == ""
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl"
                  }`}
              >
                <Send className="w-5 h-5" />
                <span>
                  {checkingThreadId || sending
                    ? "Sending..."
                    : "Send Email"}
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {showFailedModal && sendFailedResponse && (
          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="bg-white w-[90%] max-w-3xl rounded-2xl shadow-2xl p-6"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-red-600">
                  ⚠️ Email Not Sent
                </h2>
                <button
                  onClick={() => {
                    setShowFailedModal(false);
                    dispatch(viewEmailAction.clearFailedResponse());
                  }}
                >
                  ✕
                </button>
              </div>
              {/* BRIEF REASON */}
              {/* BRIEF REASON BUTTON */}
              <div className="mb-4">
                {/* CONDITIONAL RENDER */}
                {showBriefReason && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-yellow-600">
                      Brief Reason:
                    </p>
                    <p className="text-sm text-gray-700">
                      {sendFailedResponse.brief_reason ||
                        "No brief reason available"}
                    </p>
                  </div>
                )}
              </div>
              {/* REASON */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-red-600">Reason:</p>
                <p className="text-sm text-gray-700">
                  {sendFailedResponse.reason}
                </p>
              </div>

              {/* SUGGESTED REPLY */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-indigo-600">
                  Suggested Reply:
                </p>
                <div className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-lg border max-h-60 overflow-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sendFailedResponse.suggested_reply,
                    }}
                  />
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3">
                {/* USE BRIEF REASON */}
                <button
                  onClick={() => setShowBriefReason(!showBriefReason)}
                  className="px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm hover:bg-yellow-600"
                >
                  {showBriefReason ? "Hide Brief" : "Brief Reason"}
                </button>

                {/* USE SUGGESTED */}
                <button
                  onClick={() => {
                    setEditorContent(sendFailedResponse.suggested_reply);
                    dispatch(viewEmailAction.clearFailedResponse());
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                >
                  Use Suggested Reply
                </button>

                {/* FORCE SEND */}
                <button
                  onClick={() => {
                    handleSendClick(1);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                >
                  Force Send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThreadReply;

