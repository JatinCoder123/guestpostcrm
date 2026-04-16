import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { getThreadEmail } from "../../../store/Slices/threadEmail";
import { useThreadContext } from "../../../hooks/useThreadContext";
import { toast } from "react-toastify";
import { PageContext } from "../../../context/pageContext";
import { viewEmailAction } from "../../../store/Slices/viewEmail";

const Thread = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();

  const { superfastReply } = useContext(PageContext)
  const [contentLoading, setContentLoading] = useState(false)
  const [files, setFiles] = useState([]);
  const [editorContent, setEditorContent] = useState(
    state?.initialContent || "",
  );
  const [to, setTo] = useState([]);
  const [cc, setCc] = useState([]);
  const { threadEmail } = useSelector((s) => s.threadEmail);
  const { message: sendMessage, error: sendError } = useSelector((s) => s.viewEmail);
  const {
    context: { currentEmail, currentThread },
  } = useThreadContext();
  const [emails, setEmails] = useState([]);
  useEffect(() => {
    if (currentEmail && currentThread && !(state?.viewEmails && state?.viewEmails[0]?.from_email == currentEmail)) {
      dispatch(getThreadEmail(currentEmail, currentThread));
    }
    else {
      setEmails(state?.viewEmails)
    }
  }, [currentEmail, currentThread]);
  useEffect(() => {

    if (threadEmail?.length > 0 && !(state?.viewEmails && state?.viewEmails[0]?.from_email == currentEmail)) {
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
  const value = { emails, loadAiReply: state?.loadAiReply, superfastReply, files, setFiles, editorContent, setEditorContent, to, setTo, cc, setCc, contentLoading, setContentLoading }
  return <Outlet context={value} />;
};

export default Thread;
