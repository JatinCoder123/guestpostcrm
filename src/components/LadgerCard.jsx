import { useCallback, useRef, useState } from "react";
import { MailCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Visualization from "./Visualization";
import PromptLadger from "./PromptLadger";
import { useSelector } from "react-redux";
import MessageModal from "./MessageModal";
import {
    useInfiniteChildLedger,
} from "../queries/ledger.queries";


const LadgerCard = ({
    timelineData,
    handleMessageClick,
}) => {
    const [
        activeParent,
        setActiveParent,
    ] = useState(null);


    const toggleParent = (id) => {
        setActiveParent((prev) =>
            prev === id
                ? null
                : id
        );
    };


    return (
        <div
            className="
        relative
        px-4
        pb-1
        pt-3
        sm:px-5
      "
        >

            {timelineData.map(
                (parent) => {

                    const ParentIcon =
                        MailCheck;

                    const isOpen =
                        activeParent ===
                        parent.id;


                    return (
                        <div
                            key={parent.id}
                            className="
                relative
                flex
                gap-4
                pb-3
                sm:gap-5
              "
                        >

                            {/* =================================================
                  LEFT SIDE
              ================================================== */}

                            <div
                                className="
                  relative
                  flex
                  w-10
                  shrink-0
                  flex-col
                  items-center
                  pt-1
                "
                            >

                                <div
                                    className="
                    z-20
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-primary
                    text-primary-foreground
                    shadow-sm
                    ring-4
                    ring-background
                  "
                                >
                                    <ParentIcon
                                        className="
                      h-4
                      w-4
                    "
                                    />
                                </div>


                                <div
                                    className="
                    absolute
                    bottom-[-13px]
                    top-9
                    border-l
                    border-dashed
                    border-border
                  "
                                />

                            </div>


                            {/* =================================================
                  RIGHT SIDE
              ================================================== */}

                            <div
                                className="
                  relative
                  min-w-0
                  flex-1
                "
                            >

                                <ParentCard
                                    parent={parent}
                                    toggleParent={
                                        toggleParent
                                    }
                                />


                                {isOpen && (
                                    <ChildCard
                                        parentId={
                                            parent.id
                                        }
                                        handleMessageClick={
                                            handleMessageClick
                                        }
                                    />
                                )}

                            </div>

                        </div>
                    );
                }
            )}

        </div>
    );
};


/* ================================================================
   PARENT CARD
================================================================ */

function ParentCard({
    parent,
    toggleParent,
}) {
    return (
        <div
            onClick={() =>
                toggleParent(
                    parent.id
                )
            }
            className="
        group
        min-h-[56px]
        cursor-pointer
        rounded-lg
        border
        border-primary/20
        bg-background
        px-4
        py-3
        transition
        hover:border-primary/40
        hover:bg-background/10
        hover:shadow-sm
      "
        >

            <div
                className="
          flex
          items-start
          justify-between
          gap-4
        "
            >

                <div className="min-w-0">

                    <h2
                        className="
              truncate
              text-sm
              font-medium
              text-foreground
            "
                    >
                        {parent.description}
                    </h2>

                </div>


                <div
                    className="
            shrink-0
            text-right
          "
                >

                    <p
                        className="
              whitespace-nowrap
              text-[11px]
              text-muted-foreground
            "
                    >
                        {parent.date_entered}
                    </p>

                </div>

            </div>

        </div>
    );
}


/* ================================================================
   CHILD CARD
================================================================ */

function ChildCard({
    parentId,
    handleMessageClick,
}) {

    const [
        hoveredChild,
        setHoveredChild,
    ] = useState(null);


    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isPending,
    } =
        useInfiniteChildLedger(
            parentId
        );


    const ladgerChild =
        data?.pages?.flatMap(
            (page) =>
                page.data || []
        ) ?? [];


    const childLoading =
        isPending ||
        isFetchingNextPage;


    const navigateTo =
        useNavigate();


    const [
        ,
        setActiveVisualizationId,
    ] = useState(null);


    const [
        ,
        setActivePromptId,
    ] = useState(null);


    const [
        openChildId,
        setOpenChildId,
    ] = useState(null);


    const observer =
        useRef();


    const lastChildRef =
        useCallback(
            (node) => {

                if (
                    isFetchingNextPage
                ) {
                    return;
                }


                if (observer.current) {
                    observer.current.disconnect();
                }


                observer.current =
                    new IntersectionObserver(
                        (entries) => {

                            if (
                                entries[0]
                                    .isIntersecting &&
                                hasNextPage &&
                                !isFetchingNextPage
                            ) {
                                fetchNextPage();
                            }

                        },
                        {
                            rootMargin:
                                "300px",
                        }
                    );


                if (node) {
                    observer.current.observe(
                        node
                    );
                }

            },
            [
                fetchNextPage,
                hasNextPage,
                isFetchingNextPage,
            ]
        );


    return (
        <div
            className="
        relative
        mt-5
        ml-2
        space-y-4
      "
        >

            {/* =================================================
          LOADING SKELETON
      ================================================== */}

            {childLoading &&
                [...Array(2)].map(
                    (_, index) => (

                        <div
                            key={index}
                            className="
                relative
                animate-pulse
              "
                        >

                            {/* Connector */}

                            <div
                                className="
                  absolute
                  -left-[40px]
                  top-6
                  w-8
                  border-t-2
                  border-dashed
                  border-border
                "
                            />


                            {/* Dot */}

                            <div
                                className="
                  absolute
                  -left-[56px]
                  top-[18px]
                  z-20
                  h-3
                  w-3
                  rounded-full
                  bg-muted
                "
                            />


                            {/* Card */}

                            <div
                                className="
                  overflow-hidden
                  rounded-xl
                  border
                  border-border
                  bg-card
                  shadow-sm
                "
                            >

                                <div
                                    className="
                    flex
                    items-center
                    gap-3
                    px-5
                    py-4
                  "
                                >

                                    <div
                                        className="
                      h-9
                      w-9
                      rounded-lg
                      bg-muted
                    "
                                    />


                                    <div className="space-y-2">

                                        <div
                                            className="
                        h-3
                        w-32
                        rounded
                        bg-muted
                      "
                                        />

                                        <div
                                            className="
                        h-2
                        w-20
                        rounded
                        bg-muted/70
                      "
                                        />

                                    </div>

                                </div>

                            </div>

                        </div>
                    )
                )}


            {/* =================================================
          CHILD ITEMS
      ================================================== */}

            {ladgerChild?.map(
                (child, index) => {

                    const tabs = [];


                    if (
                        child?.message_id_c
                    ) {
                        tabs.push({
                            key: "message",
                            label: "Message",
                        });
                    }


                    if (
                        child?.prompt_ledger_id
                    ) {
                        tabs.push({
                            key: "prompt",
                            label: "Prompt",
                        });
                    }


                    if (
                        child?.stage_ledger_id
                    ) {
                        tabs.push({
                            key: "visualization",
                            label: "Visualization",
                        });
                    }


                    if (
                        child?.template_id
                    ) {
                        tabs.push({
                            key: "template",
                            label: "Template",
                        });
                    }


                    const defaultTab =
                        tabs?.[0]?.key;


                    const isLast =
                        index ===
                        ladgerChild.length - 1;


                    return (
                        <div
                            key={child.id}
                            ref={
                                isLast
                                    ? lastChildRef
                                    : null
                            }
                        >

                            <ChildItem
                                child={child}
                                Icon={child.icon}
                                isHovered={
                                    hoveredChild ===
                                    child.id
                                }
                                hoveredChild={
                                    hoveredChild
                                }
                                setHoveredChild={
                                    setHoveredChild
                                }
                                tabs={tabs}
                                defaultTab={
                                    defaultTab
                                }
                                navigateTo={
                                    navigateTo
                                }
                                handleMessageClick={
                                    handleMessageClick
                                }
                                setActivePromptId={
                                    setActivePromptId
                                }
                                setActiveVisualizationId={
                                    setActiveVisualizationId
                                }
                                openChildId={
                                    openChildId
                                }
                                setOpenChildId={
                                    setOpenChildId
                                }
                            />

                        </div>
                    );
                }
            )}

        </div>
    );
}


