import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import Create from "./Create";
import { excludeEmail, showConsole } from "../assets/assets";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createOrder,
  createOrder2,
  getOrders,
  orderAction,
  updateOrder,
} from "../store/Slices/orders";
import { createPreviewOrder } from "./PreviewOrder";
import { sendEmail, viewEmailAction } from "../store/Slices/viewEmail";
import { PageContext } from "../context/pageContext";
import { getLadger } from "../store/Slices/ladger";
import { ManualSideCall } from "../services/utils";
import { SocketContext } from "../context/SocketContext";
import { PreviewTemplate } from "./PreviewTemplate";
import useModule from "../hooks/useModule";
import { CREATE_DEAL_API_KEY } from "../store/constants";
const fields = [
  { name: "order_id", label: "Order Id", type: "text", disabled: true },
  { name: "total_amount_c", label: "Order Amount", type: "number" },
  { name: "order_status", label: "Order Status", type: "select" },
  {
    name: "invoice_link_c",
    label: "Invoice Link",
    type: "text",
    disabled: true,
  },
];
const lists = [
  { name: "our_link", label: "Our Link" },
  { name: "their_links", label: "Their Link" },
];
export default function CreateOrder() {
  const { websites: websiteLists } = useSelector((state) => state.website);
  const { type, id } = useParams();
  const { state } = useLocation();
  const {
    orders,
    updating,
    error,
    message,
    updateLinkMessage,
    creating,
    updateId,
    creatingLinkMessage,
  } = useSelector((state) => state.orders);
  const { message: sendMessage, sending } = useSelector(
    (state) => state.viewEmail,
  );
  const { crmEndpoint } = useSelector((state) => state.user);
  const { emails: unrepliedEmails } = useSelector((state) => state.unreplied);
  const [currentOrderSend, setCurrentOrderSend] = useState(null);
  const { setNotificationCount } = useContext(SocketContext);
  const { enteredEmail, search } = useContext(PageContext);
  const [editorContent, setEditorContent] = useState(null);
  const [newOrder, setNewOrder] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [currentOrders, setCurrentOrders] = useState([]);
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
        name: "OrderORG",
      },
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: "TemplateData",
  });
  useEffect(() => {
    let order = orders.filter(
      (o) =>
        excludeEmail(o.real_name) == state?.email &&
        !(
          (o.order_status == "wrong" ||
            o.order_status == "rejected_nontechnical" ||
            o.order_status == "completed") &&
          type != "edit"
        ),
    );
    if (type == "edit" && id !== undefined) {
      order = order.filter((d) => d.id == id);
    }
    setCurrentOrders(() => [...order]);
  }, [state, orders, type, id]);
  const handleUpdate = (order, send) => {
    if (
      order?.order_status == "rejected_nontechnical" ||
      order?.order_status == "wrong"
    ) {
      order = {
        ...order,
        seo_backlinks: order.seo_backlinks.map((link) => ({
          ...link,
          status_c: "rejected",
        })),
      };
    }
    dispatch(updateOrder(order, send));
    setCurrentOrderSend(order);
  };
  const handleCreate = (order, send) => {
    dispatch(createOrder2(state?.email, order, send));
    setCurrentOrderSend(order);
  };
  const handleDelete = (id) => {
    alert("Work in progress");
  };
  const sendHandler = () => { };
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
  const handleSubmit = () => {
    dispatch(
      sendEmail(
        editorContent,
        "Order Send Successfully",
        null,
        null,
        state?.threadId,
      ),
    );
  };
  useEffect(() => {
    if (message) {
      dispatch(getOrders({}));

      ManualSideCall(
        crmEndpoint,
        state?.email,
        `Our Order ${message.includes("Created") ? "Created" : "Updated"} Successfully`,
        1,
        okHandler,
      );

      if (message.includes("Send")) {
        setShowPreview(true);
      } else {
        toast.success(message);
      }
      navigate("/orders/view", {
        state: {
          email: state?.email,
          threadId: state?.threadId,
        },
      });
      dispatch(orderAction.clearAllMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(orderAction.clearAllErrors());
    }
    if (sendMessage) {
      setNotificationCount((prev) => ({
        ...prev,
        refreshUnreplied: Date.now(),
      }));
      toast.success(sendMessage);
      navigate("/");
      dispatch(viewEmailAction.clearAllMessage());
    }

    if (updateLinkMessage) {
      dispatch(getOrders({}));

      toast.success(updateLinkMessage);
    }
    if (creatingLinkMessage) {
      toast.success(creatingLinkMessage);
    }
  }, [message, error, updateLinkMessage, sendMessage, creatingLinkMessage]);

  return (
    <Create
      data={type == "orders" ? newOrder : currentOrders}
      submitData={handleCreate}
      validWebsite={websiteLists}
      email={state?.email}
      setData={type == "orders" ? setNewOrder : setCurrentOrders}
      websiteKey="website_c"
      orderId="order_id"
      handleDelete={handleDelete}
      handleUpdate={handleUpdate}
      setCurrentOrderSend={setCurrentOrderSend}
      updating={updating}
      creating={creating}
      lists={lists}
      threadId={state?.threadId}
      showPreview={showPreview}
      setShowPreview={setShowPreview}
      sending={sending}
      type="orders"
      sendHandler={sendHandler}
      fields={fields}
      renderPreview={({ data, email, onClose }) => {
        showConsole && console.log(currentOrderSend);
        const html = createPreviewOrder({
          templateData,
          order: currentOrderSend,
          userEmail: email,
        });
        return (
          <PreviewTemplate
            editorContent={editorContent}
            initialContent={html}
            setEditorContent={setEditorContent}
            templateContent={html}
            onClose={onClose}
            threadId={state?.threadId}
            onSubmit={handleSubmit}
            loading={sending}
          />
        );
      }}
      amountKey={"total_amount_c"}
      pageType={type}
    />
  );
}
