import React from "react";
import { Download, SlidersHorizontal } from "lucide-react";

const TableToolbar = ({ className = "" }) => {
    return (
        <div className={`flex flex-wrap items-center justify-between gap-4 p-4 ${className}`}>

            {/* Left side: Dropdown + Search */}
            <div className="flex flex-wrap items-center gap-4 flex-1">

                {/* Dropdown */}
                <div className="relative min-w-[150px]">
                    <select className="block w-full px-4 py-4 pr-8 text-sm border border-gray-300 rounded-full outline-none appearance-none bg-white">
                        <option>Select</option>
                        <option>Option 1</option>
                        <option>Option 2</option>
                        <option>Option 3</option>
                    </select>

                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Search */}
                <div className="relative flex-1 min-w-[250px] max-w-md">
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full px-4 py-4 pl-10 text-sm bg-white border border-gray-300 rounded-full outline-none"
                    />

                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

            </div>

            {/* Right side: Filter + Download */}
            <div className="flex items-center hidden gap-4 relative">

                {/* Filter Button */}
                <button className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filter</span>
                </button>

                {/* Filter Popup */}
                <div className="absolute right-0 top-full mt-2 z-50 w-[500px] bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-6">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>

                            <button className="text-gray-400 hover:text-gray-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Row 1 */}
                        <div className="grid grid-cols-2 gap-6 mb-6">

                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Archive</h4>
                                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
                                    <option>All</option>
                                    <option>Archive</option>
                                    <option>Active</option>
                                </select>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Transaction type</h4>
                                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
                                    <option>All activity</option>
                                    <option>Credit</option>
                                    <option>Debit</option>
                                </select>
                            </div>

                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-2 gap-6 mb-6">

                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Date</h4>
                                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
                                    <option>Past 7 days</option>
                                    <option>Past 30 days</option>
                                    <option>Past 90 days</option>
                                    <option>Past year</option>
                                </select>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Currency</h4>
                                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
                                    <option>All</option>
                                    <option>USD</option>
                                    <option>EUR</option>
                                    <option>GBP</option>
                                </select>
                            </div>

                        </div>

                        {/* Row 3 */}
                        <div className="grid grid-cols-2 gap-6 mb-6">

                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
                                    <option>All Status</option>
                                    <option>New</option>
                                    <option>Duplicate</option>
                                    <option>Accepted</option>
                                    <option>Completed</option>
                                </select>
                            </div>

                            <div></div>

                        </div>

                        {/* Amount Range */}
                        <div className="mb-6">

                            <h4 className="text-sm font-medium text-gray-700 mb-2">Amount range</h4>

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Minimum amount</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Maximum amount</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                    />
                                </div>

                            </div>

                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">

                            <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg">
                                Reset
                            </button>

                            <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">
                                Apply Filters
                            </button>

                        </div>

                    </div>
                </div>

                {/* Download */}
                <button className="px-4 py-4 text-sm font-medium text-black bg-white rounded-full hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2">
                        <Download />
                    </div>
                </button>

            </div>
        </div>
    );
};

export default TableToolbar;