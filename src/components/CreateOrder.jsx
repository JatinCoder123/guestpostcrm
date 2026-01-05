import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import Create from "./Create";
import { excludeEmail } from "../assets/assets";
import { websiteLists } from "../assets/assets";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { orderAction, updateOrder } from "../store/Slices/orders";
import Preview from "./Preview";
import { sendEmail, viewEmailAction } from "../store/Slices/viewEmail";
import { renderToStaticMarkup } from "react-dom/server";
const fields = [
  {
    name: "website_c",
    label: "Website",
    type: "select",
    options: websiteLists,
  },
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
  const { contactInfo, message: sendMessage } = useSelector(
    (state) => state.viewEmail
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentOrders, setCurrentOrders] = useState([]);
  useEffect(() => {
    let order = orders.filter((d) => excludeEmail(d.real_name) == state?.email);
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
  // useEffect(() => {
  //   if (type == "create" && !state) {
  //     navigate("/");
  //   }
  // }, [state, type]);
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(orderAction.clearAllMessages());
      navigate(-1);
    }
    if (error) {
      toast.error(error);
      dispatch(orderAction.clearAllErrors());
    }
    if (sendMessage) {
      toast.success(sendMessage);
      dispatch(viewEmailAction.clearAllMessage());
      navigate(-1);
    }

    if (updateLinkMessage) {
      toast.success(updateLinkMessage);
    }
    if (creatingLinkMessage) {
      toast.success(creatingLinkMessage);
    }
  }, [message, error, updateLinkMessage,sendMessage, creatingLinkMessage]);

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
