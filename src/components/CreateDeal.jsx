import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { createDeal, dealsAction, updateDeal } from "../store/Slices/deals";
import { excludeEmail, websiteLists } from "../assets/assets";
import { renderToStaticMarkup } from "react-dom/server";
import Create from "./Create";
import Preview from "./Preview";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { sendEmail, viewEmailAction } from "../store/Slices/viewEmail";


export default function CreateDeal() {
  const { type, id } = useParams();
  const { state } = useLocation()
  const { deals, updating, error, message, creating } = useSelector((state) => state.deals);
  const { loading: sending, message: sendMessage, error: sendError } = useSelector((state) => state.viewEmail);
  const [currentDeals, setCurrentDeals] = useState([])
  const [validWebsites, setValidWebsites] = useState([]);
  const fields = [
    { name: "website_c", label: "Website", type: "select", options: validWebsites },
    { name: "dealamount", label: "Deal Amount", type: "number" },
    { name: "status", label: "Status", type: "select", options: ["active", "inactive", "pending"] },
  ]
  const [newDeals, setNewDeals] = useState([])
  const navigate = useNavigate()
  const dispatch = useDispatch()
  useEffect(() => {
    let deal = deals.filter(d => excludeEmail(d.real_name ?? d.email) == state?.email)
    if (type == "edit" && id !== undefined) {
      deal = deal.filter(d => d.id == id)
    }
    setCurrentDeals(() => [...deal])
  }, [state, deals, type, id])
  const submitHandler = () => {
    dispatch(createDeal(newDeals))
  };
  const sendHandler = (totalAmount) => {
    dispatch(sendEmail(renderToStaticMarkup(
      <Preview
        data={currentDeals}
        type="Deals"
        totalAmount={totalAmount}
        userEmail={state?.email}
        websiteKey="website_c"
        amountKey="dealamount"
      />
    )))
  }
  const handleUpdate = (item) => {
    dispatch(updateDeal(item))
  }
  useEffect(() => {
    if (type == "create" && !state) {
      navigate("/")
    }
  }, [state, type])
  useEffect(() => {
    if (message) {
      toast.success(message)
      dispatch(dealsAction.clearAllMessages())
      navigate(-1)
    }
    if (error) {
      toast.error(error)
      dispatch(dealsAction.clearAllErrors())

    }
    if (sendMessage) {
      toast.success(sendMessage)
      dispatch(viewEmailAction.clearAllMessage())
      navigate(-1)

    }
    if (sendError) {
      toast.error(sendError)
      dispatch(viewEmailAction.clearAllErrors())
    }
  }, [message, error, dispatch, sendError, sendMessage])
  useEffect(() => {
    const available = websiteLists.filter((web) =>
      [...currentDeals, ...newDeals].every((deal) => deal.website_c !== web)
    );
    setValidWebsites(available);
  }, [currentDeals, newDeals]);
  return (
    <Create data={type == "create" ? newDeals : currentDeals} email={state?.email} pageType={type} websiteKey="website_c" handleUpdate={handleUpdate} updating={updating} creating={creating} sending={sending} setData={type == "create" ? setNewDeals : setCurrentDeals} sendHandler={sendHandler} amountKey={"dealamount"} type="deals" submitData={submitHandler} validWebsites={validWebsites} fields={fields} renderPreview={({ data, totalAmount, email }) => (
      <Preview
        data={data}
        type="Deals"
        totalAmount={totalAmount}
        userEmail={email}
        websiteKey="website_c"
        amountKey="dealamount"
      />
    )} />
  );
}