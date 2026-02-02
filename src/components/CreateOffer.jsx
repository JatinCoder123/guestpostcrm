import { useEffect, useState, useMemo, useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import Create from "./Create";
import Preview from "./Preview";
import { excludeEmail, unionByKey } from "../assets/assets";
import { useParams, useLocation } from "react-router-dom";
import {
  createOffer,
  deleteOffer,
  getOffers,
  offersAction,
  updateOffer,
} from "../store/Slices/offers";
import { useNavigate } from "react-router-dom";
import {
  getContact,
  getViewEmail,
  sendEmail,
  viewEmailAction,
} from "../store/Slices/viewEmail";
import { PageContext } from "../context/pageContext";
import { ManualSideCall } from "../services/utils";
import { SocketContext } from "../context/SocketContext";
import { getLadger } from "../store/Slices/ladger";
import { dealsAction } from "../store/Slices/deals";
import { PreviewTemplate } from "./PreviewTemplate";

export default function CreateOffer() {
  const { websites: websiteLists } = useSelector((state) => state.website);
  const fields = [
    { name: "website", label: "Website", type: "select", options: websiteLists },
    {
      name: "client_offer_c",
      label: "Client Offer",
      type: "number",
      disabled: false,
    },
    { name: "our_offer_c", label: "Our Offer", type: "number" },
  ];
  const { type, id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    sending,
    message: sendMessage,
    error: sendError,
  } = useSelector((state) => state.viewEmail);
  const { crmEndpoint } = useSelector((state) => state.user);

  const [currentOffers, setCurrentOffers] = useState([]);
  const { enteredEmail, search } = useContext(PageContext);
  const { setNotificationCount } = useContext(SocketContext);
  const [editorContent, setEditorContent] = useState("")
  const [validWebsite, setValidWebsite] = useState([]);
  const [newOffers, setNewOffers] = useState([
    {
      website: "",
      client_offer_c: "",
      our_offer_c: "",
      id: `${Date.now()}${Math.random()}`,
      email: state?.email,
    },
  ]);

  const dispatch = useDispatch();
  const {
    updating,
    error,
    offers,
    message,
    creating,
    deleting,
    deleteOfferId,
  } = useSelector((state) => state.offers);
  const { emails: unrepliedEmails } = useSelector((state) => state.unreplied);
  dispatch(dealsAction.clearAllMessages());

  useEffect(() => {
    let offer = offers.filter(
      (d) => excludeEmail(d.real_name ?? d.email) == state?.email
    )
    let valid = [];
    if (type == "create") {
      valid = websiteLists.filter(
        (w) => !offer.some((o) => o.website == w)
      );
    }
    if (type == "edit") {
      valid = websiteLists.filter((w) =>
        offer.some((o) => o.id == id || o.website !== w)
      );
    }
    setValidWebsite(valid);
    offer = type == "edit" ? offer : offer.filter((d) => d.offer_status == "active");
    if (type == "edit" && id !== undefined) {
      offer = offer.filter((d) => d.id == id);
    }
    setCurrentOffers(() => [...offer]);
  }, [state, offers, type, id]);
  useEffect(() => {
    if (type == "create" && !state) {
      navigate("/");
    }
  }, [state, type]);
  const sendHandler = () => {
    dispatch(
      sendEmail(
        renderToStaticMarkup(
          <Preview
            data={currentOffers}
            type="Offers"
            userEmail={state?.email}
            websiteKey="website"
            amountKey="our_offer_c"
          />
        ),
        "Offer Send Successfully"
      )
    );
  };
  const handleSubmit = () => {
    dispatch(
      sendEmail(
        editorContent, "Offer Send Successfully"
      )
    );
  };
  const handleUpdate = (offer, send) => {
    dispatch(updateOffer(offer, send));
  };
  const handleDelete = (id) => {
    dispatch(deleteOffer(id));
  };
  const submitHandler = (_, send = false) => {
    dispatch(createOffer(newOffers, send));
  };
  const okHandler = () => {
    if (enteredEmail) {
      dispatch(getLadger({ email: enteredEmail, search }));
    } else if (unrepliedEmails.length > 0) {
      const firstEmail =
        unrepliedEmails[0].from?.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0];
      dispatch(getLadger({ email: firstEmail, search }));
    } else {
      dispatch(getLadger({ email: state?.email, search }));
    }
  };

  useEffect(() => {
    if (message) {
      dispatch(getOffers({}));
      if (message.includes("Updated")) {
        ManualSideCall(crmEndpoint, state?.email, "Our Offer Updated Successfully", 1, okHandler);

        if (message.includes("Send")) {
          dispatch(
            sendEmail(
              renderToStaticMarkup(
                <Preview
                  data={[...currentOffers].filter(
                    (o) => o.website !== ""
                  )}
                  type="Offers"
                  userEmail={state?.email}
                  websiteKey="website"
                  amountKey="our_offer_c"
                />
              ),
              "Offer Updated and Send Successfully", "Offer Updated But Not Sent!"
            )
          );
          dispatch(offersAction.clearAllMessages());
        }
        else {
          toast.success(message);
          dispatch(offersAction.clearAllMessages());
          navigate(-1);
        }


      } else {
        ManualSideCall(crmEndpoint, state?.email, "Our Offer Created Successfully", 1, okHandler);
        if (message.includes("Send")) {
          const data = unionByKey(newOffers, currentOffers, "website");
          dispatch(
            sendEmail(
              renderToStaticMarkup(
                <Preview
                  data={data.filter(
                    (o) => o.website !== ""
                  )}
                  type="Offers"
                  userEmail={state?.email}
                  websiteKey="website"
                  amountKey="our_offer_c"
                />
              ),
              "Offer Craeted and Send Successfully", "Offer Created But Not Sent!"
            )
          );
        }
        setNewOffers([]);
        navigate("/");
        dispatch(offersAction.clearAllMessages());
      }
    }

    if (error) {
      toast.error(error);
      dispatch(offersAction.clearAllErrors());
    }

    if (sendMessage) {
      setNotificationCount((prev) => ({
        ...prev,
        refreshUnreplied: Date.now(),
      }));
      toast.success(sendMessage);
      dispatch(viewEmailAction.clearAllMessage());
      navigate("/");
    }

    if (sendError) {
      toast.error(sendError);
      dispatch(viewEmailAction.clearAllErrors());
    }
  }, [message, error, sendMessage, sendError]);

  return (
    <Create
      data={type == "create" ? newOffers : currentOffers}
      validWebsite={validWebsite}
      setValidWebsite={setValidWebsite}
      email={state?.email}
      deleting={deleting}
      deleteId={deleteOfferId}
      creating={creating}
      handleDelete={handleDelete}
      pageType={type}
      sending={sending}
      handleUpdate={handleUpdate}
      updating={updating}
      setData={type == "create" ? setNewOffers : setCurrentOffers}
      type="offers"
      submitData={submitHandler}
      sendHandler={sendHandler}
      fields={fields}
      amountKey={"our_offer_c"}
      renderPreview={({ data, email, onClose }) => {
        const html = renderToString(
          <Preview
            data={data}
            type="Offers"
            userEmail={email}
            websiteKey="website"
            amountKey="our_offer_c"
          />
        );

        return <PreviewTemplate editorContent={editorContent} initialContent={html} setEditorContent={setEditorContent} onClose={onClose} onSubmit={handleSubmit} loading={sending} />;
      }}

    />
  );
}
