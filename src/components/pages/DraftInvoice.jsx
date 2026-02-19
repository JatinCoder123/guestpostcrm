import {
  Shield,
  Laptop,
} from "lucide-react";
import { toast } from "react-toastify";
import SearchComponent from "./SearchComponent";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Pagination from "../Pagination";
import { getDraftInvoice } from "../../store/Slices/draftInvoice.js";
export function DraftInvoice() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { detection = [], count } = useSelector((state) => state.DraftInvoice);

  const [topsearch, setTopsearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSearchChange = (value) => setTopsearch(value);
  const handleCategoryChange = (value) => setSelectedCategory(value);
  const handleFilterApply = () => { };

  const [selectedSort, setSelectedSort] = useState("");

  const filteredEmails = detection
    .filter((item) => {
      const searchValue = topsearch.toLowerCase();
      if (!searchValue) return true;

      // SAFELY HANDLE "from"
      const fromField = item?.name ?? "";
      const contact = fromField.toLowerCase();

      // SAFE subject
      const subject = item?.subject?.toLowerCase() ?? "";

      const date = item?.date_entered?.toLowerCase() ?? "";

      if (selectedCategory === "contect" || selectedCategory === "contact") {
        return contact.includes(searchValue);
      }
      if (selectedCategory === "subject") {
        return subject.includes(searchValue);
      }

      return contact.includes(searchValue);
    })
    .sort((a, b) => {
      if (!selectedSort) return 0;

      const aFrom = a?.from ?? "";
      const bFrom = b?.from ?? "";

      if (selectedSort === "asc") {
        return aFrom.localeCompare(bFrom);
      }
      if (selectedSort === "desc") {
        return bFrom.localeCompare(aFrom);
      }
      if (selectedSort === "oldest") {
        return new Date(a.date_entered) - new Date(b.date_entered);
      }

      return 0;
    });

  const handleDownload = () => {
    if (!filteredEmails || filteredEmails.length === 0) {
      toast.error("No data available to download");
      return;
    }

    // Convert Objects → CSV rows
    const headers = ["DATE", "CONTACT", "DESCRIPTION"];

    const rows = filteredEmails.map((email) => [
      email.date_entered,
      email.name,
      email.description,
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
    dispatch(getDraftInvoice());
  }, [dispatch]);


  return (
    <>
      <SearchComponent
        dropdownOptions={[{ value: "all", label: "Contact" }]}
        selectedDropdownValue={selectedCategory}
        onDropdownChange={handleCategoryChange}
        searchValue={topsearch}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search here..."
        onFilterApply={handleFilterApply}
        filterPlaceholder="Filters"
        showFilter={true}
        onDownloadClick={handleDownload}
        showDownload={true}
        className="mb-6"
      />

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-green-100 hover:bg-green-200 ring-2 ring-green-300 transition shadow-sm "
            >
              <ArrowLeft className="w-5 h-5 text-green-700" />
            </button>
            <Laptop className="w-6 h-6 text-green-600" />
            <h2 className="text-xl text-gray-900">DraftInvoice</h2>
          </div>
          <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full">
            {count} DraftInvoice
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                <th className="px-6 py-4 text-left">CREATED AT</th>
                <th className="px-6 py-4 text-left">CONTACT</th>
                <th className="px-6 py-4 text-left">DESCRIPTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmails.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-orange-50"
                >
                  <td className="px-6 py-4">{item.date_entered}</td>
                  <td className="px-6 py-4">{item.name}</td>

                  <td className="px-6 py-4">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination – SAME AS DEFUALTER */}
        {filteredEmails.length > 0 && (
          <Pagination slice={"DraftInvoice"} fn={getDraftInvoice} />
        )}

        {filteredEmails.length === 0 && (
          <div className="p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No Draft Invoices yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
