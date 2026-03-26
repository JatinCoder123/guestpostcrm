import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { getThreadEmail } from "../../../store/Slices/threadEmail";
import { useThreadContext } from "../../../hooks/useThreadContext";
import { toast } from "react-toastify";

const Thread = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { threadId } = useParams()
  const { threadEmail, message, error } = useSelector((s) => s.threadEmail);
  const {
    context: { currentEmail },
  } = useThreadContext();

  const [emails, setEmails] = useState([]);
  useEffect(() => {
    if (currentEmail && threadId && !state?.viewEmails) {
      dispatch(getThreadEmail(currentEmail, threadId));
    }
    else {
      setEmails(state?.viewEmails)
    }
  }, [currentEmail, threadId]);
  useEffect(() => {

    if (threadEmail?.length > 0 && !state?.viewEmails) {
      setEmails(threadEmail);
    }
  }, [threadEmail]);
  useEffect(() => {
    if (!threadId) {
      toast.error("Thread id is missing!");
      navigate(-1);
      return;
    }
    if (!currentEmail) {
      toast.error("Email id is missing!");
      navigate(-1);
    }
  }, []);
  return <Outlet context={{ emails }} />;
};

export default Thread;
