import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { sendEmailToThread } from "../store/Slices/threadEmail";
import { renderToStaticMarkup } from "react-dom/server";
import Create from "./Create";
import Preview from "./Preview";
import { excludeEmail, websiteLists } from "../assets/assets";

const fields = [
  { name: "amount", label: "Offer Amount", type: "number" },
  { name: "client_offer_c", label: "Client Offer", type: "number" },
  { name: "our_offer_c", label: "Our Offer", type: "number" },
  { name: "website", label: "Website", type: "select", options: websiteLists },
]
export default function CreateOffer() {
  const { email } = useSelector((state) => state.ladger);
  const { offers } = useSelector((state) => state.offers);
  const { contactInfo } = useSelector((state) => state.viewEmail)
  const [currentOffers, setCurrentOffers] = useState([])
  useEffect(() => {
    const offer = offers.filter(d => excludeEmail(d.real_name) == email)
    setCurrentOffers(() => [...offer])
  }, [email, offers])
  const submitHandler = (totalAmount) => {
    // dispatch(createDeal(currentOffers));
    // if (contactInfo.thread_id) {
    //   dispatch(sendEmailToThread(contactInfo.thread_id, renderToStaticMarkup(
    //     <Preview
    //       data={currentOffers}
    //       type="Offers"
    //       totalAmount={totalAmount}
    //       userEmail={email}
    //     />
    //   )))
    // }
    alert("We're working on it. Please try again after some time.")

  };

  return (
    <Create data={currentOffers} setData={setCurrentOffers} type="offers" submitData={submitHandler} fields={fields} amountKey={"amount"} renderPreview={({ data, totalAmount, email }) => (
      <Preview
        data={data}
        type="Offers"
        totalAmount={totalAmount}
        userEmail={email}
      />
    )} />
  );
}
