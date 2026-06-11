import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useThreadContext } from "../../../hooks/useThreadContext";
import { toast } from "react-toastify";
import { PageContext } from "../../../context/pageContext";
import { sendEmail, viewEmailAction } from "../../../store/Slices/viewEmail";
import { fetchGpc } from "../../../services/api";
import { generatePDF } from "../../../services/utils";
import { useNext } from "../../../hooks/useNext";

const Thread = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const threadId = searchParams.get("thread");
  const { state } = useLocation();
  const [pdfLoading, setPdfLoading] = useState(false);
  const { moveToNext } = useNext()
  const { superfastReply } = useContext(PageContext);
  const [htmlfile, setHtmlfile] = useState(state?.htmlFile)
  const [files, setFiles] = useState([]);
  const [editorContent, setEditorContent] = useState(state?.initialContent || "");
  const [checkingThreadId, setCheckingTheadId] = useState(false);
  const { user } = useSelector((s) => s.user);
  const { error: sendError } = useSelector((s) => s.viewEmail);


  const handleSendClick = async (forceSend = 1) => {
    try {
      setCheckingTheadId(true);
      const data = await fetchGpc({
        params: { type: "re_check_thread", thread_id: threadId },
      });
      console.log("MATHED THREAD ID", data);

      if (!(data?.success || data.data)) {
        toast.error("Failed to verify thread!");
        return;
      }
      if (!data?.data?.find(ed => ed.toLowerCase() == email.toLowerCase())) {
        toast.error('Wrong Thread Id Detected! Try Again.')
        return;
      }
      console.log("THREAD", threadId);

      const contentToSend = editorContent;
      const formData = new FormData();
      formData.append("threadId", threadId);
      formData.append("replyBody", contentToSend);
      formData.append("email", email);
      formData.append("current_email", user.email);
      formData.append("force_send", 1);
      files.forEach((file) => {
        formData.append("attachments[]", file.file);
      });

      dispatch(sendEmail(formData));
      state?.handleAfterSuccessMailSent?.()
      moveToNext(email)
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while checking thread!");
    } finally {
      setCheckingTheadId(false);
    }
  };
  useEffect(() => {
    if (!threadId) {
      toast.error("Thread id is missing!");
      navigate(-1);
      return;
    }
    if (!email) {
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
    loadAiReply: state?.loadAiReply,
    superfastReply,
    files,
    setFiles,
    editorContent,
    setEditorContent,
    email,
    threadId,
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
