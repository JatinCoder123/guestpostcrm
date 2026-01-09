import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import Create from "./Create";
import { excludeEmail } from "../assets/assets";
import { websiteLists } from "../assets/assets";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getOrders, orderAction, updateOrder } from "../store/Slices/orders";
import Preview from "./Preview";
import { sendEmail, viewEmailAction } from "../store/Slices/viewEmail";
import { renderToStaticMarkup } from "react-dom/server";
import { PageContext } from "../context/pageContext";
import { getLadgerWithOutLoading } from "../store/Slices/ladger";
import { ManualSideCall } from "../services/utils";
import { SocketContext } from "../context/SocketContext";
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
  const { type, id } = useParams();
  const { state } = useLocation();
  const {
    orders,
    updating,
    error,
    message,
    updateLinkMessage,
    creatingLinkMessage,
  } = useSelector((state) => state.orders);
  const { message: sendMessage, sending } = useSelector(
    (state) => state.viewEmail
  );
  const { crmEndpoint } = useSelector((state) => state.user);
  const { emails: unrepliedEmails } = useSelector((state) => state.unreplied);
  const { setNotificationCount } = useContext(SocketContext)
  const { enteredEmail, search } = useContext(PageContext)

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentOrders, setCurrentOrders] = useState([]);
  useEffect(() => {
    let order = orders.filter((o) => excludeEmail(o.real_name) == state?.email && !(o.order_status == "Wrong" || o.order_status == "Rejected-NonTechnical"));
    if (type == "edit" && id !== undefined) {
      order = order.filter((d) => d.id == id);
    }
    setCurrentOrders(() => [...order]);
  }, [state, orders, type, id]);
  const handleUpdate = (order) => {
    dispatch(updateOrder(order));
  };
  const handleDelete = (id) => {
    alert("Work in progress");
  };
  const sendHandler = () => {
    dispatch(
      sendEmail(
        renderToStaticMarkup(
          <Preview
            data={currentOrders}
            type="Orders"
            userEmail={state?.email}
            orderID="order_id"
            amountKey="total_amount_c"
          />
        ),
        "Order Send Successfully"
      )
    );
  };
  const okHandler = () => {
    if (enteredEmail) {
      dispatch(getLadgerWithOutLoading(enteredEmail, search));
    } else if (unrepliedEmails.length > 0) {
      const firstEmail = unrepliedEmails[0].from?.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0]
      dispatch(getLadgerWithOutLoading(firstEmail, search));
    } else {
      dispatch(getLadgerWithOutLoading(state?.email, search));
    }
  }
  useEffect(() => {
    if (message) {
      ManualSideCall(crmEndpoint, state?.email, message, 1, okHandler);
      dispatch(getOrders())
      dispatch(sendEmail(
        renderToStaticMarkup(
          <Preview
            data={currentOrders}
            type="Orders"
            userEmail={state?.email}
            websiteKey="website_c"
            amountKey="total_amount_c"
          />
        ),
        "Order Updated and Send Successfully", "Order Updated But Not Sent!"
      ));
      setNotificationCount((prev) => ({
        ...prev,
        refreshUnreplied: Date.now(),
      }));
      // toast.success(message);
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
      navigate(-2);
      dispatch(viewEmailAction.clearAllMessage());
    }

    if (updateLinkMessage) {
      toast.success(updateLinkMessage);
    }
    if (creatingLinkMessage) {
      toast.success(creatingLinkMessage);
    }
  }, [message, error, updateLinkMessage, sendMessage, creatingLinkMessage]);

  return (
    <Create
      data={currentOrders}
      validWebsite={websiteLists}
      email={state?.email}
      setData={setCurrentOrders}
      websiteKey="website_c"
      orderId="order_id"
      handleDelete={handleDelete}
      handleUpdate={handleUpdate}
      updating={updating}
      lists={lists}
      sending={sending}
      type="orders"
      sendHandler={sendHandler}
      fields={fields}
      renderPreview={({ data, email }) => (
        <Preview
          data={data}
          type="Orders"
          userEmail={email}
          orderId="order_id"
          amountKey="total_amount_c"
        />
      )}
      amountKey={"total_amount_c"}
      pageType={type}
    />
  );
}
