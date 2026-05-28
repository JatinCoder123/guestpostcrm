import {
    Search,
    X,
    Copy,
    Check,
} from "lucide-react";

import {
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import { PageContext } from "../context/pageContext";

const STORAGE_KEY = "emailSearchHistory";

const GlobalSearch = () => {
    const {
        enteredEmail,
        setEnteredEmail,
        handleClear,
        handleDateClick,
    } = useContext(PageContext);

    const [search, setSearch] = useState("");

    const [copied, setCopied] =
        useState(false);

    const [searchHistory, setSearchHistory] =
        useState([]);

    const [showHistory, setShowHistory] =
        useState(false);

    const searchRef = useRef(null);

    // LOAD SEARCH HISTORY
    useEffect(() => {
        const history = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        setSearchHistory(history);
    }, []);

    // SYNC LOCAL SEARCH WITH GLOBAL EMAIL
    useEffect(() => {
        setSearch(enteredEmail || "");
    }, [enteredEmail]);

    // HANDLE OUTSIDE CLICK
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(e.target)
            ) {
                setShowHistory(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    // SAVE SEARCH HISTORY
    const saveSearchHistory = (value) => {
        const trimmedValue = value?.trim();

        if (!trimmedValue) return;

        let history = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        // REMOVE DUPLICATES
        history = history.filter(
            (item) => item.value !== trimmedValue
        );

        // ADD NEW HISTORY
        history.unshift({
            value: trimmedValue,
            time: new Date().toLocaleString(),
        });

        // LIMIT HISTORY
        history = history.slice(0, 3);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(history)
        );

        setSearchHistory(history);
    };

    // MAIN SEARCH
    const handleSearch = () => {
        const trimmedSearch = search?.trim();

        if (!trimmedSearch) {
            toast.error("Please enter an email");

            return;
        }

        // UPDATE GLOBAL CONTEXT
        setEnteredEmail(trimmedSearch);

        // SAVE HISTORY
        saveSearchHistory(trimmedSearch);

        // HIDE HISTORY
        setShowHistory(false);

        // TRIGGER SEARCH
        handleDateClick({
            email: trimmedSearch,
            navigate: "/",
        });
    };

    // ENTER KEY SEARCH
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    // COPY EMAIL
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(
                search
            );

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (err) {
            console.error(
                "Copy failed",
                err
            );
        }
    };

    // HISTORY CLICK
    const handleHistoryClick = (
        value
    ) => {
        setSearch(value);

        setEnteredEmail(value);

        saveSearchHistory(value);

        setShowHistory(false);

        handleDateClick({
            email: value,
            navigate: "/",
        });
    };

    // CLEAR SEARCH
    const handleInputClear = () => {
        setSearch("");

        setEnteredEmail("");

        handleClear();

        setShowHistory(false);
    };

    return (
        <div
            className="flex items-center gap-2"
            ref={searchRef}
            data-tour="top-nav-search"
        >
            {/* SEARCH INPUT */}
            <div className="relative w-95">
                {/* SEARCH ICON */}
                <Search
                    className="
                        absolute left-3 top-1/2
                        -translate-y-1/2
                        w-4 h-4 text-gray-400
                        z-10
                    "
                />

                {/* INPUT */}
                <input
                    value={search}
                    onFocus={() =>
                        setShowHistory(true)
                    }
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    autoComplete="off"
                    onKeyDown={
                        handleKeyPress
                    }
                    placeholder="Input Email to Search"
                    className="
                        w-full pl-10 pr-16 py-2
                        bg-gray-50 border
                        border-gray-200
                        rounded-lg
                        focus:outline-none
                        focus:ring-2
                        focus:ring-purple-500/20
                        focus:border-purple-500
                        shadow-lg
                    "
                />

                {/* COPY BUTTON */}
                {search && (
                    <motion.button
                        type="button"
                        whileTap={{
                            scale: 0.9,
                        }}
                        onClick={
                            handleCopy
                        }
                        className="
                            absolute right-10
                            top-1/2
                            -translate-y-1/2
                            w-6 h-6
                            flex items-center
                            justify-center
                            rounded-md
                            bg-blue-500
                            text-white
                            hover:bg-blue-600
                            z-10
                        "
                    >
                        {copied ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </motion.button>
                )}

                {/* CLEAR BUTTON */}
                {search && (
                    <motion.button
                        type="button"
                        whileTap={{
                            scale: 0.9,
                        }}
                        onClick={
                            handleInputClear
                        }
                        className="
                            absolute right-2
                            top-1/2
                            -translate-y-1/2
                            w-6 h-6
                            flex items-center
                            justify-center
                            rounded-md
                            bg-red-500
                            text-white
                            hover:bg-red-600
                            z-10
                        "
                    >
                        <X className="w-4 h-4" />
                    </motion.button>
                )}

                {/* SEARCH HISTORY */}
                {showHistory &&
                    searchHistory.length >
                    0 && (
                        <div
                            className="
                                absolute top-full
                                mt-2 w-full
                                z-50 bg-white
                                border border-gray-200
                                rounded-xl
                                shadow-2xl
                                overflow-hidden
                            "
                        >
                            {/* TITLE */}
                            <div
                                className="
                                    p-2 border-b
                                    bg-gray-50
                                    text-xs
                                    font-semibold
                                    text-gray-500
                                "
                            >
                                Recent Searches
                            </div>

                            {/* HISTORY LIST */}
                            {searchHistory.map(
                                (
                                    item,
                                    index
                                ) => (
                                    <button
                                        key={
                                            index
                                        }
                                        type="button"
                                        onClick={() =>
                                            handleHistoryClick(
                                                item.value
                                            )
                                        }
                                        className="
                                            w-full
                                            text-left
                                            px-3 py-3
                                            hover:bg-purple-50
                                            transition
                                            border-b
                                            last:border-b-0
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                gap-3
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                    min-w-0
                                                "
                                            >
                                                <Search
                                                    className="
                                                        w-4 h-4
                                                        text-purple-500
                                                        shrink-0
                                                    "
                                                />

                                                <span
                                                    className="
                                                        text-sm
                                                        text-gray-700
                                                        truncate
                                                    "
                                                >
                                                    {
                                                        item.value
                                                    }
                                                </span>
                                            </div>

                                            <span
                                                className="
                                                    text-[10px]
                                                    text-gray-400
                                                    whitespace-nowrap
                                                "
                                            >
                                                {
                                                    item.time
                                                }
                                            </span>
                                        </div>
                                    </button>
                                )
                            )}
                        </div>
                    )}
            </div>

            {/* SEARCH BUTTON */}
            <button
                type="button"
                onClick={handleSearch}
                className="
                    px-4 py-2
                    flex items-center gap-2
                    bg-blue-600 text-white
                    rounded-lg
                    hover:bg-blue-700
                    transition
                "
            >
                <Search className="w-4 h-4" />
            </button>
        </div>
    );
};

export default GlobalSearch;