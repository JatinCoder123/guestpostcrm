import { BadgeInfo, Search } from "lucide-react";
import TableFooter from "./TableFooter";
import { useTableContext } from "./Table";
import { useState } from "react";
import { CustomDropdown } from "../../pages/settingpages/PromptTestingPage";
function TableTitleBar({ Icon, title, iconClass, titleClass }) {
    const { setSearch, search, visibleColumns } = useTableContext();

    return (
        <div className="flex items-center justify-between px-5 py-4 border-b bg-white shadow-sm rounded-t-xl">

            {/* 🔵 Left Section */}
            <div className={`flex items-center gap-3 text-gray-800 ${titleClass}`}>
                <div className="p-2 rounded-lg ">
                    <Icon className={`w-5 h-5 ${iconClass}`} />
                </div>

                <h2 className="text-lg font-semibold">{title}</h2>

                <button className="p-1 hover:bg-gray-100 rounded-md transition">
                    <BadgeInfo className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            {/* 🔍 Search Section */}
            <div className="flex items-center gap-3">

                {/* Dropdown */}
                <div className="relative">


                    <CustomDropdown

                        className="w-[140px]"
                        value={search.type}
                        onChange={(value) =>
                            setSearch((prev) => ({
                                ...prev,
                                type: value,
                            }))
                        }
                        options={visibleColumns?.map((grp) => ({
                            value: grp.accessor,
                            label: grp.label,
                        }))}
                    />
                </div>

                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                    <input
                        type="text"
                        placeholder="Search..."
                        value={search?.value || ""}
                        onChange={(e) =>
                            setSearch((prev) => ({
                                ...prev,

                                value: e.target.value,
                            }))
                        }
                        className="pl-9 pr-3 py-2.5 w-56 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                </div>

            </div>

            {/* 🔻 Footer */}
            <TableFooter />
        </div>
    );
}

export default TableTitleBar;
