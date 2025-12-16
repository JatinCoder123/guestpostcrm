import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { renderToStaticMarkup } from "react-dom/server";
import Create from "./Create";
import Preview from "./Preview";
import { excludeEmail, websiteLists } from "../assets/assets";
import { useParams, useLocation } from "react-router-dom";
import { createOffer, deleteOffer, getOffers, offersAction, updateOffer } from "../store/Slices/offers";
import { useNavigate } from "react-router-dom";
import { sendEmail, viewEmailAction } from "../store/Slices/viewEmail";
const fields = [
  { name: "website", label: "Website", type: "select", options: websiteLists },
  { name: "client_offer_c", label: "Client Offer", type: "number" },
  { name: "our_offer_c", label: "Our Offer", type: "number" },
]
export default function CreateOffer() {
  const { type, id } = useParams();
  const { state } = useLocation()
  const navigate = useNavigate()
  const { loading: sending, message: sendMessage, error: sendError } = useSelector((state) => state.viewEmail)
  const [currentOffers, setCurrentOffers] = useState([])
  const [newOffers, setNewOffers] = useState([{
    website: "",
    client_offer_c: "",
    our_offer_c: "",
    id: `${Date.now()}${Math.random()}`,
    email: state?.email,
  }])

  const dispatch = useDispatch()
  const { updating, error, offers, message, creating, deleting, deleteOfferId } = useSelector((state) => state.offers)
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
  const sendHandler = () => {
    dispatch(sendEmail(renderToStaticMarkup(
      <Preview
        data={currentOffers}
        type="Offers"
        userEmail={state?.email}
        websiteKey="website"
        amountKey="amount"
      />
    )))
  }
  const handleUpdate = (offer) => {
    dispatch(updateOffer(offer))

  }
  const handleDelete = (id) => {
    dispatch(deleteOffer(id))
  }
  const submitHandler = () => {
    dispatch(createOffer(newOffers));
  };


  useEffect(() => {
    if (message) {
      if (message.includes("Created")) {
        dispatch(getOffers())
        dispatch(sendEmail(renderToStaticMarkup(
          <Preview
            data={[...newOffers, ...currentOffers]}
            type="Offers"
            userEmail={state?.email}
            websiteKey="website"
            amountKey="our_offer_c"
          />
        ), "Offer Sent Successfully"))
      }
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


  return (
    <Create data={type == "create" ? newOffers : currentOffers} email={state?.email} deleting={deleting} deleteId={deleteOfferId} creating={creating} handleDelete={handleDelete} pageType={type} sending={sending} handleUpdate={handleUpdate} updating={updating} setData={type == "create" ? setNewOffers : setCurrentOffers} type="offers" submitData={submitHandler} sendHandler={sendHandler} fields={fields} amountKey={"our_offer_c"} renderPreview={({ data, email }) => (
      <Preview
        data={data}
        type="Offers"
        userEmail={email}
        websiteKey="website"
        amountKey="our_offer_c"
      />
    )} />
  );
}