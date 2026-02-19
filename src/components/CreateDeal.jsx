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
import { excludeEmail, unionByKey } from "../assets/assets";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import Create from "./Create";
import { buildTable } from "./Preview";
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
import { getOffers } from "../store/Slices/offers";
import { PreviewTemplate } from "./PreviewTemplate";
import useModule from "../hooks/useModule";
import { CREATE_DEAL_API_KEY } from "../store/constants";
import Preview from "./Preview";
import useIdle from "../hooks/useIdle";

export default function CreateDeal() {
  const { websites: websiteLists } = useSelector((state) => state.website);
  const { crmEndpoint } = useSelector((state) => state.user);
  const fields = [
    {
      name: "website_c",
      label: "Website",
      type: "select",
      options: websiteLists,
    },
    { name: "dealamount", label: "Deal Amount", type: "number" },
  ];
  const { type, id } = useParams();
  const { state } = useLocation();

  useIdle({ idle: false })
  const {
    loading: templateLoading,
    data: templateData,
    error: templateError,
  } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: {
      module: "EmailTemplates",
      where: {
        name: "DealORG",
      },
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: "TemplateData",
  });
  const { deals, updating, error, message, creating, deleting, deleteDealId } =
    useSelector((state) => state.deals);
  const { offers } = useSelector((state) => state.offers);
  const {
    sending,
    message: sendMessage,
    error: sendError,
  } = useSelector((state) => state.viewEmail);
  const { emails: unrepliedEmails } = useSelector((state) => state.unreplied);
  const [validWebsite, setValidWebsite] = useState([]);
  const [currentDeals, setCurrentDeals] = useState([]);
  const [newDealsCreated, setNewDealsCreated] = useState([]);
  const [currentOffers, setCurrentOffers] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const [editorContent, setEditorContent] = useState("");

  const { enteredEmail, search } = useContext(PageContext);
  const [newDeals, setNewDeals] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setNotificationCount } = useContext(SocketContext);
  const okHandler = () => {
    if (enteredEmail) {
      dispatch(getLadger({ email: enteredEmail, search }));
    } else if (unrepliedEmails?.length > 0) {
      const firstEmail =
        unrepliedEmails[0].from?.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0];
      dispatch(getLadger({ email: firstEmail, search }));
    } else {
      dispatch(getLadger({ email: state?.email, search }));
    }
  };
  useEffect(() => {
    let deal = deals.filter(
      (d) => excludeEmail(d.real_name ?? d.email) == state?.email,
    );
    if (type == "edit" && id !== undefined) {
      deal = deal.filter((d) => d.id == id);
    }
    setCurrentDeals(() => [...deal]);
    let offer = offers.filter(
      (d) =>
        excludeEmail(d.real_name ?? d.email) == state?.email &&
        d.offer_status == "active",
    );
    setCurrentOffers(() => [...offer]);
  }, [state, deals, offers, type, id]);
  useEffect(() => {
    let valid = [];
    if (type == "create") {
      valid = websiteLists.filter(
        (w) => !currentDeals.some((d) => d.website_c == w),
      );
    }
    if (type == "edit") {
      valid = websiteLists.filter((w) =>
        currentDeals.some((d) => d.id == id || d.website_c !== w),
      );
    }
    setValidWebsite(valid);
  }, [currentDeals]);
  useEffect(() => {
    if (type == "create") {
      const currentOfferWithoutDeal =
        currentOffers?.length > 0
          ? currentOffers.filter(
            (o) => !currentDeals.some((d) => d.website_c == o.website),
          )
          : [];
      if (currentOfferWithoutDeal?.length > 0) {
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
  const submitHandler = (data, send = false) => {
    setNewDealsCreated(data);

    dispatch(createDeal(state?.threadId, data, send));
  };

  const sendHandler = () => {
    dispatch(
      sendEmail(
        {
          reply: renderToStaticMarkup(
            <Preview
              templateData={templateData}
              data={currentDeals}
              type="Deals"
              userEmail={state?.email}
              websiteKey="website_c"
              amountKey="dealamount"
            />,
          ),
          message: "Deal Send Successfully",
          threadId: state?.threadId

        }
      ),
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
  const handleSubmit = () => {
    dispatch(
      sendEmail(
        {
          reply: editorContent,
          message: "Deal Send Successfully",
          threadId: state?.threadId,
        }
      ),
    );
  };
  useEffect(() => {
    if (message) {
      if (message.includes("Updated")) {
        ManualSideCall(
          crmEndpoint,
          state?.email,
          "Our Deal Updated Successfully",
          2,
          okHandler,
        );
        if (message.includes("Send")) {
          navigate("/deals/view", {
            state: { email: state?.email, threadId: state?.threadId },
          });
          setShowPreview(true);
        } else {
          toast.success(message);
          navigate("/");
        }
      } else {
        ManualSideCall(
          crmEndpoint,
          state?.email,
          "Our Deal Created Successfully",
          2,
          okHandler,
        );
        if (message.includes("Send")) {
          const data = unionByKey(newDealsCreated, currentDeals, "website_c");
          console.log("DATA", data);
          navigate("/deals/view", {
            state: { email: state?.email, threadId: state?.threadId },
          });
          setShowPreview(true);
        }
        setNewDeals([]);
      }
      dispatch(dealsAction.clearAllMessages());

      dispatch(getDeals({ email: state?.email }));
      dispatch(getOffers({ email: state?.email }));
    }
    if (error) {
      toast.error(error);
      dispatch(dealsAction.clearAllErrors());
    }
    if (sendMessage) {
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
      setNewDealsCreated={setNewDealsCreated}
      websiteLists={websiteLists}
      websiteKey="website_c"
      handleUpdate={handleUpdate}
      updating={updating}
      creating={creating}
      sending={sending}
      threadId={state?.threadId}
      setData={type == "create" ? setNewDeals : setCurrentDeals}
      sendHandler={sendHandler}
      amountKey={"dealamount"}
      type="deals"
      submitData={submitHandler}
      fields={fields}
      showPreview={showPreview}
      setShowPreview={setShowPreview}
      renderPreview={({ data, email, onClose }) => {
        let html = templateData?.[0]?.body_html || "";
        const tableHtml = buildTable(data, "Deals", "website_c", "dealamount");

        html = html
          .replace("{{USER_EMAIL}}", email)
          .replace("{{TABLE}}", tableHtml);

        return (
          <PreviewTemplate
            editorContent={editorContent}
            initialContent={html}
            templateContent={html}
            setEditorContent={setEditorContent}
            onClose={onClose}
            threadId={state?.threadId}
            onSubmit={handleSubmit}
            loading={sending}
          />
        );
      }}
    />
  );
}
