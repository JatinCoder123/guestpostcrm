import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { sendEmailToThread } from "../store/Slices/threadEmail";
import { renderToStaticMarkup } from "react-dom/server";
import Create from "./Create";
import Preview from "./Preview";
import { excludeEmail } from "../assets/assets";
import { websiteLists } from "../assets/assets";
const fields = [
  { name: "order_id", label: "Order Id", type: "text", disabled: true },
  { name: "total_amount_c", label: "Order Amount", type: "number" },
  { name: "order_status", label: "Order Status", type: "select", options: ["new", "in progress", "completed"] },
  { name: "website_c", label: "Website", type: "select", options: websiteLists },
]
const lists = [
  { name: "invoice_link_c", label: "Invoice Link" },
  { name: "their_links", label: "Their Link" },
  { name: "our_link", label: "Our Link" },
]
export default function CreateOrder() {
  const { email } = useSelector((state) => state.ladger);
  const { orders } = useSelector((state) => state.orders);
  const { contactInfo } = useSelector((state) => state.viewEmail)
  const [currentOrders, setCurrentOrders] = useState([])
  useEffect(() => {
    const order = orders.filter(d => excludeEmail(d.real_name) == email)
    setCurrentOrders(() => [...order])
  }, [email, orders])
  const submitHandler = (totalAmount) => {
    // dispatch(offersAction.UpdateOffers(currentOffers));
    alert("We're working on it. Please try again after some time.")

  };

  return (
    <Create data={currentOrders} setData={setCurrentOrders} preview={false} lists={lists} type="orders" submitData={submitHandler} fields={fields} amountKey={"total_amount_c"} />
  );
}
