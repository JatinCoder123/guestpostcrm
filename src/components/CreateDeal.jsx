import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { createDeal, dealsAction, updateDeal } from "../store/Slices/deals";
import { excludeEmail, websiteLists } from "../assets/assets";
import PreviewDeals from "./PreviewDeals";
import { sendEmailToThread } from "../store/Slices/threadEmail";
import { renderToStaticMarkup } from "react-dom/server";
import Create from "./Create";
import Preview from "./Preview";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const fields = [
  { name: "dealamount", label: "Deal Amount", type: "number" },
  { name: "status", label: "Status", type: "select", options: ["active", "inactive", "pending"] },
  { name: "website", label: "Website", type: "select", options: websiteLists },
]
export default function CreateDeal() {
  const { type, id } = useParams();
  const { state } = useLocation()
  const { deals, updating, error, message } = useSelector((state) => state.deals);
  const [currentDeals, setCurrentDeals] = useState([])
  const navigate = useNavigate()
  const dispatch = useDispatch()
  useEffect(() => {
    let deal = deals.filter(d => excludeEmail(d.real_name) == state.email)
    if (type == "edit" && id !== undefined) {
      deal = deal.filter(d => d.id == id)
    }
    setCurrentDeals(() => [...deal])
  }, [state.email, deals, type, id])
  const submitHandler = () => {
    alert("We're working on it. Please try again after some time.")
  };
  const handleUpdate = (item) => {
    dispatch(updateDeal(item))
  }
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
  }, [message, error, dispatch])
  return (
    <Create data={currentDeals} email={state.email} pageType={type} handleUpdate={handleUpdate} updating={updating} setData={setCurrentDeals} amountKey={"dealamount"} type="deals" validWebsites={validWebsites} submitData={submitHandler} fields={fields} renderPreview={({ data, totalAmount, email }) => (
      <Preview
        data={data}
        type="Deals"
        totalAmount={totalAmount}
        userEmail={email}
      />
    )} />
  );
}


// const fillEmptyWebsites = (arr) => {
//     if (!arr || arr.length === 0) return arr;

//     const used = new Set(arr.map((d) => d.website_c).filter(Boolean));
//     const result = arr.map((d) => ({ ...d }));

//     let siteIdx = 0;
//     for (let i = 0; i < result.length; i++) {
//       if (!result[i].website_c) {
//         while (
//           siteIdx < validWebsites.length &&
//           used.has(validWebsites[siteIdx])
//         ) {
//           siteIdx++;
//         }
//         if (siteIdx < validWebsites.length) {
//           result[i].website_c = validWebsites[siteIdx];
//           used.add(validWebsites[siteIdx]);
//           siteIdx++;
//         }
//       }
//     }
//     return result;
//   };

//  const [validWebsites, setValidWebsites] = useState([]);


//   useEffect(() => {
//     const available = websiteLists.filter((web) =>
//       deals.every((deal) => deal.website_c !== web)
//     );
//     setValidWebsites(available);
//   }, [deals]);