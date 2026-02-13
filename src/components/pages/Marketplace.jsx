import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { extractEmail } from "../../assets/assets";
import { PageContext } from "../../context/pageContext";
import { ladgerAction } from "../../store/Slices/ladger";
import SearchComponent from "./SearchComponent";
import { useNavigate } from "react-router-dom";

import {
  Store,
  Gift,
  User,
  Calendar,
  Pencil,
  Pen,
  LinkIcon,
  ActivityIcon,
  BarChart4Icon,
  Trash,
} from "lucide-react";
import {
  deleteMarketPlace,
  getMarketplace,
  marketplaceActions,
} from "../../store/Slices/Marketplace"; // named import
import { LoadingChase } from "../Loading";

export function Marketplace() {
  const dispatch = useDispatch();

  const navigateTo = useNavigate();

  const { items, error, loading, deleting, message, deleteMarketPlaceId } =
    useSelector((state) => state.marketplace);
  const [selectedSort, setSelectedSort] = useState("");

  const { setEnteredEmail, setWelcomeHeaderContent, setSearch } =
    useContext(PageContext);

  const [topsearch, setTopsearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filtereditems = items
    .filter((item) => {
      const searchValue = topsearch.toLowerCase();
      if (!searchValue) return true; // no search → show all

      const contact = item.name.toLowerCase();
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

  const handleSearchChange = (value) => {
    setTopsearch(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleFilterApply = (filters) => {};

  const handleDownload = () => {
    if (!filtereditems || filtereditems.length === 0) {
      toast.error("No data available to download");
      return;
    }

    // Convert Objects → CSV rows
    const headers = ["DATE", "WEBSITES"];

    const rows = filtereditems.map((email) => [email.date_entered, email.name]);

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
      toast.error(error);
      dispatch(marketplaceActions.clearErrors());
    }
    if (message) {
      toast.success(message);
      dispatch(marketplaceActions.clearMessage());
    }
  }, [error, dispatch, message]);

  return (
    <>
      <SearchComponent
        dropdownOptions={[{ value: "all", label: "websites" }]}
        selectedDropdownValue={selectedCategory}
        onDropdownChange={handleCategoryChange}
        dropdownPlaceholder="Filter by websites"
        searchValue={topsearch}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search marketplace items..."
        onFilterApply={handleFilterApply}
        filterPlaceholder="Filters"
        showFilter={true}
        onDownloadClick={handleDownload}
        showDownload={true}
        className="mb-6"
      />

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 mr-5">
          <div className="flex items-center gap-3">
            <Store className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl text-gray-900 font-semibold">
              {" "}
              MARKETPLACE
            </h2>

            <a
              href="https://www.guestpostcrm.com/blog/offers-in-guestpostcrm/"
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
              <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    DATE
                  </div>
                </th>

                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    EMAIL
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <BarChart4Icon className="w-4 h-4" />
                    TYPE
                  </div>
                </th>

                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <ActivityIcon className="w-4 h-4" />
                    ACTIONS
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {filtereditems.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-pink-50 transition"
                >
                  <td className="px-6 py-4 text-gray-600">
                    {row.date_entered}
                  </td>
                  <td
                    className="px-6 py-4 text-blue-600 cursor-pointer"
                    onClick={() => {
                      const input = extractEmail(row.name);
                      localStorage.setItem("email", input);
                      setSearch(input);
                      setEnteredEmail(input);
                      dispatch(ladgerAction.setTimeline(null));
                      setWelcomeHeaderContent("Unreplied");
                      navigateTo("/");
                    }}
                  >
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-blue-600">
                    {row?.description !== null ? "Brand" : "Non Brand"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 item-center justify-center">
                      {/* Update Button */}
                      {deleting && deleteMarketPlaceId === row.id ? (
                        <LoadingChase size="20" color="red" />
                      ) : (
                        <button
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                          onClick={() => dispatch(deleteMarketPlace(row.id))}
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

        {!loading && filtereditems.length === 0 && (
          <div className="p-12 text-center">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No marketplace data found.</p>
          </div>
        )}
      </div>
    </>
  );
}
