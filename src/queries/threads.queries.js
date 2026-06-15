import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDuplicateThreads, getThreadByEmail, getThreadByThreadId } from "../api/threads.api";
export const threadKeys =
{
    all: ["threads",],
    list: (email, threadId) => ["threads", email, threadId],
    duplicate: (email) => ["threads", "duplicate", email],
};

export const useThread = (email, threadId = "") => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: threadKeys.list(email, threadId ?? ""),
        queryFn: async () => {
            const data = threadId
                ? await getThreadByThreadId(email, threadId)
                : await getThreadByEmail(email);

            // If fetched by email, also cache by threadId
            console.log("thread dta", data)
            if (!threadId && data?.thread_id) {
                queryClient.setQueryData(
                    threadKeys.list(email, data.thread_id),
                    data
                );
            }

            return data;
        },
        enabled: Boolean(email),
    });
};
export const useDuplicateThreads = (email) =>
    useQuery({
        queryKey: threadKeys.duplicate(email),
        queryFn: () => getDuplicateThreads(email),
        enabled: Boolean(email),
    });