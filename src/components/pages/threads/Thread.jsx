import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getThreadEmail } from "../../../store/Slices/threadEmail";
import { useThreadContext } from "../../../hooks/useThreadContext";
import { toast } from "react-toastify";
import { PageContext } from "../../../context/pageContext";
import { sendEmail, viewEmailAction } from "../../../store/Slices/viewEmail";
import { fetchGpc } from "../../../services/api";
import { generatePDF } from "../../../services/utils";
import { extractEmail } from "../../../assets/assets";
import { unrepliedAction } from "../../../store/Slices/unrepliedEmails";

const Thread = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [pdfLoading, setPdfLoading] = useState(false);
  const { handleMove } = useThreadContext();

  const { superfastReply, setEnteredEmail,
    currentIndex,
    handleDateClick, } = useContext(PageContext);
  const [contentLoading, setContentLoading] = useState(false);
  const [htmlfile, setHtmlfile] = useState(state?.htmlFile)
  const [files, setFiles] = useState([]);
  const [editorContent, setEditorContent] = useState(state?.initialContent || "");
  const { emails: inboxEmails } = useSelector((state) => state.unreplied);
  const [checkingThreadId, setCheckingTheadId] = useState(false);
  const { threadEmail } = useSelector((s) => s.threadEmail);
  const { crmEndpoint, user } = useSelector((s) => s.user);
  const { error: sendError, sendedEmail } = useSelector(
    (s) => s.viewEmail,
  );

  const {
    context: { currentEmail, currentThread },
  } = useThreadContext();
  const [emails, setEmails] = useState([]);
  const handleSendClick = async (forceSend = 1) => {
    try {
      setCheckingTheadId(true);
      const data = await fetchGpc({
        params: { type: "re_check_thread", email: currentEmail },
      });
      console.log("MATHED THREAD ID", data);

      if (!(data?.success || data.thread_id)) {
        toast.error("Failed to verify thread!");
        return;
      }
      console.log("THREAD", currentThread);

      const contentToSend = editorContent;
      const formData = new FormData();
      formData.append("threadId", data.thread_id);
      formData.append("replyBody", contentToSend);
      formData.append("email", currentEmail);
      formData.append("current_email", user.email);
      // formData.append("force_send", 1);
      files.forEach((file) => {
        formData.append("attachments[]", file.file);
      });

      dispatch(sendEmail(formData));
      moveToNext(currentEmail)
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while checking thread!");
    } finally {
      setCheckingTheadId(false);
    }
  };
  const moveToNext = (sendemail) => {
    const isLast = inboxEmails.length === currentIndex + 1;
    const nextEmailObj = inboxEmails[currentIndex + 1];
    if (isLast) {
      localStorage.removeItem("email");
      setEnteredEmail("");
      navigate("/unreplied-emails");
      return;
    }

    if (!nextEmailObj) {
      localStorage.removeItem("email");
      setEnteredEmail("");

      navigate("/unreplied-emails");
      return;
    }
    console.log("SUPER FAST REPLY", superfastReply);
    dispatch(unrepliedAction.removeUnreplied(sendemail));
    if (superfastReply) {
      handleDateClick({
        email: extractEmail(nextEmailObj?.from || ""),
        nextPrev: true,
      });
      handleMove({
        email: extractEmail(nextEmailObj?.from || ""),
        threadId: nextEmailObj?.thread_id,
        loadAiReply: true,
      });
      return;
    }
    handleDateClick({
      email: extractEmail(nextEmailObj?.from || ""),
      navigate: "/",
      nextPrev: true,
    });


  };
  useEffect(() => {
    if (
      currentEmail &&
      currentThread &&
      !(state?.viewEmails && state?.viewEmails[0]?.from_email == currentEmail)
    ) {
      dispatch(getThreadEmail(currentEmail, currentThread));
    } else {
      setEmails(state?.viewEmails);
    }
  }, [currentEmail, currentThread]);
  useEffect(() => {
    if (
      threadEmail?.length > 0 &&
      !(state?.viewEmails && state?.viewEmails[0]?.from_email == currentEmail)
    ) {
      setEmails(threadEmail);
    }
  }, [threadEmail]);
  useEffect(() => {
    if (!currentThread) {
      toast.error("Thread id is missing!");
      navigate(-1);
      return;
    }
    if (!currentEmail) {
      toast.error("Email id is missing!");
      navigate(-1);
    }
  }, []);
  useEffect(() => {
    if (sendError) {
      toast.error(sendError);
      dispatch(viewEmailAction.clearAllErrors());
    }
  }, [sendError]);
  useEffect(() => {
    const processFiles = async () => {
      if (!htmlfile) return;

      try {
        setPdfLoading(true); // 🔥 start loading

        const file = await generatePDF(htmlfile);

        // 👇 IMPORTANT: match your structure (file.file used later)
        setFiles([file]);

      } catch (err) {
        console.error("File conversion error:", err);
        toast.error("Failed to load attachments");
      } finally {
        setPdfLoading(false); // 🔥 stop loading
      }
    };

    processFiles();
  }, [htmlfile]);
  const value = {
    emails,
    loadAiReply: state?.loadAiReply,
    superfastReply,
    files,
    setFiles,
    editorContent,
    moveToNext,
    setEditorContent,
    htmlfile,
    setHtmlfile,
    contentLoading,
    setContentLoading,
    pdfLoading, // ✅ added
    handleSendClick,
    checkingThreadId,
    setCheckingTheadId,
  };
  return <Outlet context={value} />;
};

export default Thread;
