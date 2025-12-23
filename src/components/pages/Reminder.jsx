import {
  Mail,
  CreditCard,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import Pagination from "../Pagination";
import { useState, useEffect, useCallback } from "react";
import { getOrderRem } from "../../store/Slices/orderRem";
import SearchComponent from "./SearchComponent";
import { toast } from "react-toastify";
import axios from "axios";
import { LoadingChase } from "../Loading";
 
export function ReminderPage() {
  const [topsearch, setTopsearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("pending"); // Default to "pending"
  const [selectedSort, setSelectedSort] = useState("");
  const dispatch = useDispatch();
  const [sendReminderLoading, setSendReminderLoading] = useState(false);
  const [sendReminderId, setSendReminderId] = useState(null);
 
  const { orderRem, dropdownOptions, count, loading, error } = useSelector(
    (state) => state.orderRem
  );
  
  // Create enhanced dropdown options with "Pending" filter
  const enhancedDropdownOptions = [
    { value: "all", label: "All Reminders" },
    { value: "pending", label: "Pending Reminders" }, // Added pending filter
    ...dropdownOptions // Original type filters
  ];
 
  const [reminders, setReminders] = useState([]);
 
  const { email } = useSelector((state) => state.ladger);
 
  async function sendReminder(reminderId) {
    setSendReminderLoading(true);
    setSendReminderId(reminderId);
 
    axios
      .get(
        `https://example.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=send_reminder&reminder_id=${reminderId}`
      )
      .then((res) => {
        if (res.data?.success) {
          toast.success("Reminder sent successfully");
          dispatch(getOrderRem());
        } else {
          toast.error(res.data?.message || "Failed to send reminder");
        }
      })
      .catch(() => {
        toast.error("Something went wrong while sending reminder");
      })
      .finally(() => {
        setSendReminderLoading(false);
        setSendReminderId(null);
      });
  }
 
  useEffect(() => {
    if (selectedCategory === "all" || selectedCategory === "pending") {
      dispatch(getOrderRem(null, 1));
    } else {
      dispatch(getOrderRem(email, 1));
    }
  }, [email, selectedCategory, dispatch]);
 
  useEffect(() => {
    // Filter reminders based on selected category
    let filteredReminders = [...orderRem];
    
    if (selectedCategory === "pending") {
      // Show only pending reminders
      filteredReminders = orderRem.filter(
        reminder => reminder.status.toLowerCase() === 'pending'
      );
    } else if (selectedCategory !== "all") {
      // Filter by reminder type
      filteredReminders = orderRem.filter(
        reminder => reminder.reminder_type === selectedCategory
      );
    }
    // If selectedCategory is "all", show all reminders
    
    setReminders(filteredReminders);
  }, [selectedCategory, orderRem]);
 
  const getDisplayLabel = (type) => {
    const option = enhancedDropdownOptions.find((option) => option.value === type);
    return option ? option.label : type;
  };
 
  // Calculate stats
  const pendingCount = orderRem.filter(order => 
    order.status.toLowerCase() === 'pending'
  ).length;
  
  const sentCount = orderRem.filter(order => 
    order.status.toLowerCase() === 'sent'
  ).length;
  
  const cancelledCount = orderRem.filter(order => 
    order.status.toLowerCase() === 'cancel'
  ).length;
 
  const filterOptions = [
    { value: "asc", label: "A to Z" },
    { value: "desc", label: "Z to A" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ];
 
  const handleFilterApply = (filters) => {
    console.log("Applied filters from popup:", filters);
  };
 
  const handleSearchChange = (value) => {
    setTopsearch(value);
  };
 
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };
 
  const handleSortChange = (value) => {
    setSelectedSort(value);
  };
 
  const handleDownload = () => {
    console.log("Download clicked");
  };
 
  return (
    <>
      <SearchComponent
        dropdownOptions={enhancedDropdownOptions} // Use enhanced options
        onDropdownChange={handleCategoryChange}
        selectedDropdownValue={selectedCategory} // Default to "pending"
        dropdownPlaceholder="Filter by Type"
        onSearchChange={handleSearchChange}
        searchValue={topsearch}
        searchPlaceholder="Search reminders..."
        onFilterApply={handleFilterApply}
        filterPlaceholder="Filters"
        showFilter={true}
        archiveOptions={[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
        transactionTypeOptions={[
          { value: "all", label: "All Reminders" },
          { value: "incoming", label: "Incoming" },
          { value: "outgoing", label: "Outgoing" },
        ]}
        currencyOptions={[
          { value: "all", label: "All" },
          { value: "usd", label: "USD" },
          { value: "eur", label: "EUR" },
        ]}
        onDownloadClick={handleDownload}
        showDownload={true}
        className="mb-6"
      />
 
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">All</p>
              <p className="text-2xl text-gray-900 mt-1">{orderRem.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Sent</p>
              <p className="text-2xl text-gray-900 mt-1">{sentCount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl text-gray-900 mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Cancelled</p>
              <p className="text-2xl text-gray-900 mt-1">{cancelledCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>
 
      {/* Payment Missed Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-red-600" />
            <h2 className="text-xl text-gray-900">
              {getDisplayLabel(selectedCategory)}
              {selectedCategory === "pending" && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {reminders.length} reminders
                </span>
              )}
            </h2>
            <a href="">
              <img
                width="30"
                height="30"
                src="https://img.icons8.com/offices/30/info.png"
                alt="info"
              />
            </a>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
                <th className="px-6 py-4 text-left">DATE</th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <span>CONTACT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">TYPE</th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <span>SCHEDULED TIME</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <span>STATUS</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : reminders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No {getDisplayLabel(selectedCategory)} found.
                    </p>
                  </td>
                </tr>
              ) : (
                reminders.map((order, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-gray-600">
                      {order.date_entered}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {order.real_name.split("<")[0].trim()}
                    </td>
                    <td className="px-6 py-4 text-red-600">
                      {order.reminder_type_label}
                    </td>
                    <td className="px-6 py-4 text-green-600">
                      {order.scheduled_time}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status.toLowerCase() === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : order.status.toLowerCase() === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center">
                      {sendReminderLoading && sendReminderId === order.id ? (
                        <LoadingChase size="20" color="blue" />
                      ) : (
                        <button
                          className={`px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm
                            ${
                              order.status === "Sent" ||
                              order.status === "cancel"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }
                          `}
                          onClick={() => sendReminder(order.id)}
                          disabled={
                            order.status === "Sent" || order.status === "cancel"
                          }
                        >
                          <img
                            width="34"
                            height="34"
                            src="https://img.icons8.com/arcade/64/send.png"
                            alt="send"
                          />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && reminders.length > 0 && (
          <Pagination slice={"orderRem"} fn={getOrderRem} />
        )}
      </div>
    </>
  );
}