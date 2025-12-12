import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import Create from "./Create";
import { excludeEmail } from "../assets/assets";
import { websiteLists } from "../assets/assets";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { orderAction, updateOrder } from "../store/Slices/orders";
const fields = [
  { name: "website_c", label: "Website", type: "select", options: websiteLists },
  { name: "order_id", label: "Order Id", type: "text", disabled: true },
  { name: "total_amount_c", label: "Order Amount", type: "number" },
  { name: "order_status", label: "Order Status", type: "select", options: ["new", "in progress", "completed"] },
]
const lists = [
  { name: "invoice_link_c", label: "Invoice Link" },
  { name: "their_links", label: "Their Link" },
  { name: "our_link", label: "Our Link" },
]
export default function CreateOrder() {
  const { type, id } = useParams();
  const { state } = useLocation();
  const { orders, updating, error, message } = useSelector((state) => state.orders);
  const { contactInfo } = useSelector((state) => state.viewEmail)
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentOrders, setCurrentOrders] = useState([])
  useEffect(() => {
    let order = orders.filter(d => excludeEmail(d.real_name) == state?.email)
    if (type == "edit" && id !== undefined) {
      order = order.filter(d => d.id == id)
    }
    setCurrentOrders(() => [...order])
  }, [state, orders, type, id])
  const handleUpdate = (order) => {
    dispatch(updateOrder(order))
  }
  useEffect(() => {
    if (type == "create" && !state) {
      navigate("/")
    }
  }, [state, type])
  useEffect(() => {
    if (message) {
      toast.success(message)
      dispatch(orderAction.clearAllMessages())
      navigate(-1)
    }
    if (error) {
      toast.error(error)
      dispatch(orderAction.clearAllErrors())
    }
  }, [message, error, dispatch])

  return (
    <Create data={currentOrders} email={state?.email} setData={setCurrentOrders} websiteKey="website_c" handleUpdate={handleUpdate} updating={updating} preview={false} lists={lists} type="orders" fields={fields} amountKey={"total_amount_c"} pageType={type} />
  );
}
