import React, { useContext, useEffect, useState } from "react";
import { useThreadContext } from "../hooks/useThreadContext";
import { useNavigate } from "react-router-dom";
import { CREATE_DEAL_API_KEY } from "../store/constants";
import useModule from "../hooks/useModule";
import { getDomain, getSafeHTML, showConsole } from "../assets/assets";
import { BiSolidMessageCheck } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { LoadingChase } from "./Loading";
import {
  HandCoins,
  Mail,
  Pencil,
  Play,
  SparkleIcon,
  ThumbsDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { SocketContext } from "../context/SocketContext";
import { BsRobot } from "react-icons/bs";
import { editContact, viewEmailAction } from "../store/Slices/viewEmail";
import { toast } from "react-toastify";
import EmojiInput from "./EmojiPicker";
const LatestMessage = ({ handleMessageClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleMove } = useThreadContext();
  const { crmEndpoint } = useSelector((state) => state.user);
  const [showFirstReplyBtn, setShowFirstReplyBtn] = useState(false);
  const [reminderId, setReminderId] = useState(null);
  const [frLoading, setFrLoading] = useState(false);
  const { mailersSummary } = useSelector((state) => state.ladger);
  const {
    buttons,
    error: buttonsError,
    loading: buttonsLoading,
  } = useSelector((s) => s.quickActionBtn);
  const { message, viewEmail, sending, count, contactInfo, accountInfo } =
    useSelector((state) => state.viewEmail);
  const hanldeConvDone = () => {
    dispatch(
      editContact(
        {
          contact: { ...contactInfo, conversation_complete: "1" },
          account: accountInfo,
        },
        null,
      ),
    );
    dispatch(
      viewEmailAction.compleConv({
        message: `Conversion Complete with ${contactInfo?.email1}`,
        sendedEmail: contactInfo?.email1,
      }),
    );
  };
  const email1 = contactInfo?.email1;
  const threadId = contactInfo?.thread_id;
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
  const handleSendFirstReply = async () => {
    if (!reminderId) return;

    try {
      setFrLoading(true);
      showConsole && console.log("First rply send button clicked");
      await fetch(
        `${crmEndpoint}&type=send_reminder&reminder_id=${reminderId}`,
      );
      dispatch(
        viewEmailAction.compleConv({
          message: `First reply sent successfully to ${contactInfo?.email1}`,
          sendedEmail: contactInfo?.email1,
        }),
      );
      setShowFirstReplyBtn(false);
    } catch (err) {
      console.error("Error sending first reply:", err);
      toast.error("Failed to send first reply");
    } finally {
      setFrLoading(false);
    }
  };
  useEffect(() => {
    if (!email1) return;

    const fetchFRButtonStatus = async () => {
      try {
        const res = await fetch(
          `${crmEndpoint}&type=fr_button&email=${email1}`,
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
  }, [email1]);

  useEffect(() => {
    if (buttonsError) {
      toast.error(buttonsError);
      dispatch(quickActionBtnActions.clearErrors());
    }
  }, [dispatch, buttonsError, message]);

  return (
    <>
      <div className=" flex flex-col justify-between bg-slate-50 rounded-3xl shadow-xl border border-slate-200 p-4  overflow-y-auto custom-scrollbar ">
        <div className="flex flex-col gap-2 justify-center mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-blue-700 font-semibold">Latest Message</h3>
              <button
                onClick={() =>
                  handleMove({ email: email1, threadId, viewEmail })
                }
                className="relative rounded-xl   shadow-md
               hover:shadow-lg hover:-translate-y-1 active:scale-95
               transition-all flex items-center justify-center cursor-pointer"
              >
                <img
                  width="44"
                  height="44"
                  src="https://img.icons8.com/keek/100/filled-message.png"
                  alt="filled-message"
                />{" "}
                {count > 0 && (
                  <span className="absolute -top-2 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            </div>

            {email1 && viewEmail?.length > 0 && (
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
      ${viewEmail[viewEmail.length - 1].from_email === email1
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                  }
    `}
              >
                <Mail className="w-4 h-4" />

                {viewEmail[viewEmail.length - 1].from_email === email1
                  ? "Client Mail"
                  : "Our Mail"}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {viewEmail?.length > 0 && (
              <>
                <span className="text-xs text-gray-500">
                  {viewEmail[viewEmail.length - 1]?.date_created} <br />
                </span>
                <span className="text-xs text-gray-500">
                  ( {viewEmail[viewEmail.length - 1]?.date_created_ago} )<br />
                </span>
              </>
            )}
          </div>
        </div>
        <div className="text-gray-700 font-medium bg-slate-200 p-2 rounded-lg text-sm">
          <div
            className=" leading-relaxed whitespace-pre-line transition-all duration-300 h-24 overflow-hidden"
            dangerouslySetInnerHTML={{
              __html:
                viewEmail?.length > 0
                  ? getSafeHTML(
                    viewEmail[viewEmail.length - 1]?.body_html ||
                    viewEmail[viewEmail.length - 1]?.body ||
                    "",
                  )
                  : "No Message Found!",
            }}
          />
          {/* View Message Button */}
          {viewEmail?.length > 0 &&
            viewEmail[viewEmail.length - 1].message_id && (
              <button
                onClick={() =>
                  handleMessageClick(
                    viewEmail[viewEmail.length - 1]?.message_id,
                  )
                }
                className="text-blue-600 hover:text-blue-700 transition-opacity flex  cursor-pointer  "
              >
                view more...
              </button>
            )}
        </div>

        <div className=" flex items-center justify-between rounded-2xl p-4 ">
          <div className="flex  gap-4 ">
            <QuickBtn
              icon={<BsRobot size={24} />}
              onClick={() =>
                handleMove({
                  email: email1,
                  threadId,
                  reply: mailersSummary?.ai_response,
                  addActivity: true,
                })
              }
              editIcon={<SparkleIcon size={16} />}
              disabled={sending || !mailersSummary?.ai_response}
              tooltip="AI Reply"
              onEditClick={() => {
                navigate("/settings/debugging", {
                  state: {
                    prompt: mailersSummary.prompt_details[0],
                  },
                });
              }}
            />
            <QuickBtn
              icon={<Play size={24} />}
              onClick={() => alert("Feature Coming Soon.")}
              editIcon={<SparkleIcon size={16} />}
              disabled={sending || !mailersSummary?.ai_response}
              tooltip="AI Summary"
              onEditClick={() => {
                navigate("/settings/debugging", {
                  state: {
                    prompt: mailersSummary.prompt_details[0],
                  },
                });
              }}
            />
            {buttonsLoading ? (
              <LoadingChase size="30" color="cyan" />
            ) : (
              buttons?.map((btn, i) => (
                <QuickBtn
                  key={i}
                  icon={
                    btn.name == "Ask Budget" ? <HandCoins /> : <ThumbsDown />
                  }
                  onClick={() =>
                    handleMove({
                      email: email1,
                      threadId,
                      reply:
                        btn.name == "Ask Budget"
                          ? askBudgetTemp[0]?.body_html
                          : sorryTemp[0]?.body_html,
                    })
                  }
                  tooltip={`${btn.body}`}
                  editIcon={<Pencil size={18} />}
                  onEditClick={() =>
                    navigate("/settings/templates", {
                      state: {
                        templateId:
                          btn.name == "Ask Budget"
                            ? askBudgetTemp[0]?.id
                            : sorryTemp[0]?.id,
                      },
                    })
                  }
                  disabled={sending}
                />
              ))
            )}
            {showFirstReplyBtn && (
              <div
                className={`flex items-center transition-opacity duration-200 ${showFirstReplyBtn
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
            )}
            <EmojiInput />

          </div>
          {contactInfo?.conversation_complete == "0" && (
            <div className="flex flex-col items-center gap-2 relative group">
              {/* Tooltip */}
              <div className="absolute -bottom-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-3 py-1 rounded-md ">
                Done Conversation
              </div>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="flex items-center justify-center bg-slate-600 hover:bg-green-700 cursor-pointer text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={hanldeConvDone}
              >
                <BiSolidMessageCheck className="w-6 h-6" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LatestMessage;

const LatestMessageSkeleton = () => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 shadow-sm animate-pulse">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <div className="w-32 h-4 bg-slate-200 rounded"></div>
        <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
      </div>

      {/* DATE */}
      <div className="flex gap-2 mb-3">
        <div className="w-24 h-3 bg-gray-200 rounded"></div>
        <div className="w-16 h-3 bg-gray-200 rounded"></div>
      </div>

      {/* MESSAGE */}
      <div className="space-y-2 mb-4">
        <div className="w-full h-3 bg-gray-200 rounded"></div>
        <div className="w-5/6 h-3 bg-gray-200 rounded"></div>
        <div className="w-4/6 h-3 bg-gray-200 rounded"></div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          ))}
        </div>

        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
};

function QuickBtn({
  icon,
  onClick,
  editIcon,
  onEditClick,
  tooltip,
  disabled = false,
}) {
  return (
    <div className="flex flex-col items-center gap-2 relative group">
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400 }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        disabled={disabled}
        className="flex items-center justify-center w-12 h-12
        bg-cyan-100 text-blue-600 rounded-xl shadow-md border border-gray-200 cursor-pointer
        hover:shadow-lg active:scale-95 hover:-translate-y-1
        transition-all"
      >
        {icon}
      </motion.button>

      {/* EDIT */}
      {editIcon && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditClick?.();
          }}
          className="text-blue-500 hover:text-blue-600 cursor-pointer"
        >
          {editIcon}
        </button>
      )}

      {/* TOOLTIP */}
      {tooltip && (
        <div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2
          bg-sky-600 text-white text-xs px-2 py-1 rounded
          opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
          transition-all whitespace-nowrap shadow-lg z-50"
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}
