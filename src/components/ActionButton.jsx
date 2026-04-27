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
import { getContact, viewEmailAction } from "../store/Slices/viewEmail";
import { getLadger } from "../store/Slices/ladger";
import { useNavigate } from "react-router-dom";
import { applyHashtag } from "../services/utils";

/* Memo numbers from CRM */
const MEMO = {
  marketplace: 1,
  favourite: 4,
  assign: 5,
  linkexchange: 6,
  stopfutureemails: 7,
};

/* Separator */
const Separator = () => <div className="h-6 w-[1px] bg-gray-600 mx-2" />;

const ActionButton = () => {
  const dispatch = useDispatch();

  const [showUsers, setShowUsers] = useState(false);
  const [stopLoading, setStopLoading] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const { enteredEmail } = useContext(PageContext);
  const { crmEndpoint } = useSelector((state) => state.user);

  const { contactInfo, accountInfo, threadId, editMessage, contactLoading } =
    useSelector((s) => s.viewEmail);
  const { sending, message, error } = useSelector((s) => s.threadEmail);
  const email = contactInfo?.email1;

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
  const navigate = useNavigate();
  const {
    adding,
    deleteMarketPlaceId,
    deleting,
    items: marketPlaces,
    error: markingError,
    message: markingMessage,
  } = useSelector((s) => s.marketplace);
  const isMark = marketPlaces.find((e) => e.name === contactInfo?.email1) ?? null
  /* highlight states from contactInfo */
  const isFavActive = contactInfo?.favorite === "1";
  const isExchangeActive = contactInfo?.exchange === "1";


  /* Helper to call applyHashtag util */
  const triggerHashtag = (memo_no, method = "GET") => {
    applyHashtag({
      domain: crmEndpoint,
      email: enteredEmail,
      memo_no,
      method,
    });
  };

  /* side effects */
  useEffect(() => {
    if (forwardError) {
      toast.error(forwardError);
      dispatch(forwardedAction.clearAllErrors());
    }

    if (forwardMessage) {
      toast.success(forwardMessage);
      dispatch(forwardedAction.clearAllMessages());
      dispatch(getForwardedEmails({ loading: false }));
    }

    if (favouriteError) {
      toast.error(favouriteError);
      dispatch(favAction.clearAllErrors());
    }

    if (favouriteMessage) {
      toast.success(favouriteMessage);
      dispatch(favAction.clearAllMessages());
      dispatch(getContact(contactInfo?.email1, true, false));
      dispatch(getFavEmails({ email: enteredEmail, loading: false }));
    }

    if (markingError) {
      toast.error(markingError);
      dispatch(marketplaceActions.clearErrors());
    }

    if (markingMessage) {
      toast.success(markingMessage);
      dispatch(marketplaceActions.clearMessage());
      dispatch(getContact(contactInfo?.email1, true, false));
    }

    if (changeMessage) {
      toast.success(changeMessage);
      dispatch(getContact(contactInfo?.email1, true, false));
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

    if (editMessage) {
      toast.success(editMessage);
      dispatch(viewEmailAction.clearAllMessage());
      dispatch(getContact(contactInfo?.email1, true, false));
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
    editMessage,
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
      action: () => navigate("/ip"),
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

    /* index 2 → MoveToDropdown placeholder */
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
      // GET when adding favourite, DELETE when removing
      action: () => {
        dispatch(favEmail(threadId));
        triggerHashtag(MEMO.favourite, isFavActive ? "DELETE" : "GET");
      },
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
      // hashtag fires inside handleForwardWithHashtag when user picks someone
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
      // GET when activating link exchange, DELETE when deactivating
      action: () => {
        dispatch(linkExchange(threadId));
        triggerHashtag(MEMO.linkexchange, isExchangeActive ? "DELETE" : "GET");
      },
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
      // GET when adding to marketplace, DELETE when removing
      action: () => {
        if (isMark) {
          dispatch(deleteMarketPlace(isMark?.id));
          triggerHashtag(MEMO.marketplace, "DELETE");
        } else {
          dispatch(addMarketPlace(email, contactInfo.type == "Brand"));
          triggerHashtag(MEMO.marketplace, "GET");
        }
      },
    },

    {
      icon: stopLoading ? (
        <LoadingChase />
      ) : (
        <CircleStop
          size={25}
          color={contactInfo?.is_stop === "1" ? "red" : "#eab308"}
        />
      ),
      label:
        contactInfo?.is_stop === "1" ? "Resume Emails" : "Stop Future Emails",
      // GET when stopping emails, DELETE when resuming
      action: async () => {
        setStopLoading(true);
        try {
          const newValue = contactInfo?.is_stop === "1" ? "0" : "1";
          const url = `${crmEndpoint}&type=force_stop&id=${contactInfo?.id}&new_value=${newValue}&user=${enteredEmail}`;
          const result = await fetch(url);
          const data = await result.json();
          console.log(data);

          dispatch(
            viewEmailAction.updateContactInfo({
              key: "is_stop",
            }),
          );

          // ✅ 🔥 ADD THIS LINE HERE
          dispatch(getContact(contactInfo?.email1, true, false));

          toast.success(
            newValue === "1"
              ? "Emails stopped successfully"
              : "Emails resumed successfully",
          );

          // GET when stopping (newValue "1"), DELETE when resuming (newValue s"0")
          triggerHashtag(
            MEMO.stopfutureemails,
            newValue === "1" ? "GET" : "DELETE",
          );
        } catch (err) {
          toast.error("Something went wrong");
        } finally {
          setStopLoading(false);
        }
      },
    },
  ];

  /* Assign handler — hashtag always GET since assign is a one-way action */
  const handleForwardWithHashtag = (id) => {
    dispatch(forwardEmail(contactInfo?.email1, id));
    triggerHashtag(MEMO.assign, "GET");
  };

  return (
    <>
      <div
        className="mt-4 flex items-center justify-center flex-wrap gap-10
  p-4 rounded-b-2xl
  bg-gradient-to-r from-cyan-50 via-orange-50 to-cyan-50
  border-t border-gray-300
  shadow-[0_8px_25px_rgba(0,0,0,0.08)]"
      >
        {actionButtons.map((btn, i) => (
          <div key={i} className="flex items-center gap-8 relative">
            {i == 2 ? (
              <>
                <MoveToDropdown
                  currentThreadId={threadId}
                  onMoveSuccess={() =>
                    dispatch(
                      getLadger({ email: contactInfo?.email1, loading: false }),
                    )
                  }
                />
                <Separator />
              </>
            ) : (
              <>
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
  ${btn.active ? "ring-2 ring-black/30" : ""}
  ${contactLoading && btn.label.includes("Emails") ? "opacity-60 pointer-events-none" : ""}
`}
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
                    forwardHandler={handleForwardWithHashtag}
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
