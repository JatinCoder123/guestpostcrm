import {
  Mail,
  Calendar,
  User,
  FileText,
  MessageSquare,
  LeafyGreen,
  BarChart,
  Repeat,
  EqualApproximatelyIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getAllHot } from "../../store/Slices/hotSlice";
import { useContext } from "react";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { extractEmail } from "../../assets/assets";
import { LoadingChase } from "../Loading";

export function HotPage() {
  const { currentHot } = useContext(PageContext);
  const { hots, loading, error, count } = useSelector((state) => state.hot);
  const dispatch = useDispatch();
  const { setEnteredEmail, setWelcomeHeaderContent } =
    useContext(PageContext);
  const navigateTo = useNavigate();

  useEffect(() => {
    dispatch(getAllHot());
  }, [currentHot]);



  return (
    <>


      {/* Unanswered Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Hot Events</h2>
            <a
              href="https://www.guestpostcrm.com/blog/unreplied-and-unanswered-emails-in-guestpostcrm/"
              target="_blank"
            >
              <img
                width="30"
                height="30"
                src="https://img.icons8.com/offices/30/info.png"
                alt="info"
              />
            </a>
          </div>
          <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full">
            {count} Hot
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>CREATED AT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>CONTACT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>DESCRIPTION</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <BarChart className="w-4 h-4" />
                    <span>TYPE</span>
                  </div>
                </th>
              </tr>
            </thead>
            {!loading ? (
              <tbody>
                {hots?.map((email, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div
                        className="flex items-center gap-2 text-gray-600"
                        onClick={() => {
                          const input = extractEmail(email.email);
                          localStorage.setItem("email", input);
                          setEnteredEmail(input);
                          setWelcomeHeaderContent("Hot");
                          navigateTo("/");
                        }}
                      >
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{email?.date_entered}</span>
                      </div>
                    </td>

                    <td
                      className="px-6 py-4 text-gray-900"
                      onClick={() => {
                        const input = extractEmail(email.email);
                        localStorage.setItem("email", input);
                        setEnteredEmail(input);
                        setWelcomeHeaderContent("Hot");
                        navigateTo("/contacts");
                      }}
                    >
                      {email?.name}
                    </td>

                    <td
                      className="px-6 py-4 text-gray-700"
                      onClick={() => {
                        const input = extractEmail(email.email);
                        localStorage.setItem("email", input);
                        setEnteredEmail(input);
                        setWelcomeHeaderContent("Hot");
                        navigateTo("/");
                      }}
                    >
                      {email.description}
                    </td>
                    <td
                      className="px-6 py-4 text-purple-600"
                      onClick={() => {
                        const input = extractEmail(email.email);
                        localStorage.setItem("email", input);
                        setEnteredEmail(input);
                        setWelcomeHeaderContent("Hot");
                        navigateTo("/");
                      }}
                    >
                      {email.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={4}>
                    <div className="flex justify-center items-center py-10">
                      <LoadingChase />
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
        {hots.length === 0 && (
          <div className="p-12 text-center">
            <EqualApproximatelyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No Hot Notifications yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
