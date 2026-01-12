import { useEffect, useState, useMemo, useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { renderToStaticMarkup } from "react-dom/server";
import Create from "./Create";
import Preview from "./Preview";
import { excludeEmail, websiteLists } from "../assets/assets";
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
export default function CreateOffer() {
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
  const [nonEditOffers, setNonEditOffers] = useState([]);
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

  useEffect(() => {
    let offer = offers.filter(
      (d) => excludeEmail(d.real_name ?? d.email) == state?.email
    ).filter((d) => d.offer_status == "active");
    if (type == "edit" && id !== undefined) {
      setNonEditOffers(offer.filter((d) => d.id !== id));
      offer = offer.filter((d) => d.id == id);
    }
    setCurrentOffers(() => [...offer]);
  }, [state, offers, type, id]);
  useEffect(() => {
    let valid = [];
    if (type == "create") {
      valid = websiteLists.filter(
        (w) => !currentOffers.some((o) => o.website == w)
      );
    }
    if (type == "edit") {
      valid = websiteLists.filter((w) =>
        currentOffers.some((o) => o.id == id || o.website !== w)
      );
    }
    setValidWebsite(valid);
  }, [currentOffers]);
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
  const handleUpdate = (offer) => {
    dispatch(updateOffer(offer));
  };
  const handleDelete = (id) => {
    dispatch(deleteOffer(id));
  };
  const submitHandler = () => {
    dispatch(createOffer(newOffers));
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
      ManualSideCall(crmEndpoint, state?.email, message, 1, okHandler);
      dispatch(getOffers());
      if (message.includes("Updated")) {
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
        setNewOffers([]);
      } else {
        dispatch(
          sendEmail(
            renderToStaticMarkup(
              <Preview
                data={[...newOffers, ...currentOffers].filter(
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
        setNewOffers([]);
      }

      // toast.success(message);
      dispatch(offersAction.clearAllMessages());
      // navigate(-1);
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
      renderPreview={({ data, email }) => (
        <Preview
          data={data}
          type="Offers"
          userEmail={email}
          websiteKey="website"
          amountKey="our_offer_c"
        />
      )}
    />
  );
}
