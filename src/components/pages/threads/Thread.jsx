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
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const { superfastReply } = useContext(PageContext)

  const { state } = useLocation();
  const { threadEmail } = useSelector((s) => s.threadEmail);
  const { message: sendMessage, error: sendError } = useSelector((s) => s.viewEmail);
  const {
    context: { currentEmail, currentThread },
  } = useThreadContext();

  const [emails, setEmails] = useState([]);
  useEffect(() => {
    if (currentEmail && currentThread && !state?.viewEmails) {
      dispatch(getThreadEmail(currentEmail, currentThread));
    }
    else {
      setEmails(state?.viewEmails)
    }
  }, [currentEmail, currentThread]);
  useEffect(() => {

    if (threadEmail?.length > 0 && !state?.viewEmails) {
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
      setShowSuccessAnim(true);
      setTimeout(() => {
        setShowSuccessAnim(false);
      }, 1200); // animation duration
    }

    if (sendError) {
      toast.error(sendError);
      dispatch(viewEmailAction.clearAllErrors());
    }
  }, [sendMessage, sendError]);
  return <Outlet context={{ emails, loadAiReply: state?.loadAiReply, showSuccessAnim, superfastReply }} />;
};

export default Thread;
