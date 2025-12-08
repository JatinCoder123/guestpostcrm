import {
  Mail,
  Handshake,
  Pen,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import SearchComponent from "./SearchComponent";
import { dealsAction, getDeals, updateDeal } from "../../store/Slices/deals";
import Pagination from "../Pagination";
import { useNavigate } from "react-router-dom";
import UpdatePopup from "../UpdatePopup";
import { toast } from "react-toastify";

export function DealsPage() {
  const [topsearch, setTopsearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('');
  const { count, deals, loading, error, updating, message } = useSelector((state) => state.deals);
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const { timeline, email } = useSelector((state) => state.ladger);
  const [currentDealUpdate, setCurrentDealUpdate] = useState(null)


  const dropdownOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
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
  const updateDealHandler = (currentDeal, data) => {
    const updateDealData = {
      ...currentDeal,
      ...data
    }
    dispatch(updateDeal(updateDealData))
  }
  useEffect(() => {
    if (message) {
      toast.success(message);
      setCurrentDealUpdate(null)
      dispatch(dealsAction.clearAllMessages())
    }
    if (error) {
      toast.error(error);
      dispatch(dealsAction.clearAllErrors())
    }
  }, [message, error, dispatch]);

  return (
    <>
      {
        currentDealUpdate && (
          <UpdatePopup
            open={!!currentDealUpdate}
            title="Update Deal"
            fields={[
              { name: "dealamount", label: "Deal Amount", type: "number", value: currentDealUpdate.dealamount },
              { name: "website_c", label: "Website", type: "text", value: currentDealUpdate.website_c },
              { name: "email", label: "Email", type: "email", value: currentDealUpdate.email, disabled: true },
            ]}
            loading={updating}
            onUpdate={(data) => updateDealHandler(currentDealUpdate, data)}
            onClose={() => setCurrentDealUpdate(null)}
          />
        )
      }
      <SearchComponent

        dropdownOptions={dropdownOptions}
        onDropdownChange={handleCategoryChange}
        selectedDropdownValue={selectedCategory}
        dropdownPlaceholder="Filter by Status"


        onSearchChange={handleSearchChange}
        searchValue={topsearch}
        searchPlaceholder="Search emails..."


        onFilterApply={handleFilterApply}
        filterPlaceholder="Filters"
        showFilter={true}


        archiveOptions={[
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
        transactionTypeOptions={[
          { value: 'all', label: 'All Emails' },
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
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Deals</p>
              <p className="text-2xl text-gray-900 mt-1">{count}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Handshake className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Value</p>
              <p className="text-2xl text-gray-900 mt-1">$10.5K</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Win Rate</p>
              <p className="text-2xl text-gray-900 mt-1">58%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg. Deal Size</p>
              <p className="text-2xl text-gray-900 mt-1">$3.5K</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Deals Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Handshake className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">DEALS</h2>
            <a href="https://www.guestpostcrm.com/blog/deal-expiry-renewal-reminders/" target="_blank"
              rel="noopener noreferrer">
              <img width="30" height="30" src="https://img.icons8.com/offices/30/info.png" alt="info" />
            </a>
          </div>

          <div className="relative group ">
            <button
              onClick={() => navigateTo("create")}
              className="p-5  cursor-pointer hover:scale-110 flex items-center justify-center transition"
            >
              <img
                width="40"
                height="40"
                src="https://img.icons8.com/arcade/64/plus.png"
                alt="plus"
              />
            </button>

            {/* Tooltip */}
            <span className="absolute left-1/2 -bottom-3 -translate-x-1/2 
                   bg-gray-800 text-white text-sm px-3 py-1 rounded-md 
                   opacity-0 group-hover:opacity-100 transition 
                   pointer-events-none whitespace-nowrap shadow-md">
              Create Deal
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span> DATE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>CONTACT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  WEBSITES
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>VALUE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">STAGE</th>

                <th className="px-6 py-4 text-left">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-gray-600">{deal.date_entered}</td>
                  <td className="px-6 py-4 text-blue-600">{deal.real_name?.split("<")[0].trim()}</td>
                  <td className="px-6 py-4 text-gray-900">
                    {deal.website_c == "" ? "No Name" : deal.website_c}
                  </td>
                  <td className="px-6 py-4 text-green-600">
                    {deal.dealamount}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {deal.status ?? "Active"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {/* Update Button */}
                      <button
                        onClick={() => setCurrentDealUpdate(deal)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Update"
                      >
                        <Pen className="w-5 h-5 text-blue-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {deals?.length > 0 && <Pagination slice={"deals"} fn={getDeals} />}

        {!loading && !error && deals.length === 0 && (
          <div className="p-12 text-center">
            <Handshake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No deals yet. Create your first deal to get started.
            </p>
          </div>
        )}
      </div>
    </>
  );
}