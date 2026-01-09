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
import { useLocation, useSearchParams, useParams, useNavigate } from "react-router-dom";
import { excludeEmail } from "../../assets/assets";
import { ViewReminder } from "../ViewReminder";

export function ReminderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate()
  const [topsearch, setTopsearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("pending");
  const dispatch = useDispatch();
  const [open, setOpen] = useState(true)
  const [sendReminderLoading, setSendReminderLoading] = useState(false);
  const [sendReminderId, setSendReminderId] = useState(null);

  const { orderRem, dropdownOptions, count, loading, error } = useSelector(
    (state) => state.orderRem
  );
  const { crmEndpoint } = useSelector(
    (state) => state.user
  );

  // Create enhanced dropdown options with "Pending" filter
  const enhancedDropdownOptions = [
    { value: "all", label: "All Reminders" },
    { value: "pending", label: "Pending Reminders" },
    ...dropdownOptions // Original type filters
  ];

  const [reminders, setReminders] = useState([]);

  const { email } = useSelector((state) => state.ladger);

  // Check for URL filter parameter on component mount
  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter) {
      // Decode the filter from URL
      const decodedFilter = decodeURIComponent(urlFilter);


      // Find matching option from dropdown
      let matchingOption = enhancedDropdownOptions.find(option =>
        option.value.toLowerCase() === decodedFilter.toLowerCase() ||
        option.label.toLowerCase().includes(decodedFilter.toLowerCase()) ||
        decodedFilter.toLowerCase().includes(option.value.toLowerCase())
      );

      if (!matchingOption) {
        // Try to match by converting underscores to spaces
        const filterWithSpaces = decodedFilter.replace(/_/g, ' ');
        matchingOption = enhancedDropdownOptions.find(option =>
          option.value.toLowerCase() === filterWithSpaces.toLowerCase() ||
          option.label.toLowerCase().includes(filterWithSpaces.toLowerCase())
        );

        if (matchingOption) {

          setSelectedCategory(matchingOption.value);
        } else {

          setSelectedCategory(decodedFilter);
        }
      } else {

        setSelectedCategory(matchingOption.value);
      }

      // Clear the URL parameter after applying
      searchParams.delete('filter');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  async function sendReminder(reminderId) {
    setSendReminderLoading(true);
    setSendReminderId(reminderId);

    axios
      .get(
        `${crmEndpoint}&type=send_reminder&reminder_id=${reminderId}`
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
    if (state?.email) {
      dispatch(getOrderRem(state.email, 1));
    }
    else if (selectedCategory === "all" || selectedCategory === "pending") {
      dispatch(getOrderRem(null, 1));
    } else {
      dispatch(getOrderRem(email, 1));
    }
  }, [email, state?.email, selectedCategory, dispatch]);

  // Function to normalize reminder type for comparison
  const normalizeType = (type) => {
    if (!type) return '';
    return type.toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  useEffect(() => {
    let filteredReminders = [...orderRem];

    if (selectedCategory === "pending") {
      filteredReminders = orderRem.filter(
        reminder => reminder.status.toLowerCase() === 'pending'
      );

    } else if (selectedCategory !== "all") {
      // Normalize the selected category
      const normalizedSelectedCategory = normalizeType(selectedCategory);


      // Filter by reminder type
      filteredReminders = orderRem.filter(reminder => {
        const reminderType = reminder.reminder_type || '';
        const reminderTypeLabel = reminder.reminder_type_label || '';

        // Normalize both for comparison
        const normalizedReminderType = normalizeType(reminderType);
        const normalizedReminderTypeLabel = normalizeType(reminderTypeLabel);


        // Check for matches
        const matchesType = normalizedReminderType.includes(normalizedSelectedCategory) ||
          normalizedSelectedCategory.includes(normalizedReminderType);

        const matchesLabel = normalizedReminderTypeLabel.includes(normalizedSelectedCategory) ||
          normalizedSelectedCategory.includes(normalizedReminderTypeLabel);

        return matchesType || matchesLabel;
      });



      // If no matches found with type filtering, show pending of all types
      if (filteredReminders.length === 0) {

        filteredReminders = orderRem.filter(
          reminder => reminder.status.toLowerCase() === 'pending'
        );
      }
    }

    // Apply search filter if any
    if (topsearch) {
      const searchLower = topsearch.toLowerCase();
      filteredReminders = filteredReminders.filter(reminder =>
        reminder.real_name?.toLowerCase().includes(searchLower) ||
        reminder.reminder_type?.toLowerCase().includes(searchLower) ||
        reminder.reminder_type_label?.toLowerCase().includes(searchLower)
      );
    }
    setReminders(filteredReminders);
  }, [selectedCategory, orderRem, state?.email, topsearch]);

  const getDisplayLabel = (type) => {


    // Handle URL filter types that might not be in dropdown
    if (type && type.includes('_')) {
      const label = type.replace(/_/g, ' ') + ' Reminders';

      return label;
    }

    const option = enhancedDropdownOptions.find((option) =>
      option.value === type ||
      option.label.toLowerCase().includes(type?.toLowerCase() || '')
    );

    const result = option ? option.label : (type || 'All Reminders');

    return result;
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


  const handleFilterApply = (filters) => {

  };

  const handleSearchChange = (value) => {
    setTopsearch(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };
  const handleDownload = () => {
  };

  // Check if we came from timeline
  const cameFromTimeline = searchParams.get('filter');

  return (
    <>
      <SearchComponent
        dropdownOptions={enhancedDropdownOptions}
        onDropdownChange={handleCategoryChange}
        selectedDropdownValue={selectedCategory}
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
      {id && open && <ViewReminder onSend={(id) => {
        setOpen(false);
        sendReminder(id)
      }} onClose={() => setOpen(false)} loading={loading} reminder={reminders.find((reminder) => reminder.thread_id === id)} />}

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
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {reminders.length} reminders
              </span>
              {cameFromTimeline && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Filtered from timeline
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
                    {selectedCategory !== "all" && selectedCategory !== "pending" && (
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Show All Reminders
                      </button>
                    )}
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
                      {order.real_name?.split("<")[0].trim() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-red-600">
                      {order.reminder_type_label || order.reminder_type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-green-600">
                      {order.scheduled_time || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${order.status.toLowerCase() === 'pending'
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
                            ${order.status === "Sent" ||
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