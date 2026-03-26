import { useEffect, useState, useMemo, useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { excludeEmail, unionByKey } from "../assets/assets";
import { useParams, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
export default function ThreadOffers() {


  const { type, id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    updating,
    error,
    offers,
    message,
    creating,
    deleting,
    deleteOfferId,
  } = useSelector((state) => state.offers);
  const { deals } = useSelector((state) => state.deals);

  useEffect(() => {
    let offer = offers.filter(
      (d) => excludeEmail(d.real_name ?? d.email) == state?.email,
    );
    let deal = deals.filter(
      (d) => excludeEmail(d.real_name ?? d.email) == state?.email,
    );
    setCurrentOffers(() => [...offer]);
  }, [state, offers, type, id]);

  return (
    <div>Thread Offers</div>
  );
}