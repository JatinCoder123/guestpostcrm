import React, { useEffect, useState, useMemo, useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import {
  createDeal,
  dealsAction,
  deleteDeal,
  getDeals,
  updateDeal,
} from "../store/Slices/deals";
import { excludeEmail, websiteLists } from "../assets/assets";
import { renderToStaticMarkup } from "react-dom/server";
import Create from "./Create";
import Preview from "./Preview";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getContact,
  getViewEmail,
  sendEmail,
  viewEmailAction,
} from "../store/Slices/viewEmail";
import { PageContext } from "../context/pageContext";
import { ManualSideCall } from "../services/utils";
import { getLadger } from "../store/Slices/ladger";
import { SocketContext } from "../context/SocketContext";

const fields = [
  {
    name: "website_c",
    label: "Website",
    type: "select",
    options: websiteLists,
  },
  { name: "dealamount", label: "Deal Amount", type: "number" },
];
export default function CreateDeal() {
  const { type, id } = useParams();
  const { state } = useLocation();
  const { deals, updating, error, message, creating, deleting, deleteDealId } =
    useSelector((state) => state.deals);
  const { offers } = useSelector((state) => state.offers);
  const {
    sending,
    message: sendMessage,
    error: sendError,
  } = useSelector((state) => state.viewEmail);
  const { emails: unrepliedEmails } = useSelector((state) => state.unreplied);
  const { crmEndpoint } = useSelector((state) => state.user);
  const [validWebsite, setValidWebsite] = useState([]);
  const [currentDeals, setCurrentDeals] = useState([]);
  const [currentOffers, setCurrentOffers] = useState([]);
  const { enteredEmail, search } = useContext(PageContext);
  const [newDeals, setNewDeals] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setNotificationCount } = useContext(SocketContext);
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
    let deal = deals.filter(
      (d) => excludeEmail(d.real_name ?? d.email) == state?.email
    );
    if (type == "edit" && id !== undefined) {
      deal = deal.filter((d) => d.id == id);
    }
    setCurrentDeals(() => [...deal]);
    let offer = offers.filter(
      (d) => excludeEmail(d.real_name ?? d.email) == state?.email
    );
    setCurrentOffers(() => [...offer]);
  }, [state, deals, offers, type, id]);
  useEffect(() => {
    let valid = [];
    if (type == "create") {
      valid = websiteLists.filter(
        (w) => !currentDeals.some((d) => d.website_c == w)
      );
    }
    if (type == "edit") {
      valid = websiteLists.filter((w) =>
        currentDeals.some((d) => d.id == id || d.website_c !== w)
      );
    }
    setValidWebsite(valid);
  }, [currentDeals]);
  useEffect(() => {
    if (type == "create") {
      const currentOfferWithoutDeal =
        currentOffers.length > 0
          ? currentOffers.filter(
            (o) => !currentDeals.some((d) => d.website_c == o.website)
          )
          : [];
      if (currentOfferWithoutDeal.length > 0) {
        const newDeals = currentOfferWithoutDeal.map((offer) => ({
          website_c: offer.website,
          dealamount: offer.our_offer_c,
          id: `${Date.now()}${Math.random()}`,
          email: state?.email,
        }));
        setNewDeals(newDeals);
      } else
        setNewDeals([
          {
            website_c: "",
            dealamount: "",
            id: `${Date.now()}${Math.random()}`,
            email: state?.email,
          },
        ]);
    }
  }, [type, currentDeals]);
  const submitHandler = () => {
    dispatch(createDeal(newDeals));
  };

  const sendHandler = () => {
    dispatch(
      sendEmail(
        renderToStaticMarkup(
          <Preview
            data={currentDeals}
            type="Deals"
            userEmail={state?.email}
            websiteKey="website_c"
            amountKey="dealamount"
          />
        ),
        "Deal Send Successfully"
      )
    );
  };
  const handleUpdate = (item, shouldSend) => {
    dispatch(updateDeal(item, shouldSend));
  };
  const handleDelete = (id) => {
    dispatch(deleteDeal(id));
  };
  useEffect(() => {
    if (type == "create" && !state) {
      navigate("/");
    }
  }, [state, type]);
  useEffect(() => {
    if (message) {
      dispatch(getDeals());
      if (message.includes("Updated")) {
        ManualSideCall(crmEndpoint, state?.email, "Our Deal Updated Successfully", 2, okHandler);

        if (message.includes("Send")) {
          dispatch(
            sendEmail(
              renderToStaticMarkup(
                <Preview
                  data={[...currentDeals]}
                  type="Deals"
                  userEmail={state?.email}
                  websiteKey="website_c"
                  amountKey="dealamount"
                />
              ),
              "Deal Updated and Send Successfully", "Deal Updated But Not Sent!"
            )
          );
          dispatch(dealsAction.clearAllMessages());

        }
        else {
          toast.success(message);
          dispatch(dealsAction.clearAllMessages());
          navigate(-1);

        }

      } else {
        ManualSideCall(crmEndpoint, state?.email, "Our Deal Created Successfully", 2, okHandler);

        dispatch(
          sendEmail(
            renderToStaticMarkup(
              <Preview
                data={[...newDeals, ...currentDeals]}
                type="Deals"
                userEmail={state?.email}
                websiteKey="website_c"
                amountKey="dealamount"
              />
            ),
            "Deal Created and Send Successfully", "Deal Created But Not Sent!"
          )
        );
        setNewDeals([]);
        dispatch(dealsAction.clearAllMessages());

      }
    }
    if (error) {
      toast.error(error);
      dispatch(dealsAction.clearAllErrors());
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
  }, [message, error, dispatch, sendError, sendMessage]);

  return (
    <Create
      data={type == "create" ? newDeals : currentDeals}
      validWebsite={validWebsite}
      email={state?.email}
      deleting={deleting}
      deleteId={deleteDealId}
      pageType={type}
      handleDelete={handleDelete}
      websiteLists={websiteLists}
      websiteKey="website_c"
      handleUpdate={handleUpdate}
      updating={updating}
      creating={creating}
      sending={sending}
      setData={type == "create" ? setNewDeals : setCurrentDeals}
      sendHandler={sendHandler}
      amountKey={"dealamount"}
      type="deals"
      submitData={submitHandler}
      fields={fields}
      renderPreview={({ data, email }) => (
        <Preview
          data={data}
          type="Deals"
          userEmail={email}
          websiteKey="website_c"
          amountKey="dealamount"
        />
      )}
    />
  );
}
