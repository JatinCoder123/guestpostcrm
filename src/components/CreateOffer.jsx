import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { renderToStaticMarkup } from "react-dom/server";
import Create from "./Create";
import Preview from "./Preview";
import { excludeEmail, websiteLists } from "../assets/assets";
import { useParams, useLocation } from "react-router-dom";
import { createOffer, offersAction, updateOffer } from "../store/Slices/offers";
import { useNavigate } from "react-router-dom";
import { sendEmail, viewEmailAction } from "../store/Slices/viewEmail";

export default function CreateOffer() {
  const { type, id } = useParams();
  const { state } = useLocation()
  const navigate = useNavigate()
  const { loading: sending, message: sendMessage, error: sendError } = useSelector((state) => state.viewEmail)
  const [currentOffers, setCurrentOffers] = useState([])
  const [newOffers, setNewOffers] = useState([])
  const [validWebsites, setValidWebsites] = useState(websiteLists);
  const fields = [
    { name: "website", label: "Website", type: "select", options: validWebsites },
    { name: "amount", label: "Offer Amount", type: "number" },
    { name: "client_offer_c", label: "Client Offer", type: "number" },
    { name: "our_offer_c", label: "Our Offer", type: "number" },
  ]
  const dispatch = useDispatch()
  const { updating, error, offers, message, creating } = useSelector((state) => state.offers)
  useEffect(() => {
    let offer = offers.filter(d => excludeEmail(d.real_name ?? d.email) == state?.email)
    if (type == "edit" && id !== undefined) {
      offer = offer.filter(d => d.id == id)
    }
    setCurrentOffers(() => [...offer])
  }, [state, offers, type, id])
  useEffect(() => {
    if (type == "create" && !state) {
      navigate("/")
    }
  }, [state, type])
  const sendHandler = (totalAmount) => {
    dispatch(sendEmail(renderToStaticMarkup(
      <Preview
        data={currentOffers}
        type="Offers"
        totalAmount={totalAmount}
        userEmail={state?.email}
        websiteKey="website"
        amountKey="amount"
      />
    )))
  }
  const handleUpdate = (offer) => {
    dispatch(updateOffer(offer))
  }
  const submitHandler = () => {
    dispatch(createOffer(newOffers))
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
    if (sendMessage) {
      toast.success(sendMessage)
      dispatch(viewEmailAction.clearAllMessage())
      navigate(-1)

    }
    if (sendError) {
      toast.error(sendError)
      dispatch(viewEmailAction.clearAllErrors())
    }
  }, [message, error, dispatch, sendMessage, sendError])
  useEffect(() => {
    const available = websiteLists.filter((web) =>
      offers.every((offer) => offer.website !== web)
    );
    setValidWebsites(available);
  }, [offers]);

  return (
    <Create data={type == "create" ? newOffers : currentOffers} email={state?.email} creating={creating} pageType={type} sending={sending} handleUpdate={handleUpdate} updating={updating} setData={type == "create" ? setNewOffers : setCurrentOffers} type="offers" submitData={submitHandler} sendHandler={sendHandler} fields={fields} amountKey={"amount"} validWebsites={validWebsites} renderPreview={({ data, totalAmount, email }) => (
      <Preview
        data={data}
        type="Offers"
        totalAmount={totalAmount}
        userEmail={email}
        websiteKey="website"
        amountKey="amount"
      />
    )} />
  );
}