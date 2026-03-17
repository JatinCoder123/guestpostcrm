import { Globe, Mail, Heart, Link, CircleStop } from "lucide-react";
import Loading, { LoadingChase } from "./Loading";
import UserDropdown from "./UserDropDown";
import MoveToDropdown from "./MoveToDropdown";
import { useDispatch, useSelector } from "react-redux";
import {
  favAction,
  favEmail,
  getFavEmails,
} from "../store/Slices/favEmailSlice";
import {
  forwardEmail,
  forwardedAction,
  getForwardedEmails,
} from "../store/Slices/forwardedEmailSlice";
import { toast } from "react-toastify";
import { useContext, useEffect, useState } from "react";
import { addEvent } from "../store/Slices/eventSlice";
import { PageContext } from "../context/pageContext";
import { linkExchange, linkExchangeaction } from "../store/Slices/linkExchange";
import { getTags, applyTag } from "../store/Slices/markTagSlice";
import { threadEmailAction } from "../store/Slices/threadEmail";
import { MdOutlineHome } from "react-icons/md";
import {
  addMarketPlace,
  deleteMarketPlace,
  marketplaceActions,
} from "../store/Slices/Marketplace";
import { viewEmailAction, editContact } from "../store/Slices/viewEmail";

/* Separator */
const Separator = () => <div className="h-6 w-[1px] bg-gray-600 mx-2" />;

