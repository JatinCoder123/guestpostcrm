import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { createDeal, dealsAction } from "../store/Slices/deals";
import { excludeEmail, websiteLists } from "../assets/assets";
import PreviewDeals from "./PreviewDeals";
import { sendEmailToThread } from "../store/Slices/threadEmail";
import { renderToStaticMarkup } from "react-dom/server";
import Create from "./Create";
import Preview from "./Preview";

const fields = [
  { name: "dealamount", label: "Deal Amount", type: "number" },
  { name: "status", label: "Status", type: "select", options: ["active", "inactive", "pending"] },
  { name: "website", label: "Website", type: "select", options: websiteLists },
]
export default function CreateDeal() {
  const { email } = useSelector((state) => state.ladger);
  const { deals } = useSelector((state) => state.deals);
  const { contactInfo } = useSelector((state) => state.viewEmail)
  const [currentDeals, setCurrentDeals] = useState([])
  useEffect(() => {
    const deal = deals.filter(d => excludeEmail(d.real_name) == email)
    setCurrentDeals(() => [...deal])
  }, [email, deals])
  const submitHandler = (totalAmount) => {
    // dispatch(dealsAction.UpdateDeals(currentDeals));
    // dispatch(createDeal(currentDeals));
    // if (contactInfo.thread_id) {
    //   dispatch(sendEmailToThread(contactInfo.thread_id, renderToStaticMarkup(
    //     <Preview
    //       data={currentDeals}
    //       type="Deals"
    //       totalAmount={totalAmount}
    //       userEmail={email}
    //     />
    //   )))
    // }
    alert("We're working on it. Please try again after some time.")
  };

  const [validWebsites, setValidWebsites] = useState([]);
  const fillEmptyWebsites = (arr) => {
    if (!arr || arr.length === 0) return arr;

    const used = new Set(arr.map((d) => d.website_c).filter(Boolean));
    const result = arr.map((d) => ({ ...d }));

    let siteIdx = 0;
    for (let i = 0; i < result.length; i++) {
      if (!result[i].website_c) {
        while (
          siteIdx < validWebsites.length &&
          used.has(validWebsites[siteIdx])
        ) {
          siteIdx++;
        }
        if (siteIdx < validWebsites.length) {
          result[i].website_c = validWebsites[siteIdx];
          used.add(validWebsites[siteIdx]);
          siteIdx++;
        }
      }
    }
    return result;
  };

  useEffect(() => {
    const available = websiteLists.filter((web) =>
      deals.every((deal) => deal.website_c !== web)
    );
    setValidWebsites(available);
  }, [deals]);

  return (
    <Create data={currentDeals} setData={setCurrentDeals} amountKey={"dealamount"} type="deals" validWebsites={validWebsites} submitData={submitHandler} fields={fields} renderPreview={({ data, totalAmount, email }) => (
      <Preview
        data={data}
        type="Deals"
        totalAmount={totalAmount}
        userEmail={email}
      />
    )} />
  );
}
