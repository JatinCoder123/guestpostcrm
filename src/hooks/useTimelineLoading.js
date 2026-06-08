// useTimelineLoading.js

// import { useLedger } from "../queries/ledger.query";
import { useTimeline } from "../context/TimelineContext";
import { useContact } from "../queries/contact.queries";
import { useMailerSummary } from "../queries/mailerSummary.queries";
import { useThread } from "../queries/threads.queries";

export const useTimelineLoading = () => {
    const { currentEmail } = useTimeline();

    const contactQuery = useContact(currentEmail);
    const mailerSummaryQuery = useMailerSummary(currentEmail);
    const threadQuery = useThread(currentEmail);
    // const ledgerQuery = useLedger(currentEmail);

    const isTimelineLoading =
        contactQuery.isLoading ||
        mailerSummaryQuery.isLoading ||
        threadQuery.isLoading
    // ledgerQuery.isLoading;

    return {
        isTimelineLoading,

        contactLoading:
            contactQuery.isLoading,

        mailerSummaryLoading:
            mailerSummaryQuery.isLoading,

        threadLoading:
            threadQuery.isLoading,

        // ledgerLoading:
        //     ledgerQuery.isLoading,
    };
};