/* ================================================================
   CHILD ITEM
================================================================ */

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

    const [
        activeTab,
        setActiveTab,
    ] = useState(
        defaultTab
    );


    const {
        count,
        contactInfo,
    } =
        useSelector(
            (state) =>
                state.viewEmail
        );


    const isOpen =
        openChildId ===
        child.id;


    return (
        <div
            className="
        group
        relative
      "
            onMouseEnter={() =>
                setHoveredChild(
                    child.id
                )
            }
            onMouseLeave={() =>
                setHoveredChild(null)
            }
        >

            {/* =================================================
          CONNECTOR
      ================================================== */}

            <div
                className="
          absolute
          -left-[40px]
          top-6
          w-8
          border-t-2
          border-dashed
          border-border
        "
            />


            {/* =================================================
          DOT
      ================================================== */}

            <div
                className={`
          absolute
          -left-[56px]
          top-[18px]
          z-20
          h-3
          w-3
          rounded-full
          border-2
          border-primary
          ${isHovered
                        ? "bg-primary/30"
                        : "bg-card"
                    }
        `}
            />


            {/* =================================================
          CARD
      ================================================== */}

            <div
                onClick={() =>
                    setOpenChildId(
                        (prev) =>
                            prev === child.id
                                ? null
                                : child.id
                    )
                }
                className={`
          cursor-pointer
          overflow-hidden
          rounded-xl
          border
          bg-card
          transition-all
          duration-300

          ${isHovered
                        ? "border-primary/30 shadow-lg scale-[1.01]"
                        : "border-border shadow-sm"
                    }
        `}
            >

                {/* =================================================
            HEADER
        ================================================== */}

                <div
                    className="
            flex
            items-center
            justify-between
            px-5
            pb-4
            pt-4
          "
                >

                    {/* LEFT */}

                    <div
                        className="
              flex
              items-center
              gap-3
            "
                    >

                        <div
                            className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-primary/10
              "
                        >

                            {Icon && (
                                <img
                                    src={Icon}
                                    alt=""
                                    className="
                    h-5
                    w-5
                    object-contain
                  "
                                />
                            )}

                        </div>


                        <div>

                            <h3
                                className="
                  font-medium
                  text-foreground
                "
                            >
                                {child?.type_c}
                            </h3>

                        </div>

                    </div>


                    {/* RIGHT */}

                    <div
                        className="
              ml-4
              text-right
            "
                    >

                        <p
                            className="
                whitespace-nowrap
                text-xs
                text-muted-foreground
              "
                        >
                            {child?.date_entered}
                        </p>


                        <p
                            className="
                mt-1
                whitespace-nowrap
                text-sm
                text-muted-foreground
              "
                        >
                            <i>- by</i>{" "}

                            {!Array.isArray(
                                child?.user_details
                            )
                                ? child
                                    .user_details
                                    ?.name
                                : "GPC"}
                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
          POPUP
      ================================================== */}

            {isOpen && (
                <div
                    onClick={() =>
                        setOpenChildId(null)
                    }
                    className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-foreground/40
            p-4
            backdrop-blur-sm
          "
                >

                    {/* =================================================
              MODAL
          ================================================== */}

                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        className="
              flex
              h-[90vh]
              w-full
              max-w-7xl
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-background
              shadow-2xl
            "
                    >

                        {/* =================================================
                HEADER
            ================================================== */}

                        <div
                            className="
                flex
                items-center
                justify-between
                border-b
                border-border
                px-6
                py-4
              "
                        >

                            {/* TABS */}

                            <div
                                className="
                  flex
                  flex-wrap
                  gap-2
                "
                            >

                                {tabs.map(
                                    (tab) => (

                                        <button
                                            key={
                                                tab.key
                                            }
                                            type="button"
                                            onClick={() =>
                                                setActiveTab(
                                                    tab.key
                                                )
                                            }
                                            className={`
                        rounded-lg
                        px-4
                        py-2
                        text-sm
                        font-medium
                        transition

                        ${activeTab ===
                                                    tab.key
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                                                }
                      `}
                                        >
                                            {tab.label}
                                        </button>

                                    )
                                )}

                            </div>


                            {/* CLOSE */}

                            <button
                                type="button"
                                onClick={() =>
                                    setOpenChildId(
                                        null
                                    )
                                }
                                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-lg
                  text-xl
                  text-muted-foreground
                  transition
                  hover:bg-accent
                  hover:text-foreground
                "
                                aria-label="Close"
                            >
                                <span
                                    aria-hidden="true"
                                >
                                    ✕
                                </span>
                            </button>

                        </div>


                        {/* =================================================
                CONTENT
            ================================================== */}

                        <div
                            className="
                flex-1
                overflow-hidden
                bg-background
                p-4
              "
                        >

                            {/* MESSAGE */}

                            {activeTab ===
                                "message" && (
                                    <MessageModal
                                        isModal={false}
                                        email={
                                            contactInfo?.email1
                                        }
                                        threadId={
                                            child.thread_id_c
                                        }
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
                                        isModal={false}
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
                                        isModal={false}
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
                                    <div
                                        className="
                    flex
                    h-full
                    items-center
                    justify-center
                  "
                                    >

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigateTo(
                                                    "/settings/templates",
                                                    {
                                                        state: {
                                                            templateId:
                                                                child.template_id,
                                                        },
                                                    }
                                                )
                                            }
                                            className="
                      rounded-xl
                      bg-primary
                      px-6
                      py-3
                      text-primary-foreground
                      shadow-sm
                      transition
                      hover:bg-primary/90
                    "
                                        >
                                            Open Template
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