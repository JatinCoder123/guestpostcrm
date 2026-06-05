import React, { useState } from "react";
import {
  Filter,
  MessageSquare,
  Users,
  Calendar,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const reportData = {
  filtration: [
    { title: "Spam → Unspam", count: 34 },
    { title: "Defaulters", count: 12 },
    { title: "Stop Emails", count: 8 },
    { title: "No Reply", count: 21 },
    { title: "Duplicate", count: 5 },
    { title: "Non Relevant", count: 9 },
  ],
conversations: [
  {
    title: "New",
    color: "green",
    items: [
      { name: "Account", count: 42 },
      { name: "Contact", count: 31 },
      { name: "First Reply Sent", count: 26 },
      { name: "First Reply Failed", count: 4 },
    ],
  },

  {
    title: "Offer Created",
    color: "orange",
    items: [{ name: "Offer Created", count: 18 }],
  },

  {
    title: "Deal Created",
    color: "blue",
    items: [{ name: "Deal Created", count: 11 }],
  },

  {
    title: "Orders",
    color: "purple",
    items: [
      { name: "Accepted", count: 7 },
      { name: "Completed", count: 5 },
      { name: "Rejected", count: 1 },
      { name: "Pending", count: 3 },
    ],
  },

  {
    title: "Invoices",
    color: "cyan",
    items: [
      { name: "Created", count: 12 },
      { name: "Sent", count: 10 },
      { name: "Paid", count: 7 },
      { name: "Cancelled", count: 2 },
    ],
  },
],
};

const StatCard = ({ title, count }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
    <p className="text-sm text-slate-500">{title}</p>

    <h3 className="text-3xl font-bold text-slate-800 mt-2">
      {count}
    </h3>
  </div>
);

const colorClasses = {
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    left: "bg-green-500",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    left: "bg-orange-500",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    left: "bg-blue-500",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    left: "bg-purple-500",
  },
  cyan: {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
    left: "bg-cyan-500",
  },
};