const ActionButton = ({ handleMoveSuccess, setShowIP, isMark }) => {
  const dispatch = useDispatch();

  const [showUsers, setShowUsers] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const { enteredEmail } = useContext(PageContext);

  const { contactInfo, accountInfo, count, threadId } = useSelector(
    (s) => s.viewEmail,
  );
  const { sending, message, error } = useSelector((s) => s.threadEmail);
  const { email } = useSelector((s) => s.ladger);

  const {
    forward,
    error: forwardError,
    message: forwardMessage,
  } = useSelector((s) => s.forwarded);

  const {
    exchanging,
    error: changeError,
    message: changeMessage,
  } = useSelector((s) => s.linkExchange);

  const {
    favourite,
    error: favouriteError,
    message: favouriteMessage,
  } = useSelector((s) => s.fav);

  const { tags, loading: tagLoading } = useSelector((s) => s.markTag);

  const {
    adding,
    deleteMarketPlaceId,
    deleting,
    items: marketPlaces,
    error: markingError,
    message: markingMessage,
  } = useSelector((s) => s.marketplace);

  /* highlight states from contactInfo */
  const isFavActive = contactInfo?.favorite === "1";
  const isExchangeActive = contactInfo?.exchange === "1";

  const handleForward = (email, id) => {
    dispatch(forwardEmail(email, id));
  };

  /* side effects */
  useEffect(() => {
    if (forwardError) {
      toast.error(forwardError);
      dispatch(forwardedAction.clearAllErrors());
    }

    if (forwardMessage) {
      toast.success(forwardMessage);
      dispatch(
        addEvent({
          email,
          thread_id: threadId,
          recent_activity: "forwarded",
        }),
      );
      dispatch(forwardedAction.clearAllMessages());
      dispatch(getForwardedEmails({ loading: false }));
    }

    if (favouriteError) {
      toast.error(favouriteError);
      dispatch(favAction.clearAllErrors());
    }

    if (favouriteMessage) {
      toast.success(favouriteMessage);
      dispatch(
        addEvent({
          email,
          thread_id: threadId,
          recent_activity: favouriteMessage,
        }),
      );
      dispatch(favAction.clearAllMessages());
      dispatch(viewEmailAction.updateContactInfo({ key: "favorite" }));

      dispatch(getFavEmails({ email: enteredEmail, loading: false }));
    }

    if (markingError) {
      toast.error(markingError);
      dispatch(marketplaceActions.clearErrors());
    }

    if (markingMessage) {
      toast.success(markingMessage);
      dispatch(
        addEvent({
          email,
          thread_id: threadId,
          recent_activity: markingMessage,
        }),
      );
      dispatch(marketplaceActions.clearMessage());
    }

    if (changeMessage) {
      toast.success(changeMessage);
      dispatch(
        addEvent({
          email,
          thread_id: threadId,
          recent_activity: "link exchange status changed",
        }),
      );
      dispatch(viewEmailAction.updateContactInfo({ key: "exchange" }));
      dispatch(linkExchangeaction.clearAllMessages());
    }

    if (changeError) {
      toast.error(changeError);
      dispatch(linkExchangeaction.clearAllErrors());
    }

    if (error) {
      toast.error(error);
      dispatch(threadEmailAction.clearAllErrors());
    }

    if (message) {
      dispatch(threadEmailAction.clearAllMessage());
    }
  }, [
    dispatch,
    forwardError,
    forwardMessage,
    favouriteError,
    favouriteMessage,
    markingError,
    markingMessage,
    changeError,
    changeMessage,
    sending,
    email,
    threadId,
    enteredEmail,
  ]);

  const actionButtons = [
    {
      icon: (
        <img
          width="30"
          height="30"
          src="https://img.icons8.com/fluency/48/ip-address.png"
          alt="ip-address"
        />
      ),
      label: "IP",
      action: () => setShowIP(true),
    },
    {
      icon: (
        <img
          src="https://img.icons8.com/color/48/tags--v1.png"
          className="w-6 h-6"
          alt="tag"
        />
      ),
      label: "Mark Tag",
      action: () => {
        setShowTags((p) => !p);
        dispatch(getTags());
      },
    },
    {},

    {
      icon: favourite ? (
        <LoadingChase />
      ) : (
        <Heart size={25} color={isFavActive ? "white" : "#dc2626"} />
      ),
      label: "Favourite",
      active: isFavActive,
      activeProps: {
        color: "#dc2626",
        fill: "#f74050",
      },
      action: () => dispatch(favEmail(threadId)),
    },

    {
      icon: forward ? (
        <LoadingChase />
      ) : (
        <img
          src="https://img.icons8.com/color/48/redo.png"
          className="w-6 h-6"
          alt="forward"
        />
      ),
      label: "Assign",
      action: () => setShowUsers((p) => !p),
    },

    {
      icon: exchanging ? (
        <LoadingChase />
      ) : (
        <Link size={25} color={isExchangeActive ? "white" : "#2563eb"} />
      ),
      label: "Link Exchange",
      active: isExchangeActive,
      activeProps: {
        color: "#2563eb",
        fill: "#313cb5",
      },
      action: () => dispatch(linkExchange(threadId)),
    },
    {
      icon:
        adding || (deleting && deleteMarketPlaceId == isMark?.id) ? (
          <LoadingChase />
        ) : (
          <MdOutlineHome size={25} color={isMark ? "white" : "#d40d8b"} />
        ),

      label: isMark ? "Remove From MarketPlace" : "Add To MarketPlace",
      active: isMark,
      activeProps: {
        color: "#ea580c",
        fill: "#d40d8b",
      },
      action: () =>
        dispatch(
          isMark
            ? deleteMarketPlace(isMark.id)
            : addMarketPlace(email, contactInfo.type == "Brand"),
        ),
    },
    {
      icon: <CircleStop size={25} color="red" />,
      label: "Stop Future Emails",
      action: () => {
        if (!contactInfo) return;

        dispatch(
          editContact({
            contact: {
              ...contactInfo,
              customer_type: "rejected",
            },
            account: accountInfo || {},
          }),
        );
      },
    },
  ];

  return (
    <>
      {/* <hr className="mt-4 border-gray-500" /> */}

      <div
        className="mt-6 flex items-center justify-center flex-wrap gap-10
  px-8 py-5 rounded-2xl
  bg-gradient-to-r from-cyan-50 via-orange-50 to-cyan-50
  border-t border-gray-300
  shadow-[0_8px_25px_rgba(0,0,0,0.08)]"
      >
        {" "}
        {actionButtons.map((btn, i) => (
          <div key={i} className="flex items-center  gap-8 relative">
            {i == 2 ? (
              <>
                <MoveToDropdown
                  currentThreadId={threadId}
                  onMoveSuccess={handleMoveSuccess}
                />
                <Separator />
              </>
            ) : (
              <>
                {" "}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    btn.action();
                  }}
                  style={
                    btn.active
                      ? {
                          backgroundColor: btn.activeProps.fill,
                          color: btn.activeProps.color,
                          transform: "translateY(-2px) scale(1.09)",
                          boxShadow:
                            "0 8px 18px rgba(0,0,0,0.45), inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.4)",
                        }
                      : {}
                  }
                  className={`group flex items-center cursor-pointer justify-center w-12 h-12
  rounded-xl border border-gray-300
  bg-gray-100
  shadow-md
  hover:shadow-xl hover:-translate-y-1
  active:scale-95
  transition-all duration-200
  ${btn.active ? "ring-2 ring-black/30" : ""}`}
                >
                  {btn.icon}

                  <span
                    className="absolute -bottom-9 left-1/2 -translate-x-1/2
    bg-black text-white text-xs px-2 py-1 rounded
    opacity-0 group-hover:opacity-100
    transition-all whitespace-nowrap shadow-lg z-20"
                  >
                    {btn.label}
                  </span>
                </button>
                {showUsers && btn.label === "Assign" && (
                  <UserDropdown
                    forwardHandler={handleForward}
                    onClose={() => setShowUsers(false)}
                  />
                )}
                {showTags && btn.label === "Mark Tag" && (
                  <div className="absolute top-14 right-0 w-60 z-40">
                    <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
                      {tagLoading ? (
                        <div className="py-6 flex justify-center">
                          <LoadingChase />
                        </div>
                      ) : (
                        tags.map((tag) => (
                          <button
                            key={tag.name}
                            onClick={() => {
                              dispatch(applyTag(tag.name));
                              setShowTags(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm font-semibold
                        text-gray-700 border-b last:border-b-0
                        hover:bg-indigo-50 hover:text-indigo-600 transition"
                          >
                            {tag.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
                {i !== actionButtons.length - 1 && <Separator />}
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ActionButton;
