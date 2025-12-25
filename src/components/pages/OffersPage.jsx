import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Gift, User, Calendar, DollarSign, Tag, Pen, Trash } from "lucide-react";
import { deleteOffer, getOffers, offersAction, } from "../../store/Slices/offers";
import Pagination from "../Pagination";
import SearchComponent from "./SearchComponent";
import { useNavigate } from "react-router-dom";
import { excludeEmail, extractEmail } from "../../assets/assets";
import { LoadingChase, LoadingSpin } from "../Loading";
import { PageContext } from "../../context/pageContext";

export function OffersPage() {
  const { offers, count, loading, error, deleting, deleteOfferId } = useSelector((state) => state.offers);
  const {setSearch,setEnteredEmail} = useContext(PageContext)
  const [topsearch, setTopsearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('');
  const dispatch = useDispatch();
  const filteredoffers = offers
    .filter((item) => {
      const searchValue = topsearch.toLowerCase();
      if (!searchValue) return true; // no search → show all

      const contact = item.real_name?.split("<")[0].trim().toLowerCase();
      if (selectedCategory === "contect" || selectedCategory === "contact") {
        return contact.includes(searchValue);
      }

      return contact.includes(searchValue);
    })
    .sort((a, b) => {
      if (!selectedSort) return 0;

      if (selectedSort === "asc") {
        return a.from.localeCompare(b.from);
      }

      if (selectedSort === "desc") {
        return b.from.localeCompare(a.from);
      }

      return 0;
    });

  // Calculate stats
  const pending = offers.filter((o) => o.status === "Pending").length;
  const accepted = offers.filter((o) => o.status === "Accepted").length;

  const navigateTo = useNavigate()
  const dropdownOptions = [
    { value: 'contect', label: 'Contact' }
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


  const handleDownload = () => {
    if (!filteredoffers || filteredoffers.length === 0) {
      toast.error("No data available to download");
      return;
    }

    // Convert Objects → CSV rows
    const headers = ["DATE", "CONTACT", "EMAIL", "CLIENT OFFER", "OUR OFFER"];

    const rows = filteredoffers.map((email) => [
      email.date_entered,
      email.real_name?.split("<")[0].trim(),
      email.name,
      email.client_offer_c,
      email.our_offer_c


    ]);

    // Convert to CSV string
    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map((val) => `"${val}"`).join(",")).join("\n");

    // Create and auto-download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "unreplied-emails.csv";
    a.click();
  };

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(offersAction.clearAllErrors())
    }
  }, [error])




  return (
    <>

      <SearchComponent

        dropdownOptions={dropdownOptions}
        onDropdownChange={handleCategoryChange}
        selectedDropdownValue={selectedCategory}
        // dropdownPlaceholder="Filter by contact"


        onSearchChange={handleSearchChange}
        searchValue={topsearch}
        searchPlaceholder="Search here..."


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
              <p className="text-gray-500 text-sm">New</p>
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
              <p className="text-gray-500 text-sm">Expired</p>
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
              <p className="text-gray-500 text-sm">Upcoming Expire</p>
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
              <p className="text-gray-500 text-sm">Rejected </p>
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


                <th className="px-6 py-4 text-left">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredoffers.map((offer, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-pink-50 transition"
                >
                  <td className="px-6 py-4 text-gray-600 cursor-pointer" onClick={() => {
                                        const input = extractEmail(offer.real_name);
                                        localStorage.setItem("email", input);
                                        setSearch(input);
                                        setEnteredEmail(input);
                                        navigateTo("/");
                                      }}
                                      ><div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{offer.date_entered}</span>
                    </div></td>
                    
                 
                  <td
                    onClick={() => {
                      const input = extractEmail(offer.real_name);
                      localStorage.setItem("email", input);
                      setSearch(input);
                      setEnteredEmail(input);
                      navigateTo("/contacts");
                    }}
                    className="px-6 py-4 text-gray-900 cursor-pointer"
                  >
                    {offer.real_name?.split("<")[0].trim()}
                  </td>
                  <td className="px-6 py-4 text-blue-600">{offer.real_name}</td>

                  <td className="px-6 py-4 text-green-600">{offer.client_offer_c}</td>
                  <td className="px-6 py-4 text-gray-600">{offer.our_offer_c}</td>



                  <td className="pl-9 py-4">


                    <div className="flex items-center justify-center gap-2">
                      {/* Update Button */}
                      <button
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Update"
                        onClick={() => navigateTo(`/offers/edit/${offer.id}`, { state: { email: excludeEmail(offer.real_name) } })}
                      >
                        <Pen className="w-5 h-5 text-blue-600" />
                      </button>
                      {/* Delete Button */}
                      {deleting && deleteOfferId === offer.id ? <LoadingChase size="20" color="red" /> : (
                        <button
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                          onClick={() => dispatch(deleteOffer(offer.id))}
                        >
                          <Trash className="w-5 h-5 text-red-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
        {offers.length > 0 && <Pagination slice={"offers"} fn={getOffers} />}

        {!loading && filteredoffers.length === 0 && (
          <div className="p-12 text-center">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No offers yet. Create your first offer to get started.</p>
          </div>
        )}
      </div>
    </>
  );
}
