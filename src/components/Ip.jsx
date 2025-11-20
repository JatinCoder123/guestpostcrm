import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getIpWithEmail } from "../store/Slices/ladger";

const Ip = () => {
  const { ipWithMails, ip, loading, error } = useSelector(
    (state) => state.ladger
  );
  const dipatch = useDispatch();
  useEffect(() => {
    dipatch(getIpWithEmail());
  }, []);
  return <div>Ip</div>;
};

export default Ip;
