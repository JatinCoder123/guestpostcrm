import {
  Mail,
  Handshake,
  Pen,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  Trash,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import SearchComponent from "./SearchComponent";
import Pagination from "../Pagination";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteDeal, getDeals } from "../../store/Slices/deals";
import { excludeEmail, extractEmail } from "../../assets/assets";
import { LoadingChase } from "../Loading";
import { PageContext } from "../../context/pageContext";

export function DealsPage() {
  const [topsearch, setTopsearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { setSearch, setEnteredEmail } = useContext(PageContext);
  const [selectedSort, setSelectedSort] = useState("");
  const { count, deals, loading, error, deleting, deleteDealId ,summary} = useSelector(
    (state) => state.deals
  );
  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  const filtereddeals = deals
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
  const dropdownOptions = [{ value: "contect", label: "Contact" }];

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
    console.log("Searching for:", value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    console.log("Category selected:", value);
  };

  const handleSortChange = (value) => {
    setSelectedSort(value);
    console.log("Sort selected:", value);
  };

  const handleDownload = () => {
    if (!filtereddeals || filtereddeals.length === 0) {
      toast.error("No data available to download");
      return;
    }

    // Convert Objects → CSV rows
    const headers = ["DATE", "CONTACT", "	WEBSITES", "VALUE", "STAGE"];

    const rows = filtereddeals.map((email) => [
      email.date_entered,
      email.real_name?.split("<")[0].trim(),
      email.website_c,
      email.dealamount,
      email.status,
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

  return (
    <>
      <SearchComponent
        dropdownOptions={dropdownOptions}
        onDropdownChange={handleCategoryChange}
        selectedDropdownValue={selectedCategory}
        // dropdownPlaceholder="Filter by contact"
        dropdownPlaceholder="Filter by"
        onSearchChange={handleSearchChange}
        searchValue={topsearch}
        searchPlaceholder="Search here..."
        onFilterApply={handleFilterApply}
        filterPlaceholder="Filters"
        showFilter={true}
        archiveOptions={[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
        transactionTypeOptions={[
          { value: "all", label: "All Emails" },
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
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Deals</p>
              <p className="text-2xl text-gray-900 mt-1">{summary?.active_deals ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Handshake className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Amount</p>
              <p className="text-2xl text-gray-900 mt-1">${summary?.active_deal_amount ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Expire Soon</p>
              <p className="text-2xl text-gray-900 mt-1"> {summary?.expire_soon_deals ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Expired Deals</p>
              <p className="text-2xl text-gray-900 mt-1"> {summary?.expired_deals ?? 0}</p>
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
            <a
              href="https://www.guestpostcrm.com/blog/deal-expiry-renewal-reminders/"
              target="_blank"
              rel="noopener noreferrer"
            >
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
                <th className="px-6 py-4 text-left">WEBSITES</th>
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
              {filtereddeals.map((deal, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <td
                    className="px-6 py-4 text-gray-600 cursor-pointer"
                    onClick={() => {
                      const input = extractEmail(deal.email);
                      localStorage.setItem("email", input);
                      setSearch(input);
                      setEnteredEmail(input);
                      navigateTo("/");
                    }}
                  >
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{deal.date_entered}</span>
                    </div>
                  </td>

                  <td
                    onClick={() => {
                      const input = extractEmail(deal.email);
                      localStorage.setItem("email", input);
                      setSearch(input);
                      setEnteredEmail(input);
                      navigateTo("/contacts");
                    }}
                    className="px-6 py-4 text-gray-900 cursor-pointer"
                  >
                    {deal.real_name?.split("<")[0].trim()}
                  </td>
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
                    <div className="flex items-center justify-center gap-2">
                      {/* Update Button */}
                      <button
                        onClick={() =>
                          navigateTo(`/deals/edit/${deal.id}`, {
                            state: { email: excludeEmail(deal.real_name) },
                          })
                        }
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Update"
                      >
                        <Pen className="w-5 h-5 text-blue-600" />
                      </button>
                      {deleting && deleteDealId === deal.id ? (
                        <LoadingChase size="20" color="red" />
                      ) : (
                        <button
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                          onClick={() => dispatch(deleteDeal(deal.id))}
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
        {deals?.length > 0 && <Pagination slice={"deals"} fn={getDeals} />}

        {!loading && !error && filtereddeals.length === 0 && (
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
