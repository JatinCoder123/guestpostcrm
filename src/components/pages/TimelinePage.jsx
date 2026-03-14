import { Mail, MessageSquare, Pencil, SparkleIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getLadger, ladgerAction } from "../../store/Slices/ladger";
import { motion } from "framer-motion";
import Avatar from "../Avatar";
import LoadingSkeleton from "../LoadingSkeleton";
import Ip from "../Ip";
import { getAvatar } from "../../store/Slices/avatarSlice";
import TimelineEvent from "../TimelineEvent";
import MailerSummaryHeader from "../MailerSummaryHeader";
import ContactHeader from "../ContactHeader";
import ActionButton from "../ActionButton";
import { addEvent } from "../../store/Slices/eventSlice";
import { useContext } from "react";
import { NoSearchFoundPage } from "../NoSearchFoundPage";
import { SocketContext } from "../../context/SocketContext";
import { getDomain, showConsole } from "../../assets/assets";
import { LoadingChase } from "../Loading";
import { quickActionBtnActions } from "../../store/Slices/quickActionBtn";
import useModule from "../../hooks/useModule";
import { CREATE_DEAL_API_KEY } from "../../store/constants";
import { useNavigate } from "react-router-dom";
import { useThreadContext } from "../../hooks/useThreadContext";
import MessageModal from "../MessageModal";
export function TimelinePage() {
  const [showMore, setShowMore] = useState(false);
  const [aiReply, setAiReply] = useState("");
  const [showIP, setShowIP] = useState(false);
  const { setNotificationCount } = useContext(SocketContext);
  const [showAvatar, setShowAvatar] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [clickedActionBtn, setClickedActionBtn] = useState(null);
  const { crmEndpoint } = useSelector((state) => state.user);
  const [showFirstReplyBtn, setShowFirstReplyBtn] = useState(false);
  const [reminderId, setReminderId] = useState(null);
  const [frLoading, setFrLoading] = useState(false);
  const [isMark, setIsMark] = useState(false);
  const { items: marketPlaces } = useSelector((s) => s.marketplace);

  useEffect(() => {
    if (marketPlaces.length > 0) {
      setIsMark(marketPlaces.find((e) => e.name === email));
    } else {
      setIsMark(false);
    }
  }, [marketPlaces]);
  const { email: frEmail } = useSelector((s) => s.ladger);

  const {
    buttons,
    error: buttonsError,
    loading: buttonsLoading,
  } = useSelector((s) => s.quickActionBtn);
  const handleMessageClick = (id) => {
    console.log("Message clicked:", id);
    setSelectedMessage(id);
    setShowMessageModal(true);
  };
  const {
    error: sendError,
    message,
    loading: viewEmailLoading,
    viewEmail,
    sending,
    threadId,
    count,
  } = useSelector((state) => state.viewEmail);
  const { loading: askBudgetTempLoading, data: askBudgetTemp } = useModule({
    url: `${getDomain(crmEndpoint)}/index.php?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: {
      module: "EmailTemplates",
      where: { name: "Ask Budget" },
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: `ASK BUDGET TEMPLATE`,
  });
  const { loading: sorryTemplateLoading, data: sorryTemp } = useModule({
    url: `${getDomain(crmEndpoint)}/index.php?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: {
      module: "EmailTemplates",
      where: { name: "Sorry" },
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: `Sorry TEMPLATE`,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleMove } = useThreadContext();

  const { ladger, email, mailersSummary, searchNotFound, loading, error } =
    useSelector((state) => state.ladger);
  const { emails, loading: unrepliedLoading } = useSelector(
    (state) => state.unreplied,
  );

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(ladgerAction.clearAllErrors());
    }
    if (message) {
      dispatch(
        addEvent({
          email: email,
          thread_id: threadId,
          recent_activity: message,
        }),
      );
    }
  }, [dispatch, error, sendError, message]);
  useEffect(() => {
    setAiReply(mailersSummary?.ai_response);
  }, [mailersSummary]);
  const handleMoveSuccess = () => {
    dispatch(getLadger({ email }));
  };

  const handleSendFirstReply = async () => {
    if (!reminderId) return;

    try {
      setFrLoading(true);
      showConsole && console.log(crmEndpoint);
      await fetch(
        `${crmEndpoint}&type=send_reminder&reminder_id=${reminderId}`,
      );
      showConsole && console.log("First rply send button clicked");
      setNotificationCount((prev) => ({
        ...prev,
        refreshUnreplied: Date.now(),
      }));
      toast.success("First reply sent successfully");
      setShowFirstReplyBtn(false);
    } catch (err) {
      console.error("Error sending first reply:", err);
      toast.error("Failed to send first reply");
    } finally {
      setFrLoading(false);
    }
  };
  useEffect(() => {
    if (!frEmail) return;

    const fetchFRButtonStatus = async () => {
      try {
        const res = await fetch(
          `${crmEndpoint}&type=fr_button&email=${frEmail}`,
        );
        const data = await res.json();

        if (data?.reminder_id && data.reminder_id !== false) {
          setReminderId(data.reminder_id);
          setShowFirstReplyBtn(true);
        } else {
          setShowFirstReplyBtn(false);
          setReminderId(null);
        }
      } catch (err) {
        setShowFirstReplyBtn(false);
      }
    };

    fetchFRButtonStatus();
  }, [frEmail]);
  useEffect(() => {
    if (buttonsError) {
      toast.error(buttonsError);
      dispatch(quickActionBtnActions.clearErrors());
    }
  }, [dispatch, buttonsError, message]);
  if (searchNotFound) {
    return <NoSearchFoundPage />;
  }
  if (showIP) {
    return <Ip onClose={() => setShowIP(false)} />;
  }

  return (
    <>
      <MessageModal
        showMessageModal={showMessageModal}
        closeMessageModal={() => setShowMessageModal(false)}
        messageId={selectedMessage}
        email={email}
        threadId={threadId}
        viewEmail={viewEmail}
        count={count}
      />

      <div className="bg-white rounded-2xl shadow-sm min-h-[400px]">
        {(loading || unrepliedLoading) && <LoadingSkeleton />}
        {!loading && !unrepliedLoading && (
          <>
            <div className="flex flex-col p-6 border-b border-gray-200">
              <ContactHeader isMark={isMark} />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-3xl">
                {/* AI SUMMARY */}

                <MailerSummaryHeader />

                {/* Latest Message */}

                <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-4  overflow-y-auto custom-scrollbar shadow-sm">
                  <div className="flex flex-col gap-2 justify-center mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-yellow-700 font-semibold">
                          Latest Message
                        </h3>
                        <button
                          onClick={() =>
                            handleMove({ email, threadId, viewEmail })
                          }
                          className="relative rounded-xl bg-white border border-gray-200 shadow-md
               hover:shadow-lg hover:-translate-y-1 active:scale-95
               transition-all flex items-center justify-center"
                        >
                          <img
                            src="https://img.icons8.com/keek/100/new-post.png"
                            alt="new-post"
                            className="w-8 h-8"
                          />
                          {count > 0 && (
                            <span className="absolute -top-2 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                              {count}
                            </span>
                          )}
                        </button>
                      </div>

                      {viewEmail?.length > 0 && (
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
      ${
        viewEmail[viewEmail.length - 1].from_email === email
          ? "bg-green-100 text-green-700"
          : "bg-blue-100 text-blue-700"
      }
    `}
                        >
                          <Mail className="w-4 h-4" />

                          {viewEmail[viewEmail.length - 1].from_email === email
                            ? "Client Mail"
                            : "Our Mail"}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {viewEmail?.length > 0 && (
                        <>
                          <span className="text-xs text-gray-500">
                            {viewEmail[viewEmail.length - 1]?.date_created}{" "}
                            <br />
                          </span>
                          <span className="text-xs text-gray-500">
                            ({" "}
                            {viewEmail[viewEmail.length - 1]?.date_created_ago}{" "}
                            )<br />
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {viewEmailLoading ? (
                    <LoadingSkeleton
                      className="h-56"
                      count={1}
                      width="100%"
                      height="100%"
                    />
                  ) : (
                    <div
                      className={`text-gray-700 text-sm leading-relaxed whitespace-pre-line transition-all duration-300 ${
                        showMore ? "max-h-full" : "max-h-24 overflow-hidden"
                      }`}
                      dangerouslySetInnerHTML={{
                        __html:
                          viewEmail?.length > 0
                            ? viewEmail[viewEmail.length - 1]?.body_html
                              ? viewEmail[viewEmail.length - 1]?.body_html
                              : viewEmail[viewEmail.length - 1]?.body
                            : "No Message Found!",
                      }}
                    />
                  )}
                  {/* View Message Button */}
                  {viewEmail?.length > 0 &&
                    viewEmail[viewEmail.length - 1].message_id && (
                      <button
                        onClick={() =>
                          handleMessageClick(
                            viewEmail[viewEmail.length - 1]?.message_id,
                          )
                        }
                        className="text-blue-600 hover:text-blue-700 transition-opacity flex  p-2 cursor-pointer"
                        title="View Message"
                      >
                        view more...
                      </button>
                    )}

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex  gap-4 mt-4">
                    {/* AI Reply Button */}
                    <div className="flex flex-col items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() =>
                          handleMove({
                            email,
                            threadId,
                            reply: mailersSummary?.ai_response,
                            addActivity: true,
                          })
                        }
                        disabled={
                          sending ||
                          mailersSummary == null ||
                          mailersSummary?.ai_response?.trim() === ""
                        }
                      >
                        <img
                          width="30"
                          height="30"
                          src="https://img.icons8.com/ultraviolet/40/bot.png"
                          alt="AI Reply"
                        />
                      </motion.button>

                      {mailersSummary?.prompt_details && (
                        <button
                          onClick={() => {
                            navigate("/settings/debugging", {
                              state: {
                                prompt: mailersSummary.prompt_details[0],
                              },
                            });
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          <SparkleIcon size={20} />
                        </button>
                      )}
                    </div>

                    {/* Avatar Button */}
                    <div className="flex flex-col items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className="rounded-full bg-white shadow-md border border-gray-200 p-1"
                        onClick={() => {
                          dispatch(getAvatar());
                          setShowAvatar(true);
                        }}
                      >
                        <img
                          width="36"
                          height="36"
                          src="https://img.icons8.com/office/40/circled-play.png"
                          alt="Play AI Avatar"
                        />
                      </motion.button>

                      {mailersSummary?.prompt_details && (
                        <button
                          onClick={() => {
                            navigate("/settings/debugging", {
                              state: {
                                prompt: mailersSummary.prompt_details[0],
                              },
                            });
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <SparkleIcon size={20} />
                        </button>
                      )}
                    </div>

                    {buttonsLoading ? (
                      <LoadingChase size="30" />
                    ) : (
                      buttons?.map((btn, i) => (
                        <div
                          key={i}
                          className="relative group flex flex-col gap-2 items-center justify-center"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove({
                                email,
                                threadId,
                                reply:
                                  btn.name == "Ask Budget"
                                    ? askBudgetTemp[0]?.body_html
                                    : sorryTemp[0]?.body_html,
                              });
                            }}
                            disabled={sending}
                            className="
      flex items-center justify-center w-12 h-12
      bg-white rounded-xl shadow-md border border-gray-200
      hover:shadow-lg active:scale-95 hover:-translate-y-1
      transition-all
    "
                          >
                            {clickedActionBtn === btn.id && sending ? (
                              <LoadingChase size="20" />
                            ) : (
                              <img
                                src={btn.icon}
                                alt={btn.name}
                                className="w-8 h-8"
                              />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              navigate("/settings/templates", {
                                state: {
                                  templateId:
                                    btn.name == "Ask Budget"
                                      ? askBudgetTemp[0]?.id
                                      : sorryTemp[0]?.id,
                                },
                              })
                            }
                            className="text-cyan-600 hover:text-cyan-700"
                          >
                            <Pencil size={18} />
                          </button>

                          {/* TOOLTIP (layout-safe) */}
                          <div
                            dangerouslySetInnerHTML={{ __html: btn.body }}
                            className="
      pointer-events-none
      absolute top-full mt-2 left-1/2 -translate-x-1/2
      bg-black text-white text-xs px-2 py-1 rounded
      opacity-0 scale-95
      group-hover:opacity-100 group-hover:scale-100
      transition-all duration-200
      whitespace-nowrap shadow-lg z-50
    "
                          />
                        </div>
                      ))
                    )}
                    {showFirstReplyBtn && (
                      <>
                        {/* 🔥 SEND FIRST REPLY BUTTON (LAYOUT-SAFE) */}
                        <div
                          className={`flex items-center transition-opacity duration-200 ${
                            showFirstReplyBtn
                              ? "opacity-100"
                              : "opacity-0 pointer-events-none"
                          }`}
                        >
                          <div className="relative group flex items-center justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendFirstReply();
                              }}
                              disabled={frLoading}
                              className="
        flex items-center justify-center
        w-12 h-12
        bg-white rounded-xl shadow-md border border-gray-200
        hover:shadow-lg active:scale-95 hover:-translate-y-1
        transition-all
      "
                            >
                              <div className="w-6 h-6 flex items-center justify-center">
                                {frLoading ? (
                                  <LoadingChase size="20" />
                                ) : (
                                  <img
                                    src="https://img.icons8.com/color/48/reply.png"
                                    className="w-6 h-6"
                                    alt="first-reply"
                                  />
                                )}
                              </div>
                            </button>

                            {/* TOOLTIP (layout-safe) */}
                            <span
                              className="
        pointer-events-none
        absolute top-full mt-2 left-1/2 -translate-x-1/2
        bg-black text-white text-xs px-2 py-1 rounded
        opacity-0 scale-95
        group-hover:opacity-100 group-hover:scale-100
        transition-all duration-200
        whitespace-nowrap shadow-lg z-50
      "
                            >
                              Send First Reply
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {!(
                !mailersSummary || Object.keys(mailersSummary).length === 0
              ) && (
                <ActionButton
                  isMark={isMark}
                  handleMoveSuccess={handleMoveSuccess}
                  setShowIP={setShowIP}
                />
              )}
            </div>

            {ladger?.length > 0 ? (
              <TimelineEvent handleMessageClick={handleMessageClick} />
            ) : (
              <div className="py-[2%] px-[30%] ">
                <h1 className="font-mono text-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-2xl text-center text-white">
                  TIMELINE
                </h1>
                <p className="text-gray-700 text-sm text-center leading-relaxed mt-2">
                  No timeline events found.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {showAvatar && <Avatar setShowAvatar={setShowAvatar} onPlay={true} />}
    </>
  );
}

export default TimelinePage;
