import {
  Mail,
  Globe,
  Send,
  Brain,
  Sparkles,
  ChevronLeft,
  Zap,
  Edit,
  Trash2,
  LayoutTemplateIcon,
} from "lucide-react";
import { TbMessageStar } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendEmail, viewEmailAction } from "../../../store/Slices/viewEmail";
import { aiReplyAction, getAiReply } from "../../../store/Slices/aiReply";
import { CREATE_DEAL_API_KEY } from "../../../store/constants";
import { LoadingChase } from "../../Loading";
import { toast } from "react-toastify";
import { base64ToUtf8, getDomain } from "../../../assets/assets";
import useModule from "../../../hooks/useModule";
import PageLoader from "../../PageLoader";
import Attachment from "../../Attachment";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { ViewButton } from "../../ViewButton";
import useIdle from "../../../hooks/useIdle";
import MicInput from "../../MicInput";
import { useThreadContext } from "../../../hooks/useThreadContext";
import MailHeaderLeft from "./MailHeaderLeft";
import TemplateSelectorModal from "../../TemplateSelectorModal";
import TinyEditor from "../../TinyEditor";
import MessageModal from "../../MessageModal";
import { useParams } from "react-router-dom";

import axios from "axios";
const ThreadReply = () => {
  const editorRef = useRef(null);

  const { threadId } = useParams();
  const { emails } = useOutletContext() || [];
  const [showMessageModal, setShowMessageModal] = useState(false);
  const lastMessage = emails?.[emails.length - 1];
  const { state } = useLocation();
  const [editorContent, setEditorContent] = useState(
    state?.initialContent || "",
  );
  const {
    context: { currentEmail },
  } = useThreadContext();
  useIdle({ idle: false });
  const dispatch = useDispatch();
  const {
    message: sendMessage,
    sending,
    error: sendError,
    sendFailedResponse
  } = useSelector((s) => s.viewEmail);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const { crmEndpoint, user } = useSelector((s) => s.user);
  const [aiReplyContent, setAiReplyContent] = useState("");
  const [aiNewContent, setAiNewContent] = useState("");
  const [openParent, setOpenParent] = useState(null);
  const [to, setTo] = useState([]);
  const [cc, setCc] = useState([]);
  const [checkingThreadId, setCheckingTheadId] = useState(false);

  const [templateId, setTemplateId] = useState(null);
  const [editorReady, setEditorReady] = useState(false);
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const attachmentBoxRef = useRef(null);
  const [favourites, setFavourites] = useState([]);
  const {
    loading: aiLoading,
    aiReply: aiResponse,
    error: aiError,
    message,
  } = useSelector((state) => state.aiReply);

  // FETCH BUTTONS
  const { loading, data: buttons } = useModule({
    url: `${getDomain(crmEndpoint)}/index.php?entryPoint=get_buttons&type=regular&email=${currentEmail}`,
    name: "BUTTONS",
    dependencies: [currentEmail, favourites],
  });

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

  // SELECTED TEMPLATE
  const {
    loading: templateLoading,
    data: template,
    refetch,
  } = useModule({
    url: `${getDomain(crmEndpoint)}/index.php?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: {
      module: "EmailTemplates",
      where: { id: templateId },
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: `TEMPLATE WITH ID ${templateId}`,
    dependencies: [templateId],
    enabled: templateId,
  });

  // LOAD TEMPLATE INTO EDITOR
  useEffect(() => {
    if (template && editorReady && editorRef.current) {
      const htmlContent =
        template?.[0]?.body_html || base64ToUtf8(defaultTemplate.html_base64);
      if (htmlContent) {
        setEditorContent(htmlContent);
      } else {
        toast.warn("Template is empty—starting with blank editor.");
      }
    }
  }, [template, editorReady]);
  function insertAiReply(input) {
    setOpenParent(null);
    setTemplateId(null);
    setEditorContent(input);
  }


  const handleSendClick = async (forceSend = 0) => {
    try {
      setCheckingTheadId(true);

      // 🔹 Call API to verify thread
      const { data } = await axios.get(
        `${crmEndpoint}&type=re_check_thread&email=${currentEmail}`
      );

      console.log("MATHED THREAD ID", data)

      if (!data?.success) {
        toast.error("Failed to verify thread!");
        return;
      }
      console.log("THREAD", threadId)
      console.log("FORCE SEND", forceSend)
      // 🔹 Check thread match
      if (data.thread_id !== threadId) {
        toast.error("Thread mismatch! Cannot send email ");
        return;
      }

      // ✅ If matched → proceed
      const contentToSend = editorContent;
      const formData = new FormData();

      formData.append("threadId", threadId);
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

  const insertTextAtCursor = () => {
    if (editorRef.current) {
      editorRef.current.focus(); // ensure cursor is active
      editorRef.current.insertContent(
        priceTemp[0]?.body_html ?? "No Content Available",
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        attachmentBoxRef.current &&
        !attachmentBoxRef.current.contains(e.target)
      ) {
        setOpenAttachmentsFor(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (sendMessage) {
      setFiles([]);
      setEditorContent("");
    }
    if (sendError) {
      toast.error(sendError);
      dispatch(viewEmailAction.clearAllErrors());
    }
  }, [sendMessage, sendError, sendFailedResponse]);
  useEffect(() => {
    if (message && aiResponse) {
      if (message == "User") setAiNewContent(aiResponse);
      else if (message == "New") setAiNewContent(aiResponse);
      else setAiReplyContent(aiResponse);
      insertAiReply(aiResponse);
      dispatch(aiReplyAction.clearMessge());
    }
    if (aiError) {
      toast.error(aiError);
      dispatch(aiReplyAction.clearAllErrors());
    }
  }, [message, aiResponse, dispatch]);

  return (
    <>
      <MessageModal
        showMessageModal={showMessageModal}
        closeMessageModal={() => setShowMessageModal(false)}
        messageId={lastMessage?.message_id}
        email={currentEmail}
        threadId={threadId}
        viewEmail={emails}
        count={emails?.length || 0}
      />
      {(aiLoading || templateLoading) && <PageLoader />}
      <motion.div
        className="
    fixed inset-0 z-[999]
    bg-white
    w-screen h-screen
    flex flex-col
    overflow-hidden
  "
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
            sender={currentEmail}
            to={to}
            setTo={setTo}
            cc={cc}
            setCc={setCc}
          />
        </div>
        <div className="flex flex-col h-full w-full">
          <TinyEditor
            setEditorContent={setEditorContent}
            editorContent={editorContent}
            setEditorReady={setEditorReady}
            editorRef={editorRef}
          />

          <div className="p-6 border-t bg-gradient-to-r from-white to-gray-50 flex items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEditorContent("");
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mb-7"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
              <ViewButton Icon={Sparkles}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  onClick={() => {
                    if (aiReplyContent == "") {
                      dispatch(getAiReply(threadId));
                    }
                    insertAiReply(aiReplyContent);
                  }}
                >
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">
                    AI Reply
                  </span>
                </motion.button>
              </ViewButton>
              <ViewButton Icon={Sparkles}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  onClick={() => {
                    dispatch(getAiReply(threadId, 1, editorContent));

                    insertAiReply(editorContent);
                  }}
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">
                    AI Now
                  </span>
                </motion.button>
              </ViewButton>

              <TemplateSelectorModal
                isOpen={showTemplatePopup}
                onClose={() => setShowTemplatePopup(false)}
                onSelect={(tpl) => {
                  setEditorContent(tpl.body_html || "");
                  setTemplateId(tpl.id);
                  toast.success(`✅ "${tpl.name}" loaded into editor`);
                }}
                crmEndpoint={crmEndpoint}
                favourites={favourites}
                setFavourites={setFavourites}
              />
              {/* PARENT + CHILD BUTTONS */}
              {loading ? (
                <LoadingChase className="p-4" />
              ) : (
                buttons?.map((btnGroup, i) => {
                  const parent = btnGroup.parent_btn;
                  const children = btnGroup.child_btn;
                  const isOpen = openParent === parent.id;

                  return (
                    <div key={i} className="relative">
                      <ViewButton
                        Icon={Edit}
                        onClick={() =>
                          navigate("/settings/templates", {
                            state: { templateId: parent.email_template_id },
                          })
                        }
                      >
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-5 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                          onClick={() => {
                            setTemplateId(parent.email_template_id);
                            setOpenParent(isOpen ? null : parent.id);
                          }}
                        >
                          {parent.button_label}
                        </motion.button>
                      </ViewButton>

                      <AnimatePresence>
                        {isOpen && children && (
                          <motion.div
                            initial={{ x: -20, opacity: 0, scale: 0.95 }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            exit={{ x: -20, opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, type: "spring" }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 flex gap-2 bg-white p-3 rounded-2xl shadow-2xl border border-gray-200"
                          >
                            {children?.map((child, j) => (
                              <ViewButton
                                key={j}
                                Icon={Edit}
                                onClick={() =>
                                  navigate("/settings/templates", {
                                    state: {
                                      templateId: child.email_template_id,
                                    },
                                  })
                                }
                              >
                                <motion.button
                                  whileHover={{ scale: 1.03, y: -1 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    setTemplateId(child.email_template_id);
                                    setOpenParent(null);
                                  }}
                                  className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap"
                                >
                                  {child.button_label}
                                </motion.button>
                              </ViewButton>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
              <ViewButton
                Icon={Edit}
                onClick={() =>
                  navigate("/settings/templates", {
                    state: { templateId: priceTemp[0].id },
                  })
                }
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-5 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                  onClick={insertTextAtCursor}
                >
                  Price
                </motion.button>
              </ViewButton>
              <ViewButton Icon={Edit}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-gray-500 to-gray-700 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  onClick={() => {
                    setTemplateId(null);
                    if (defaultTemplate && editorRef.current) {
                      const html = base64ToUtf8(defaultTemplate.html_base64);
                      setEditorContent(html);
                      setOpenParent(null);
                    }
                    setShowTemplatePopup(true);
                    refetch();
                  }}
                >
                  <LayoutTemplateIcon className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">
                    All
                  </span>
                </motion.button>
              </ViewButton>
              <Attachment data={files} onChange={setFiles} />
              <MicInput editorRef={editorRef} />
            </div>

            {/* SEND BUTTON */}
            <div className="flex gap-2 item-center justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSendClick()}
                disabled={loading || checkingThreadId}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span>
                  {checkingThreadId
                    ? "Checking..."
                    : sending
                      ? "Sending..."
                      : "Send Email"}
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {sendFailedResponse && (
          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="bg-white w-[90%] max-w-2xl rounded-2xl shadow-2xl p-6"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-red-600">
                  ⚠️ Email Not Sent
                </h2>
                <button
                  onClick={() => setShowFailedModal(false)}
                  className="text-gray-500 hover:text-black"
                >
                  ✕
                </button>
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
                  {sendFailedResponse.suggested_reply}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3">

                {/* USE SUGGESTED */}
                <button
                  onClick={() => {
                    setEditorContent(
                      sendFailedResponse.suggested_reply
                    );
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
