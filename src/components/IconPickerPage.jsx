import {
    useMemo,
    useState,
    useCallback,
} from "react";

import * as Fa from "react-icons/fa";
import * as Fa6 from "react-icons/fa6";
import * as Md from "react-icons/md";
import * as Io from "react-icons/io";
import * as Io5 from "react-icons/io5";
import * as Ai from "react-icons/ai";
import * as Bs from "react-icons/bs";
import * as Bi from "react-icons/bi";
import * as Fi from "react-icons/fi";
import * as Gi from "react-icons/gi";
import * as Go from "react-icons/go";
import * as Hi from "react-icons/hi";
import * as Hi2 from "react-icons/hi2";
import * as Im from "react-icons/im";
import * as Lu from "react-icons/lu";
import * as Pi from "react-icons/pi";
import * as Ri from "react-icons/ri";
import * as Si from "react-icons/si";
import * as Tb from "react-icons/tb";
import * as Ti from "react-icons/ti";
import * as Vsc from "react-icons/vsc";
import * as Wi from "react-icons/wi";

import {
    Search,
    X,
    Copy,
    Check,
    ChevronDown,
    Grid3X3,
} from "lucide-react";

import toast from "react-hot-toast";

/* =========================================================
   ICON LIBRARIES
========================================================= */

const ICON_LIBRARIES = {
    all: {
        name: "All Icons",
        shortName: "All",
        icons: null,
    },

    fa: {
        name: "Font Awesome",
        shortName: "FA",
        icons: Fa,
    },

    fa6: {
        name: "Font Awesome 6",
        shortName: "FA6",
        icons: Fa6,
    },

    md: {
        name: "Material Design",
        shortName: "MD",
        icons: Md,
    },

    io: {
        name: "Ionicons",
        shortName: "IO",
        icons: Io,
    },

    io5: {
        name: "Ionicons 5",
        shortName: "IO5",
        icons: Io5,
    },

    ai: {
        name: "Ant Design",
        shortName: "AI",
        icons: Ai,
    },

    bs: {
        name: "Bootstrap Icons",
        shortName: "BS",
        icons: Bs,
    },

    bi: {
        name: "BoxIcons",
        shortName: "BI",
        icons: Bi,
    },

    fi: {
        name: "Feather",
        shortName: "FI",
        icons: Fi,
    },

    gi: {
        name: "Game Icons",
        shortName: "GI",
        icons: Gi,
    },

    go: {
        name: "Github Octicons",
        shortName: "GO",
        icons: Go,
    },

    hi: {
        name: "Heroicons",
        shortName: "HI",
        icons: Hi,
    },

    hi2: {
        name: "Heroicons 2",
        shortName: "HI2",
        icons: Hi2,
    },

    im: {
        name: "IcoMoon",
        shortName: "IM",
        icons: Im,
    },

    lu: {
        name: "Lucide",
        shortName: "LU",
        icons: Lu,
    },

    pi: {
        name: "Phosphor",
        shortName: "PI",
        icons: Pi,
    },

    ri: {
        name: "Remix Icons",
        shortName: "RI",
        icons: Ri,
    },

    si: {
        name: "Simple Icons",
        shortName: "SI",
        icons: Si,
    },

    tb: {
        name: "Tabler Icons",
        shortName: "TB",
        icons: Tb,
    },

    ti: {
        name: "Typicons",
        shortName: "TI",
        icons: Ti,
    },

    vsc: {
        name: "VS Code Icons",
        shortName: "VSC",
        icons: Vsc,
    },

    wi: {
        name: "Weather Icons",
        shortName: "WI",
        icons: Wi,
    },
};

/* =========================================================
   CREATE ICON LIST
========================================================= */

