import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import CreateOffer from "../CreateOffer";
import { Gift, User, Calendar, DollarSign, Tag, Pencil, Plus, Pen } from "lucide-react";
import { getOffers, offersAction, updateOffer } from "../../store/Slices/offers";
import Pagination from "../Pagination";
import SearchComponent from "./SearchComponent";
import UpdatePopup from "../UpdatePopup";
import { toast } from "react-toastify";

export function OffersPage() {
  const { offers, count, loading, updating, error, message } = useSelector((state) => state.offers);
  const [showOffer, setShowOffer] = useState(false);
  const [editData, setEditData] = useState(null);
  const [topsearch, setTopsearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('');
  const [currentUpdateOffer, setCurrentUpdateOffer] = useState(null);

  // Show popup only
  if (showOffer) {
    return (
      <CreateOffer
        editData={editData}
        onClose={() => {
          setEditData(null);
          setShowOffer(false);
        }}
      />
    );
  }

  // Calculate stats
  const pending = offers.filter((o) => o.status === "Pending").length;
  const accepted = offers.filter((o) => o.status === "Accepted").length;

  const dispatch = useDispatch();
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

  const updateOfferHandler = (offer, data) => {
    const updatedOffer = { ...offer, ...data };
    dispatch(updateOffer(updatedOffer));
  };
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(offersAction.clearAllErrors())
    }
    if (message) {
      toast.success(message);
      setCurrentUpdateOffer(null);
      dispatch(offersAction.clearAllMessages())
    }
  }, [dispatch, message, error]);

  return (
    <>
      {
        currentUpdateOffer && (
          <UpdatePopup
            open={!!currentUpdateOffer}
            title="Update Offer"
            fields={[
              { name: "offer_name", label: "Offer Email", type: "text", value: currentUpdateOffer.name, disabled: true },
              { name: "client_offer_c", label: "Client Offer", type: "text", value: currentUpdateOffer.client_offer_c },
              { name: "our_offer_c", label: "Our Offer", type: "text", value: currentUpdateOffer.our_offer_c },
              { name: "website", label: "Website", type: "text", value: currentUpdateOffer.website },
            ]}
            loading={updating}
            onUpdate={(data) => updateOfferHandler(currentUpdateOffer, data)}
            onClose={() => setCurrentUpdateOffer(null)}
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

      {/* ⭐ Stats Cards (Top Section) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        {/* Total Offers */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Offers</p>
              <p className="text-2xl text-gray-900 mt-1">{count}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl text-gray-900 mt-1">{pending}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Accepted */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Accepted</p>
              <p className="text-2xl text-gray-900 mt-1">{accepted}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-green-700">✓</span>
            </div>
          </div>
        </div>

        {/* Total Value */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Value</p>
              <p className="text-2xl text-gray-900 mt-1">
                ${offers.reduce((sum, o) => sum + Number(o.amount || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ Offers Section (Header + Table) */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">

          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl text-gray-900 font-semibold">OFFERS</h2>
            <a href="https://www.guestpostcrm.com/blog/offers-in-guestpostcrm/" target="_blank" rel="noopener noreferrer">
              <img width="30" height="30" src="https://img.icons8.com/offices/30/info.png" alt="info" />
            </a>
          </div>
          <div className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {offers.length} Active Offers
          </div>

          <div className="relative group">
            <button
              onClick={() => {
                setEditData(null);
                setShowOffer(true);
              }}
              className="p-5 cursor-pointer hover:scale-110 flex items-center justify-center transition"
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
              Create Offer
            </span>
          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">

                <th className="px-6 py-4 text-left" >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />

                    DATE

                  </div>
                </th>

                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>CONTACT</span>
                  </div>
                </th>


                <th className="px-6 py-4 text-left">EMAIL</th>
                <th className="px-6 py-4 text-left">
                  CLIENT OFFER
                </th>
                <th className="px-6 py-4 text-left">OUR OFFER</th>
                <th className="px-6 py-4 text-left">EXPIRES</th>

                <th className="px-6 py-4 text-left">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {offers.map((offer, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-pink-50 transition"
                >
                  <td className="px-6 py-4 text-gray-600">{offer.date_entered}</td>
                  <td className="px-6 py-4">{offer.real_name?.split("<")[0].trim()}</td>
                  <td className="px-6 py-4 text-blue-600">{offer.name}</td>

                  <td className="px-6 py-4 text-green-600">{offer.client_offer_c}</td>
                  <td className="px-6 py-4 text-gray-600">{offer.our_offer_c}</td>
                  <td className="px-6 py-4 text-gray-600">{"N/A"}</td>


                  <td className="pl-9 py-4">


                    <div className="flex gap-2">
                      {/* Update Button */}
                      <button
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Update"
                        onClick={() => {
                          setCurrentUpdateOffer(offer);
                        }}
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
        {offers.length > 0 && <Pagination slice={"offers"} fn={getOffers} />}

        {!loading && offers.length === 0 && (
          <div className="p-12 text-center">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No offers yet. Create your first offer to get started.</p>
          </div>
        )}
      </div>
    </>
  );
}
