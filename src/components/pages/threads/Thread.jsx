import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { getThreadEmail } from "../../../store/Slices/threadEmail";
import { useThreadContext } from "../../../hooks/useThreadContext";
import { toast } from "react-toastify";
import { PageContext } from "../../../context/pageContext";
import { sendEmail, viewEmailAction } from "../../../store/Slices/viewEmail";
import axios from "axios";

const Thread = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();

  const { superfastReply } = useContext(PageContext);
  const [contentLoading, setContentLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [editorContent, setEditorContent] = useState(
    state?.initialContent || "",
  );
  const [checkingThreadId, setCheckingTheadId] = useState(false);

  const [cc, setCc] = useState([]);
  const { threadEmail } = useSelector((s) => s.threadEmail);
  const { crmEndpoint, user } = useSelector((s) => s.user);
  const { message: sendMessage, error: sendError } = useSelector(
    (s) => s.viewEmail,
  );
  const {
    context: { currentEmail, currentThread },
  } = useThreadContext();
  const [emails, setEmails] = useState([]);
  const handleSendClick = async (forceSend = 1) => {
    try {
      setCheckingTheadId(true);
      const { data } = await axios.get(
        `${crmEndpoint}&type=re_check_thread&email=${currentEmail}`,
      );
      console.log("MATHED THREAD ID", data);

      if (!(data?.success || data.thread_id)) {
        toast.error("Failed to verify thread!");
        return;
      }
      console.log("THREAD", currentThread);

      console.log("CC", cc,);
      const contentToSend = editorContent;
      const formData = new FormData();
      formData.append("threadId", data.thread_id);
      formData.append("replyBody", contentToSend);
      formData.append("email", currentEmail);
      formData.append("current_email", user.email);
      formData.append("force_send", forceSend);
      formData.append("cc", cc.join(","));
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
    if (sendMessage && superfastReply) {
      setEditorContent("");
      setFiles([]);
    }

    if (sendError) {
      toast.error(sendError);
      dispatch(viewEmailAction.clearAllErrors());
    }
  }, [sendMessage, sendError]);
  const value = {
    emails,
    loadAiReply: state?.loadAiReply,
    superfastReply,
    files,
    setFiles,
    editorContent,
    setEditorContent,
    cc,
    setCc,
    contentLoading,
    setContentLoading,
    handleSendClick,
    checkingThreadId,
    setCheckingTheadId,
  };
  return <Outlet context={value} />;
};

export default Thread;
