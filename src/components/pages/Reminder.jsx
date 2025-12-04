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

export function ReminderPage() {
  const [topsearch, setTopsearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('order_reminder');
  const [selectedSort, setSelectedSort] = useState('');
  const dispatch = useDispatch();

  const { orderRem, count, loading, error } = useSelector(
    (state) => state.orderRem
  );
  const [reminders, setReminders] = useState(orderRem);

  const { email } = useSelector((state) => state.ladger);

  useEffect(() => {
    dispatch(getOrderRem(email, 1));
  }, [email, dispatch]);


  useEffect(() => {
    const filteredReminders = orderRem.filter((reminder) => {
      if (selectedCategory === 'all') {
        return true;
      }
      return reminder.reminder_type === selectedCategory;
    });
    setReminders(filteredReminders);
  }, [selectedCategory, orderRem]);


  const getDisplayLabel = (type) => {
    const labels = {
      all: "All Reminders",
      order_reminder: "Order Reminder",
      deal_reminder: "Deal Reminder",
      payment_reminder: "Payment Reminder",
      link_removal: "Link Removal",
    };
    return labels[type] || type;
  };

  const dropdownOptions = [
    { value: 'all', label: 'All Reminders' },
    { value: 'order_reminder', label: 'Order Reminder' },
    { value: 'deal_reminder', label: 'Deal Reminder' },
    { value: 'payment_reminder', label: 'Payment Reminder' },
    { value: 'link_removal', label: 'Link Removal' },
  ];

  const filterOptions = [
    { value: 'asc', label: 'A to Z' },
    { value: 'desc', label: 'Z to A' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
  ];

  const handleFilterApply = (filters) => {
    console.log('Applied filters from popup:', filters);
  };

  const handleSearchChange = (value) => {
    setTopsearch(value);
    console.log('Searching for:', value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    console.log('Category selected:', value);
  };

  const handleSortChange = (value) => {
    setSelectedSort(value);
    console.log('Sort selected:', value);
  };

  const handleDownload = () => {
    console.log('Download clicked');
  };

  return (
    <>
      <SearchComponent
        dropdownOptions={dropdownOptions}
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
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
        transactionTypeOptions={[
          { value: 'all', label: 'All Reminders' },
          { value: 'incoming', label: 'Incoming' },
          { value: 'outgoing', label: 'Outgoing' },
        ]}
        currencyOptions={[
          { value: 'all', label: 'All' },
          { value: 'usd', label: 'USD' },
          { value: 'eur', label: 'EUR' },
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
              <p className="text-gray-500 text-sm">Order Reminder</p>
              <p className="text-2xl text-gray-900 mt-1">{count}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Overdue</p>
              <p className="text-2xl text-gray-900 mt-1">$3.1K</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Days Overdue</p>
              <p className="text-2xl text-gray-900 mt-1">4.3</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Recovery Rate</p>
              <p className="text-2xl text-gray-900 mt-1">85%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Missed Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header - Use selectedCategory for display */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-red-600" />
            <h2 className="text-xl text-gray-900">{getDisplayLabel(selectedCategory)}</h2>
            <a href="">
              <img
                width="30"
                height="30"
                src="https://img.icons8.com/offices/30/info.png"
                alt="info"
              />
            </a>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Send Reminders
          </button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>

              <tr className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
                <th className="px-6 py-4 text-left">DATE CREATED</th>

                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>CONTACT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">NAME</th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>AMOUNT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>STATUS</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : (
                reminders.map((order, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-gray-600">
                      {order.scheduled_time}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {order.recipient}
                    </td>
                    <td className="px-6 py-4 text-red-600">{order.name}</td>
                    <td className="px-6 py-4 text-green-600">{order.time}</td>
                    <td className="px-6 py-4 text-gray-600">{order.status}</td>

                    <td className="px-6 py-4">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Send Reminder
                      </button>
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
        {!loading && orderRem.length === 0 && !error && (
          <div className="p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No missed {getDisplayLabel(selectedCategory).toLowerCase()}.
            </p>
          </div>
        )}
      </div>
    </>
  );
}