import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { createDeal, dealsAction, deleteDeal, getDeals, updateDeal } from "../store/Slices/deals";
import { excludeEmail, websiteLists } from "../assets/assets";
import { renderToStaticMarkup } from "react-dom/server";
import Create from "./Create";
import Preview from "./Preview";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { sendEmail, viewEmailAction } from "../store/Slices/viewEmail";

const fields = [
  { name: "website_c", label: "Website", type: "select", options: websiteLists },
  { name: "dealamount", label: "Deal Amount", type: "number" },
]
export default function CreateDeal() {
  const { type, id } = useParams();
  const { state } = useLocation()
  const { deals, updating, error, message, creating, deleting, deleteDealId } = useSelector((state) => state.deals);
  const { loading: sending, message: sendMessage, error: sendError } = useSelector((state) => state.viewEmail);
  const [currentDeals, setCurrentDeals] = useState([])

  const [newDeals, setNewDeals] = useState([{
    website_c: "",
    dealamount: "",
    id: `${Date.now()}${Math.random()}`,
    email: state?.email,
  }])
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
    dispatch(createDeal(newDeals));
  };

  const sendHandler = () => {
    dispatch(sendEmail(renderToStaticMarkup(
      <Preview
        data={currentDeals}
        type="Deals"
        userEmail={state?.email}
        websiteKey="website_c"
        amountKey="dealamount"
      />
    ), "Deal Sent Successfully"))
  }
  const handleUpdate = (item) => {
    dispatch(updateDeal(item))
  }
  const handleDelete = (id) => {
    dispatch(deleteDeal(id))

  }
  useEffect(() => {
    if (type == "create" && !state) {
      navigate("/")
    }
  }, [state, type])
  useEffect(() => {
    if (message) {
      if (message.includes("Created")) {
        dispatch(getDeals())
        dispatch(sendEmail(renderToStaticMarkup(
          <Preview
            data={[...newDeals, ...currentDeals]}
            type="Deals"
            userEmail={state?.email}
            websiteKey="website_c"
            amountKey="dealamount"
          />
        ), "Deal Sent Successfully"))
      }
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

  return (
    <Create data={type == "create" ? newDeals : currentDeals} email={state?.email} deleting={deleting} deleteId={deleteDealId} pageType={type} handleDelete={handleDelete} websiteKey="website_c" handleUpdate={handleUpdate} updating={updating} creating={creating} sending={sending} setData={type == "create" ? setNewDeals : setCurrentDeals} sendHandler={sendHandler} amountKey={"dealamount"} type="deals" submitData={submitHandler} fields={fields} renderPreview={({ data, email }) => (
      <Preview
        data={data}
        type="Deals"
        userEmail={email}
        websiteKey="website_c"
        amountKey="dealamount"
      />
    )} />
  );
}