function createIconList() {
    const result = [];

    Object.entries(ICON_LIBRARIES).forEach(
        ([libraryKey, library]) => {
            if (!library.icons) return;

            Object.entries(library.icons).forEach(
                ([name, Icon]) => {
                    if (
                        typeof Icon !==
                        "function"
                    ) {
                        return;
                    }

                    result.push({
                        name,
                        library: libraryKey,
                        libraryName:
                            library.name,
                        Icon,
                    });
                }
            );
        }
    );

    return result;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function IconPickerPage({
    value = null,
    onChange,
}) {
    const [search, setSearch] =
        useState("");

    const [selectedLibrary, setSelectedLibrary] =
        useState("all");

    const [selectedIcon, setSelectedIcon] =
        useState(value);

    const [copied, setCopied] =
        useState(false);

    const [showLibraries, setShowLibraries] =
        useState(false);

    /*
     * Generate icons only once.
     */
    const allIcons = useMemo(
        () => createIconList(),
        []
    );

    /*
     * Filter icons.
     */
    const filteredIcons = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        let icons = allIcons;

        /*
         * Library filter
         */
        if (
            selectedLibrary !==
            "all"
        ) {
            icons = icons.filter(
                (icon) =>
                    icon.library ===
                    selectedLibrary
            );
        }

        /*
         * Search
         */
        if (query) {
            icons = icons.filter(
                (icon) =>
                    icon.name
                        .toLowerCase()
                        .includes(
                            query
                        )
            );
        }

        /*
         * Don't mount thousands
         * of icons at once.
         */
        return icons.slice(0, 300);
    }, [
        allIcons,
        search,
        selectedLibrary,
    ]);

    /* =====================================================
       SELECT ICON
    ===================================================== */

    const handleSelect = useCallback(
        (icon) => {
            const selected = {
                name: icon.name,
                library: icon.library,
            };

            setSelectedIcon(
                selected
            );

            onChange?.(selected);
        },
        [onChange]
    );

    /* =====================================================
       CLEAR
    ===================================================== */

    const handleClear = () => {
        setSelectedIcon(null);
        onChange?.(null);
    };

    /* =====================================================
       COPY
    ===================================================== */

    const handleCopy = async () => {
        if (!selectedIcon) return;

        const value = `${selectedIcon.library}:${selectedIcon.name}`;

        await navigator.clipboard.writeText(
            value
        );

        setCopied(true);

        toast.success(
            "Icon copied"
        );

        setTimeout(
            () => setCopied(false),
            1500
        );
    };

    /* =====================================================
       SELECTED ICON COMPONENT
    ===================================================== */

    const SelectedIcon =
        selectedIcon
            ? ICON_LIBRARIES[
                selectedIcon
                    .library
            ]?.icons?.[
            selectedIcon.name
            ]
            : null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* =================================================
                HEADER
            ================================================= */}

            <header className="sticky top-0 z-40 border-b bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Grid3X3
                                size={22}
                            />

                            <h1 className="text-xl font-semibold">
                                Icon Picker
                            </h1>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                            Select an icon from
                            the complete
                            React Icons
                            collection.
                        </p>
                    </div>

                    {selectedIcon && (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white">
                                {SelectedIcon && (
                                    <SelectedIcon
                                        size={
                                            22
                                        }
                                    />
                                )}
                            </div>

                            <div className="hidden sm:block">
                                <p className="text-sm font-medium">
                                    {
                                        selectedIcon.name
                                    }
                                </p>

                                <p className="text-xs text-gray-500">
                                    {
                                        ICON_LIBRARIES[
                                            selectedIcon
                                                .library
                                        ]
                                            ?.name
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleClear
                                }
                                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                title="Clear selection"
                            >
                                <X
                                    size={
                                        18
                                    }
                                />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* =================================================
                CONTENT
            ================================================= */}

            <main className="mx-auto max-w-7xl px-6 py-6">
                {/* =================================================
                    SEARCH + FILTER
                ================================================= */}

                <div className="mb-5 flex flex-col gap-3 md:flex-row">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={
                                search
                            }
                            onChange={(
                                e
                            ) =>
                                setSearch(
                                    e
                                        .target
                                        .value
                                )
                            }
                            placeholder="Search icons..."
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch(
                                        ""
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            >
                                <X
                                    size={
                                        16
                                    }
                                />
                            </button>
                        )}
                    </div>

                    {/* Mobile library selector */}
                    <div className="relative md:hidden">
                        <button
                            type="button"
                            onClick={() =>
                                setShowLibraries(
                                    (
                                        current
                                    ) =>
                                        !current
                                )
                            }
                            className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-sm"
                        >
                            <span>
                                {
                                    ICON_LIBRARIES[
                                        selectedLibrary
                                    ]
                                        .name
                                }
                            </span>

                            <ChevronDown
                                size={
                                    17
                                }
                            />
                        </button>

                        {showLibraries && (
                            <div className="absolute left-0 right-0 top-12 z-30 max-h-80 overflow-y-auto rounded-lg border bg-white p-1 shadow-xl">
                                {Object.entries(
                                    ICON_LIBRARIES
                                ).map(
                                    ([
                                        key,
                                        library,
                                    ]) => (
                                        <button
                                            key={
                                                key
                                            }
                                            type="button"
                                            onClick={() => {
                                                setSelectedLibrary(
                                                    key
                                                );

                                                setShowLibraries(
                                                    false
                                                );
                                            }}
                                            className={`w-full rounded-md px-3 py-2 text-left text-sm ${selectedLibrary ===
                                                    key
                                                    ? "bg-gray-100 font-medium"
                                                    : "hover:bg-gray-50"
                                                }`}
                                        >
                                            {
                                                library.name
                                            }
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* =================================================
                    DESKTOP LIBRARY TABS
                ================================================= */}

                <div className="mb-5 hidden overflow-x-auto rounded-lg border bg-white p-1 md:flex">
                    {Object.entries(
                        ICON_LIBRARIES
                    ).map(
                        ([
                            key,
                            library,
                        ]) => (
                            <button
                                key={
                                    key
                                }
                                type="button"
                                onClick={() =>
                                    setSelectedLibrary(
                                        key
                                    )
                                }
                                className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition ${selectedLibrary ===
                                        key
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {
                                    library.shortName
                                }
                            </button>
                        )
                    )}
                </div>

                {/* =================================================
                    RESULTS INFO
                ================================================= */}

                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium">
                            {
                                ICON_LIBRARIES[
                                    selectedLibrary
                                ].name
                            }
                        </span>

                        {search && (
                            <span className="ml-2 text-sm text-gray-500">
                                for "
                                {
                                    search
                                }
                                "
                            </span>
                        )}
                    </div>

                    <span className="text-xs text-gray-500">
                        Showing{" "}
                        {
                            filteredIcons.length
                        }{" "}
                        icons
                    </span>
                </div>

                {/* =================================================
                    ICON GRID
                ================================================= */}

                {filteredIcons.length >
                    0 ? (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
                        {filteredIcons.map(
                            ({
                                name,
                                library,
                                Icon,
                            }) => {
                                const isSelected =
                                    selectedIcon
                                        ?.name ===
                                    name &&
                                    selectedIcon
                                        ?.library ===
                                    library;

                                return (
                                    <button
                                        key={`${library}-${name}`}
                                        type="button"
                                        title={
                                            name
                                        }
                                        onClick={() =>
                                            handleSelect(
                                                {
                                                    name,
                                                    library,
                                                    Icon,
                                                }
                                            )
                                        }
                                        className={`group flex aspect-square flex-col items-center justify-center rounded-lg border p-2 transition ${isSelected
                                                ? "border-gray-900 bg-gray-900 text-white"
                                                : "border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50"
                                            }`}
                                    >
                                        <Icon
                                            size={
                                                23
                                            }
                                            className="shrink-0"
                                        />

                                        <span
                                            className={`mt-2 w-full truncate text-center text-[9px] ${isSelected
                                                    ? "text-white"
                                                    : "text-gray-400 group-hover:text-gray-700"
                                                }`}
                                        >
                                            {
                                                name
                                            }
                                        </span>
                                    </button>
                                );
                            }
                        )}
                    </div>
                ) : (
                    /* =================================================
                       EMPTY STATE
                    ================================================= */

                    <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed bg-white">
                        <div className="text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                <Search
                                    size={
                                        22
                                    }
                                    className="text-gray-400"
                                />
                            </div>

                            <h3 className="font-medium">
                                No icons found
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Try a
                                different
                                search
                                term.
                            </p>
                        </div>
                    </div>
                )}

                {/* =================================================
                    SELECTED PANEL
                ================================================= */}

                {selectedIcon && (
                    <div className="sticky bottom-4 mt-6 rounded-xl border bg-white p-4 shadow-lg">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl border bg-gray-50">
                                    {SelectedIcon && (
                                        <SelectedIcon
                                            size={
                                                30
                                            }
                                        />
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm font-semibold">
                                        {
                                            selectedIcon.name
                                        }
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        {
                                            ICON_LIBRARIES[
                                                selectedIcon
                                                    .library
                                            ]
                                                ?.name
                                        }
                                    </p>

                                    <p className="mt-1 font-mono text-xs text-gray-400">
                                        {
                                            selectedIcon.library
                                        }
                                        :
                                        {
                                            selectedIcon.name
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={
                                        handleCopy
                                    }
                                    className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                                >
                                    {copied ? (
                                        <>
                                            <Check
                                                size={
                                                    16
                                                }
                                            />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy
                                                size={
                                                    16
                                                }
                                            />
                                            Copy
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleClear
                                    }
                                    className="rounded-lg border px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}