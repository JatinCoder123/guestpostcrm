import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getThreadEmail } from "../../../store/Slices/threadEmail";
import { useThreadContext } from "../../../hooks/useThreadContext";

const Thread = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { threadEmail, message, error } = useSelector((s) => s.threadEmail);
  const {
    context: { currentThread, currentEmail },
  } = useThreadContext();

  const [emails, setEmails] = useState(state?.viewEmails || []);
  useEffect(() => {
    if (currentEmail && currentThread && !state?.viewEmails) {
      dispatch(getThreadEmail(currentEmail, currentThread));
    }
  }, [currentEmail, currentThread]);
  useEffect(() => {
    if (threadEmail?.length > 0) {
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
  return <Outlet context={{ emails }} />;
};

export default Thread;
