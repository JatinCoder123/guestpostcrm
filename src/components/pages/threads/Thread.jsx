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
import { getDuplicateEmails } from "../../../store/Slices/duplicateEmailSlice";
import { useNext } from "../../../hooks/useNext";

const Thread = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [pdfLoading, setPdfLoading] = useState(false);
  const { moveToNext } = useNext()
  const { superfastReply } = useContext(PageContext);
  const [htmlfile, setHtmlfile] = useState(state?.htmlFile)
  const [files, setFiles] = useState([]);
  const [editorContent, setEditorContent] = useState(state?.initialContent || "");
  const [checkingThreadId, setCheckingTheadId] = useState(false);
  const { threadEmail } = useSelector((s) => s.threadEmail);
  const { user } = useSelector((s) => s.user);
  const { error: sendError } = useSelector(
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
        params: { type: "re_check_thread", thread_id: currentThread },
      });
      console.log("MATHED THREAD ID", data);

      if (!(data?.success || data.data)) {
        toast.error("Failed to verify thread!");
        return;
      }
      if (!data?.data?.find(email => email.toLowerCase() == currentEmail.toLowerCase())) {
        toast.error('Wrong Thread Id Detected! Try Again.')
        return;
      }
      console.log("THREAD", currentThread);

      const contentToSend = editorContent;
      const formData = new FormData();
      formData.append("threadId", currentThread);
      formData.append("replyBody", contentToSend);
      formData.append("email", currentEmail);
      formData.append("current_email", user.email);
      formData.append("force_send", 1);
      files.forEach((file) => {
        formData.append("attachments[]", file.file);
      });

      dispatch(sendEmail(formData));
      state?.handleAfterSuccessMailSent?.()
      moveToNext(currentEmail)
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while checking thread!");
    } finally {
      setCheckingTheadId(false);
    }
  };

  useEffect(() => {
    if (
      currentEmail &&
      currentThread &&
      !(state?.viewEmails && (state?.viewEmails[0]?.from_email == currentEmail && state?.viewEmails[0]?.thread_id == currentThread))
    ) {
      dispatch(getThreadEmail(currentEmail, currentThread));
    } else {

      setEmails(state?.viewEmails);
    }
  }, [currentEmail, currentThread]);
  useEffect(() => {
    if (
      threadEmail?.length > 0 &&
      !(state?.viewEmails && state?.viewEmails[0]?.from_email == currentEmail && state?.viewEmails[0]?.thread_id == currentThread)
    ) {
      setEmails(threadEmail);
    }
  }, [threadEmail]);
  useEffect(() => {
    dispatch(getDuplicateEmails(currentEmail));
  }, [dispatch, currentEmail]);
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
    setEditorContent,
    htmlfile,
    setHtmlfile,
    pdfLoading, // ✅ added
    handleSendClick,
    checkingThreadId,
    setCheckingTheadId,
  };
  return <Outlet context={value} />;
};

export default Thread;
