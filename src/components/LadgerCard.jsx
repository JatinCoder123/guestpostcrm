import { useCallback, useRef, useState } from "react";
import { MailCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Visualization from "./Visualization";
import PromptLadger from "./PromptLadger";
import { useSelector } from "react-redux";
import MessageModal from "./MessageModal";
import { useInfiniteChildLedger } from "../queries/ledger.queries";

const LadgerCard = ({ timelineData, handleMessageClick }) => {
    const [activeParent, setActiveParent] = useState(null);

    const toggleParent = (id) => {
        setActiveParent((prev) => (prev === id ? null : id));
    };

    return (
        <div className="relative px-4 pb-1 pt-3 sm:px-5">
            {timelineData.map((parent) => {
                const ParentIcon = MailCheck;
                const isOpen = activeParent === parent.id;

                return (
                    <div key={parent.id} className="relative flex gap-4 pb-3 sm:gap-5">
                        {/* LEFT SIDE */}
                        <div className="relative flex w-10 shrink-0 flex-col items-center pt-1">
                            <div className="z-20 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm ring-4 ring-white">
                                <ParentIcon className="h-4 w-4" />
                            </div>

                            <div className="absolute bottom-[-13px] top-9 border-l border-dashed border-gray-500"></div>
                        </div>

                        {/* RIGHT */}
                        <div className="relative min-w-0 flex-1">
                            <ParentCard parent={parent} toggleParent={toggleParent} />
                            {isOpen && <ChildCard parentId={parent.id} handleMessageClick={handleMessageClick} />}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

function ParentCard({ parent, toggleParent }) {
    return (
        <div
            onClick={() => toggleParent(parent.id)}
            className="group min-h-[56px] cursor-pointer rounded-lg border border-sky-300 bg-sky-50 px-4 py-3 transition hover:border-blue-400 hover:bg-sky-100/70 hover:shadow-sm"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-medium text-gray-900">
                        {parent.description}
                    </h2>
                </div>

                <div className="shrink-0 text-right">
                    <p className="whitespace-nowrap text-[11px] text-gray-500">
                        {parent.date_entered}
                    </p>
                </div>
            </div>
        </div>
    );
}


function ChildCard({ parentId, handleMessageClick }) {
    const [hoveredChild, setHoveredChild] = useState(null);
    const { data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isPending, } = useInfiniteChildLedger(parentId)
    const ladgerChild = data?.pages?.flatMap((page) => page.data || []) ?? [];
    const childLoading = isPending || isFetchingNextPage;
    const navigateTo = useNavigate();

    const [, setActiveVisualizationId] = useState(null);
    const [, setActivePromptId] = useState(null);
    const [openChildId, setOpenChildId] = useState(null);
    const observer = useRef();
    const lastChildRef = useCallback(
        (node) => {
            if (isFetchingNextPage) return;

            if (observer.current) {
                observer.current.disconnect();
            }

            observer.current = new IntersectionObserver(
                (entries) => {
                    if (
                        entries[0].isIntersecting &&
                        hasNextPage &&
                        !isFetchingNextPage
                    ) {
                        fetchNextPage();
                    }
                },
                {
                    rootMargin: "300px",
                }
            );

            if (node) {
                observer.current.observe(node);
            }
        },
        [fetchNextPage, hasNextPage, isFetchingNextPage]
    );
    return (
        <div className="mt-5 ml-2 space-y-4 relative">
            {childLoading &&
                [...Array(2)].map((_, index) => (
                    <div
                        key={index}
                        className="relative animate-pulse"
                    >
                        {/* CONNECTOR */}
                        <div className="absolute -left-[40px] top-6 w-8 border-t-2 border-dashed border-gray-200"></div>

                        {/* DOT */}
                        <div className="absolute -left-[56px] top-[18px] w-3 h-3 rounded-full bg-gray-200 z-20"></div>

                        {/* CARD */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-5 py-4 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gray-200"></div>

                                <div className="space-y-2">
                                    <div className="h-3 w-32 bg-gray-200 rounded"></div>
                                    <div className="h-2 w-20 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            }
            {ladgerChild?.map((child, index) => {
                const tabs = [];

                if (child?.message_id_c) {
                    tabs.push({
                        key: "message",
                        label: "Message",
                    });
                }

                if (child?.prompt_ledger_id) {
                    tabs.push({
                        key: "prompt",
                        label: "Prompt",
                    });
                }

                if (child?.stage_ledger_id) {
                    tabs.push({
                        key: "visualization",
                        label: "Visualization",
                    });
                }

                if (child?.template_id) {
                    tabs.push({
                        key: "template",
                        label: "Template",
                    });
                }

                const defaultTab = tabs?.[0]?.key;
                const isLast = index === ladgerChild.length - 1;
                return (
                    <div
                        key={child.id}
                        ref={isLast ? lastChildRef : null}
                    >
                        <ChildItem
                            child={child}
                            Icon={child.icon}
                            isHovered={hoveredChild === child.id}
                            hoveredChild={hoveredChild}
                            setHoveredChild={setHoveredChild}
                            tabs={tabs}
                            defaultTab={defaultTab}
                            navigateTo={navigateTo}
                            handleMessageClick={handleMessageClick}
                            setActivePromptId={setActivePromptId}
                            setActiveVisualizationId={setActiveVisualizationId}
                            openChildId={openChildId}
                            setOpenChildId={setOpenChildId}
                        />
                    </div>
                );
            })}
        </div>
    );
}
function ChildItem({
    child,
    Icon,
    isHovered,
    setHoveredChild,
    tabs,
    defaultTab,
    navigateTo,
    setActivePromptId,
    setActiveVisualizationId,
    openChildId,
    setOpenChildId,
}) {
    const [activeTab, setActiveTab] =
        useState(defaultTab);
    const { count, contactInfo } = useSelector(state => state.viewEmail)
    const isOpen =
        openChildId === child.id;

    return (
        <div
            className="relative group"
            onMouseEnter={() =>
                setHoveredChild(
                    child.id,
                )
            }
            onMouseLeave={() =>
                setHoveredChild(
                    null,
                )
            }
        >
            {/* CONNECTOR */}
            <div className="absolute -left-[40px] top-6 w-8 border-t-2 border-dashed border-gray-300"></div>

            {/* DOT */}
            <div
                className={`
                    absolute -left-[56px] top-[18px]
                    w-3 h-3 rounded-full border-2 border-green-400
                    ${isHovered
                        ? "bg-green-300"
                        : "bg-white"
                    }
                    z-20
                `}
            ></div>

            {/* CARD */}
            <div
                onClick={() =>
                    setOpenChildId(
                        (prev) =>
                            prev ===
                                child.id
                                ? null
                                : child.id,
                    )
                }
                className={`
                    bg-white border rounded-xl overflow-hidden
                    transition-all duration-300 cursor-pointer
                    ${isHovered
                        ? "border-green-200 shadow-lg scale-[1.01]"
                        : "border-gray-200 shadow-sm"
                    }
                `}
            >
                {/* HEADER */}
                <div className="px-5 pt-4 pb-4 flex items-center justify-between">
                    {/* LEFT */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-50">
                            <img
                                src={
                                    Icon
                                }
                            />
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-800">
                                {
                                    child?.type_c
                                }
                            </h3>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="text-right ml-4">
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                            {
                                child?.date_entered
                            }
                        </p>

                        <p className="text-sm text-gray-700 mt-1 whitespace-nowrap">
                            <i>
                                - by
                            </i>{" "}
                            {!Array.isArray(
                                child?.user_details,
                            )
                                ? child
                                    .user_details
                                    ?.name
                                : "GPC"}
                        </p>
                    </div>
                </div>
            </div>

            {/* POPUP */}
            {isOpen && (
                <div
                    onClick={() =>
                        setOpenChildId(
                            null,
                        )
                    }
                    className="
                        fixed inset-0 z-[9999]
                        flex items-center justify-center
                        bg-black/40 backdrop-blur-sm
                        p-4
                    "
                >
                    {/* MODAL */}
                    <div
                        onClick={(
                            e,
                        ) =>
                            e.stopPropagation()
                        }
                        className="
                            bg-white
                            w-full
                            max-w-7xl
                            h-[90vh]
                            rounded-2xl
                            overflow-hidden
                            shadow-2xl
                            flex flex-col
                        "
                    >
                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            {/* TABS */}
                            <div className="flex gap-2 flex-wrap">
                                {tabs.map(
                                    (
                                        tab,
                                    ) => (
                                        <button
                                            key={
                                                tab.key
                                            }
                                            onClick={() =>
                                                setActiveTab(
                                                    tab.key,
                                                )
                                            }
                                            className={`
                                                px-4 py-2 rounded-lg text-sm font-medium transition
                                                ${activeTab ===
                                                    tab.key
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }
                                            `}
                                        >
                                            {
                                                tab.label
                                            }
                                        </button>
                                    ),
                                )}
                            </div>

                            {/* CLOSE */}
                            <button
                                onClick={() =>
                                    setOpenChildId(
                                        null,
                                    )
                                }
                                className="
                                    w-10 h-10
                                    rounded-lg
                                    hover:bg-gray-100
                                    text-xl
                                "
                            >
                                ✕
                            </button>
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 overflow-hidden p-4">
                            {/* MESSAGE */}
                            {activeTab ===
                                "message" && (
                                    <MessageModal
                                        isModal={
                                            false
                                        }
                                        email={contactInfo?.email1}
                                        threadId={child.thread_id_c}
                                        count={count}
                                        messageId={
                                            child.message_id_c
                                        }
                                    />
                                )}

                            {/* PROMPT */}
                            {activeTab ===
                                "prompt" && (
                                    <PromptLadger
                                        isModal={
                                            false
                                        }
                                        activePromptId={
                                            child.prompt_ledger_id
                                        }
                                        setActivePromptId={
                                            setActivePromptId
                                        }
                                    />
                                )}

                            {/* VISUALIZATION */}
                            {activeTab ===
                                "visualization" && (
                                    <Visualization
                                        isModal={
                                            false
                                        }
                                        activeVisualizationId={
                                            child.stage_ledger_id
                                        }
                                        setActiveVisualizationId={
                                            setActiveVisualizationId
                                        }
                                    />
                                )}

                            {/* TEMPLATE */}
                            {activeTab ===
                                "template" && (
                                    <div className="h-full flex items-center justify-center">
                                        <button
                                            onClick={() =>
                                                navigateTo(
                                                    "/settings/templates",
                                                    {
                                                        state:
                                                        {
                                                            templateId:
                                                                child.template_id,
                                                        },
                                                    },
                                                )
                                            }
                                            className="
                                            px-6 py-3
                                            bg-green-600
                                            text-white
                                            rounded-xl
                                            hover:bg-green-700
                                        "
                                        >
                                            Open
                                            Template
                                        </button>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default LadgerCard;