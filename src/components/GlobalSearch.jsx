import {
    Search,
    X,
    Copy,
    Check,
    User,
    Loader2,
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
import { useDebounce } from "../hooks/useDebounce";
import { useContactSearch } from "../queries/contact.queries";

const STORAGE_KEY = "emailSearchHistory";
const MIN_SEARCH_LENGTH = 2;

const getContactName = (contact) =>
    contact?.full_name?.trim() ||
    [contact?.first_name, contact?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

const GlobalSearch = () => {
    const {
        enteredEmail,
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

    // Keyboard-highlighted contact suggestion (-1 = none)
    const [activeIndex, setActiveIndex] =
        useState(-1);

    const searchRef = useRef(null);

    // CONTACT SUGGESTIONS (DEBOUNCED)
    const trimmedSearch = search.trim();
    const debouncedSearch = useDebounce(trimmedSearch, 400);

    const {
        data: contactResults = [],
        isFetching: searchingContacts,
    } = useContactSearch(debouncedSearch);

    const isTyping = trimmedSearch.length >= MIN_SEARCH_LENGTH;

    const isSuggestionsLoading =
        isTyping &&
        (searchingContacts || debouncedSearch !== trimmedSearch);

    const suggestions =
        isTyping && debouncedSearch === trimmedSearch
            ? contactResults.filter((contact) => contact?.email1)
            : [];

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

    // RESET HIGHLIGHT WHEN RESULTS CHANGE
    useEffect(() => {
        setActiveIndex(-1);
    }, [debouncedSearch]);

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

    // RUN SEARCH
    // handleDateClick already stores the term, updates the history and
    // navigates to the timeline, so every search goes through it alone.
    const runSearch = (value) => {
        const trimmedValue = value?.trim();

        if (!trimmedValue) {
            toast.error("Please enter an email");

            return;
        }

        setSearch(trimmedValue);

        setShowHistory(false);

        setActiveIndex(-1);

        handleDateClick({
            email: trimmedValue,
            navigate: "/",
        });
    };

    // MAIN SEARCH
    const handleSearch = () => {
        runSearch(search);
    };

    // KEYBOARD HANDLING
    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown" && suggestions.length) {
            e.preventDefault();
            setShowHistory(true);
            setActiveIndex((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : 0
            );
            return;
        }

        if (e.key === "ArrowUp" && suggestions.length) {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev > 0 ? prev - 1 : suggestions.length - 1
            );
            return;
        }

        if (e.key === "Escape") {
            setShowHistory(false);
            setActiveIndex(-1);
            return;
        }

        if (e.key === "Enter") {
            const activeContact = suggestions[activeIndex];

            runSearch(
                activeContact ? activeContact.email1 : search
            );
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

    // CLEAR SEARCH
    const handleInputClear = () => {
        setSearch("");

        handleClear();

        setShowHistory(false);

        setActiveIndex(-1);
    };

    const showSuggestionsPanel = showHistory && isTyping;

    const showHistoryPanel =
        showHistory && !isTyping && searchHistory.length > 0;

    return (
        <div
            ref={searchRef}
            data-tour="top-nav-search"
            className="
            relative flex w-full min-w-0 p-1
            items-center rounded-full
            border border-gray-300 bg-white
            shadow-[0_4px_8px_rgba(0,0,0,0.22)]
            lg:w-[450px] lg:max-w-[60vw]
        "
        >
            {/* SEARCH ICON */}
            <Search
                className="
                ml-3 h-5 w-5 shrink-0
                text-gray-400
                lg:ml-6
            "
            />

            {/* INPUT */}
            <input
                value={search}
                onFocus={() => setShowHistory(true)}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setShowHistory(true);
                }}
                autoComplete="off"
                onKeyDown={handleKeyDown}
                placeholder="Search anything..."
                className="
                w-0 min-w-0 flex-1
                bg-transparent
                px-2
                text-sm text-gray-700
                placeholder:text-gray-400
                focus:outline-none
                sm:text-base
            "
            />

            {/* COPY BUTTON */}
            {search && (
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopy}
                    aria-label="Copy search text"
                    className="
                    mr-1 flex h-7 w-7 shrink-0
                    items-center justify-center
                    rounded-full
                    text-blue-600
                    transition hover:bg-blue-50
                    sm:mr-2 sm:h-8 sm:w-8
                "
                >
                    {copied ? (
                        <Check className="h-4 w-4" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                </motion.button>
            )}

            {/* CLEAR BUTTON */}
            {search && (
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={handleInputClear}
                    aria-label="Clear search"
                    className="
                    mr-1 flex h-7 w-7 shrink-0
                    items-center justify-center
                    rounded-full
                    text-red-500
                    transition hover:bg-red-50
                    sm:mr-2 sm:h-8 sm:w-8
                "
                >
                    <X className="h-4 w-4" />
                </motion.button>
            )}

            {/* SEARCH BUTTON */}
            <button
                type="button"
                onClick={handleSearch}
                aria-label="Search"
                className="
                flex shrink-0 items-center justify-center rounded-full
                bg-gradient-to-r from-search-primary to-search-secondary
                h-8 w-8
                text-base font-small text-white
                transition
                hover:bg-blue-700
                active:scale-[0.98]
                sm:h-auto sm:w-auto sm:px-4 sm:py-1
            "
            >
                <Search className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">Search</span>
            </button>

            {/* CONTACT SUGGESTIONS */}
            {showSuggestionsPanel && (
                <div
                    className="
                    absolute left-0 right-0 top-full
                    z-999 mt-3
                    overflow-hidden rounded-2xl
                    border border-gray-200
                    bg-white shadow-2xl
                "
                >
                    <div
                        className="
                        flex items-center justify-between
                        border-b bg-gray-50
                        p-2 text-xs font-semibold
                        text-gray-500
                    "
                    >
                        <span>Contacts</span>

                        {isSuggestionsLoading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                        )}
                    </div>

                    {!isSuggestionsLoading && suggestions.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500">
                            No contacts found. Press Enter to search "{trimmedSearch}".
                        </div>
                    )}

                    <div className="max-h-80 overflow-y-auto">
                        {suggestions.map((contact, index) => {
                            const name = getContactName(contact);

                            return (
                                <button
                                    key={contact.id || contact.email1}
                                    type="button"
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => runSearch(contact.email1)}
                                    className={`
                                    w-full border-b
                                    px-4 py-3 text-left
                                    transition
                                    last:border-b-0
                                    hover:bg-blue-50
                                    ${activeIndex === index ? "bg-blue-50" : ""}
                                `}
                                >
                                    <div className="flex min-w-0 items-center gap-2">
                                        <User className="h-4 w-4 shrink-0 text-blue-600" />

                                        <div className="flex min-w-0 flex-col">
                                            {name && (
                                                <span className="truncate text-sm font-medium text-gray-800">
                                                    {name}
                                                </span>
                                            )}

                                            <span className="truncate text-xs text-gray-500">
                                                {contact.email1}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* SEARCH HISTORY */}
            {showHistoryPanel && (
                <div
                    className="
                    absolute left-0 right-0 top-full
                    z-999 mt-3
                    overflow-hidden rounded-2xl
                    border border-gray-200
                    bg-white shadow-2xl
                "
                >
                    <div
                        className="
                        border-b bg-gray-50
                        p-2 text-xs font-semibold
                        text-gray-500
                    "
                    >
                        Recent Searches
                    </div>

                    {searchHistory.map((item, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() =>
                                runSearch(item.value)
                            }
                            className="
                            w-full border-b
                            px-4 py-3 text-left
                            transition
                            last:border-b-0
                            hover:bg-blue-50
                        "
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2">
                                    <Search className="h-4 w-4 shrink-0 text-blue-600" />

                                    <span className="truncate text-sm text-gray-700">
                                        {item.value}
                                    </span>
                                </div>

                                <span className="whitespace-nowrap text-[10px] text-gray-400">
                                    {item.time}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