export default function ReportTestPage() {
  const [activeSection, setActiveSection] =
    useState("filtration");

  const [selectedUser, setSelectedUser] =
    useState("Ashish");

  const [selectedDate, setSelectedDate] =
    useState("today");
    const [openStage, setOpenStage] = useState(null);

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-7xl mx-auto">

        {/* Header */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <MessageSquare
                size={20}
                className="text-green-600"
              />
            </div>

            <div>
              <h1 className="font-semibold text-xl text-slate-800">
                Recent Entries
              </h1>

              <p className="text-sm text-slate-500">
                Reports Dashboard
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">

            <div className="relative">
              <Users
                size={16}
                className="absolute left-3 top-3.5 text-slate-400"
              />

              <select
                value={selectedUser}
                onChange={(e) =>
                  setSelectedUser(e.target.value)
                }
                className="h-11 pl-10 pr-4 border border-slate-300 rounded-xl bg-white min-w-[180px]"
              >
                <option>Ashish</option>
                <option>Kamal</option>
                <option>Rahul</option>
              </select>
            </div>

            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-3 top-3.5 text-slate-400"
              />

              <select
                value={selectedDate}
                onChange={(e) =>
                  setSelectedDate(e.target.value)
                }
                className="h-11 pl-10 pr-4 border border-slate-300 rounded-xl bg-white min-w-[180px]"
              >
                <option value="today">Today</option>
                <option value="yesterday">
                  Yesterday
                </option>
                <option value="7days">
                  Last 7 Days
                </option>
                <option value="30days">
                  Last 30 Days
                </option>
              </select>
            </div>

            <button className="h-11 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition">
              Apply
            </button>
          </div>
        </div>

        {/* Main Cards */}

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <div
            onClick={() =>
              setActiveSection("filtration")
            }
            className={`cursor-pointer rounded-3xl p-8 transition-all border
            ${
              activeSection === "filtration"
                ? "bg-green-50 border-green-500 shadow-lg"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>

                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                  <Filter
                    size={24}
                    className="text-green-600"
                  />
                </div>

                <h2 className="text-2xl font-bold text-slate-800">
                  Filtration
                </h2>

                <p className="text-slate-500 mt-2">
                  Spam, Defaulters, Stop Emails,
                  Duplicates and more.
                </p>
              </div>

              <ChevronRight />
            </div>
          </div>

          <div
            onClick={() =>
              setActiveSection("conversation")
            }
            className={`cursor-pointer rounded-3xl p-8 transition-all border
            ${
              activeSection === "conversation"
                ? "bg-blue-50 border-blue-500 shadow-lg"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>

                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                  <MessageSquare
                    size={24}
                    className="text-blue-600"
                  />
                </div>

                <h2 className="text-2xl font-bold text-slate-800">
                  Conversations
                </h2>

                <p className="text-slate-500 mt-2">
                  Track complete conversation
                  workflow stages.
                </p>
              </div>

              <ChevronRight />
            </div>
          </div>
        </div>

        {/* Dynamic Section */}

       {activeSection === "filtration" && (
  <div className="mt-8">

    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          Filtration Breakdown
        </h2>

        <p className="text-sm text-slate-500">
          Records grouped by filtration category
        </p>
      </div>

      <div className="px-4 py-2 bg-white border rounded-xl text-xs font-semibold tracking-widest text-slate-500">
        {reportData.filtration.length} Categories
      </div>
    </div>

    <div className="space-y-4">

      {reportData.filtration.map((item, index) => (
        <div
          key={index}
          className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white"
        >

          <div className="absolute left-0 top-0 h-full w-1 bg-green-500" />

          <div className="p-6 flex justify-between items-center">

            <div>
              <h3 className="font-bold text-lg text-slate-800">
                {item.title}
              </h3>

              <p className="text-sm text-slate-500">
                Filtration Category
              </p>
            </div>

            <div className="bg-slate-100 px-4 py-2 rounded-xl font-semibold">
              TOTAL {item.count}
            </div>

          </div>

        </div>
      ))}

      <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-green-900 to-green-700 shadow-xl">

        <div className="flex items-center justify-between p-8">

          <div>
            <p className="uppercase text-xs tracking-[3px] text-green-200">
              All Filtrations
            </p>

            <h2 className="text-2xl font-bold text-white">
              Grand Total
            </h2>
          </div>

          <div className="text-right">

            <div className="text-5xl font-bold text-white">
              {
                reportData.filtration.reduce(
                  (sum, item) => sum + item.count,
                  0
                )
              }
            </div>

            <p className="text-sm text-green-200">
              across {reportData.filtration.length} categories
            </p>

          </div>

        </div>

      </div>

    </div>

  </div>
)}

     {activeSection === "conversation" && (
  <div className="mt-8">

    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          Detailed Breakdown
        </h2>

        <p className="text-sm text-slate-500">
          Action-level activity grouped by category
        </p>
      </div>

      <div className="px-4 py-2 bg-white border rounded-xl text-xs font-semibold tracking-widest text-slate-500">
        {reportData.conversations.length} Categories
      </div>
    </div>

    <div className="space-y-4">

      {reportData.conversations.map((stage, index) => {

        const subtotal = stage.items.reduce(
          (sum, item) => sum + item.count,
          0
        );

        const colors = colorClasses[stage.color];

        return (
          <div
            key={index}
            className={`
              relative rounded-3xl overflow-hidden border
              ${colors.bg}
              ${colors.border}
            `}
          >

            <div
              className={`absolute left-0 top-0 h-full w-1 ${colors.left}`}
            />

            <div
              onClick={() =>
                setOpenStage(
                  openStage === index ? null : index
                )
              }
              className="cursor-pointer p-6"
            >
              <div className="flex justify-between items-center">

                <div>
                  <h3
                    className={`font-bold text-lg ${colors.text}`}
                  >
                    {stage.title}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {stage.items.length} action
                    {stage.items.length > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <div className="bg-white px-4 py-2 rounded-xl border shadow-sm font-semibold text-sm">
                    SUBTOTAL {subtotal}
                  </div>

                  <button className="w-10 h-10 rounded-xl border bg-white flex items-center justify-center">
                    {openStage === index ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>

                </div>

              </div>
            </div>

            {openStage === index && (

              <div className="border-t bg-white/70">

                {stage.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between items-center px-6 py-4 border-b last:border-b-0"
                  >
                    <span className="text-slate-700">
                      {item.name}
                    </span>

                    <span className="font-bold text-slate-900">
                      {item.count}
                    </span>
                  </div>
                ))}

              </div>

            )}

          </div>
        );
      })}

      <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 shadow-xl">

        <div className="flex items-center justify-between p-8">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center">
              <MessageSquare
                size={22}
                className="text-white"
              />
            </div>

            <div>
              <p className="uppercase text-xs tracking-[3px] text-slate-400">
                All Activities
              </p>

              <h2 className="text-2xl font-bold text-white">
                Grand Total
              </h2>
            </div>

          </div>

          <div className="text-right">

            <div className="text-5xl font-bold text-white">
              {reportData.conversations.reduce(
                (total, stage) =>
                  total +
                  stage.items.reduce(
                    (sum, item) => sum + item.count,
                    0
                  ),
                0
              )}
            </div>

            <p className="text-sm text-slate-400">
              across {reportData.conversations.length} categories
            </p>

          </div>

        </div>

      </div>

    </div>
  </div>
)}
      </div>
    </div>
  );
}