import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getIpWithEmail, ladgerAction } from "../store/Slices/ladger";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Ip = () => {
  const { ipWithMails, ip, loading, error } = useSelector(
    (state) => state.ladger
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getIpWithEmail());
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(ladgerAction.clearAllErrors());
    }
  }, [error]);

  // Detect empty data
  const noData =
    !loading &&
    (!ipWithMails || !ipWithMails.records || ipWithMails.records.length === 0);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User IP Logs</h1>

      {/* EMAIL + RECORD COUNT */}
      {!loading && ipWithMails?.email && (
        <div className="mb-6 bg-white p-4 shadow rounded-xl border">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold">Email:</span> {ipWithMails.email}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Records Found:</span>{" "}
            {ipWithMails.records_found}
          </p>
        </div>
      )}

      {/* LOADING SKELETON */}
      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white p-4 rounded-xl shadow border"
            >
              <div className="h-4 w-1/3 bg-gray-300 rounded mb-3"></div>
              <div className="h-4 w-1/2 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {noData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center mt-20 text-center"
        >
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-xl font-semibold text-gray-700">
            No IP Records Found
          </h2>
          <p className="text-gray-500 mt-1">
            This user has no logged IP activity yet.
          </p>
        </motion.div>
      )}

      {/* IP RECORDS LIST */}
      {!loading && !noData && (
        <div className="space-y-5">
          {ipWithMails.records.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-5 rounded-xl shadow-md border hover:shadow-lg transition"
            >
              <p className="text-gray-800 text-lg font-semibold">
                IP: {item.ip}
              </p>
              <p className="text-gray-600">Email: {item.client_ids_c}</p>
              <p className="text-gray-600">
                Date: {new Date(item.date_entered).toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Ip;
