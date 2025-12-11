import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { sendEmailToThread } from "../store/Slices/threadEmail";
import { renderToStaticMarkup } from "react-dom/server";
import Create from "./Create";
import Preview from "./Preview";
import { excludeEmail, websiteLists } from "../assets/assets";
import { useParams, useLocation } from "react-router-dom";
import { offersAction, updateOffer } from "../store/Slices/offers";
import { useNavigate } from "react-router-dom";
const fields = [
  { name: "amount", label: "Offer Amount", type: "number" },
  { name: "client_offer_c", label: "Client Offer", type: "number" },
  { name: "our_offer_c", label: "Our Offer", type: "number" },
  { name: "website", label: "Website", type: "select", options: websiteLists },
]
export default function CreateOffer() {
  const { type, id } = useParams();
  const { state } = useLocation()
  const navigate = useNavigate()
  const { contactInfo } = useSelector((state) => state.viewEmail)
  const [currentOffers, setCurrentOffers] = useState([])
  const dispatch = useDispatch()
  const { updating, error, offers, message } = useSelector((state) => state.offers)
  useEffect(() => {
    let offer = offers.filter(d => excludeEmail(d.real_name) == state.email)
    if (type == "edit" && id !== undefined) {
      offer = offer.filter(d => d.id == id)
    }
    setCurrentOffers(() => [...offer])
  }, [state.email, offers, type, id])
  const submitHandler = (totalAmount) => {
    alert("We're working on it. Please try again after some time.")

  };
  const handleUpdate = (offer) => {
    dispatch(updateOffer(offer))
  }

  useEffect(() => {
    if (message) {
      toast.success(message)
      dispatch(offersAction.clearAllMessages())
      navigate(-1)
    }
    if (error) {
      toast.error(error)
      dispatch(offersAction.clearAllErrors())
    }
  }, [message, error, dispatch])

  return (
    <Create data={currentOffers} email={state.email} pageType={type} handleUpdate={handleUpdate} updating={updating} setData={setCurrentOffers} type="offers" submitData={submitHandler} fields={fields} amountKey={"amount"} renderPreview={({ data, totalAmount, email }) => (
      <Preview
        data={data}
        type="Offers"
        totalAmount={totalAmount}
        userEmail={email}
      />
    )} />
  );
}
