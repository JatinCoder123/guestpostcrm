import { useQuery } from "@tanstack/react-query";
import { getDuplicateThreads, getThreadByEmail, getThreadByThreadId } from "../api/threads.api";
export const threadKeys =
{
    all: ["threads",],
    list: (email, threadId) => ["threads", email, threadId],
    duplicate: (email) => ["threads", "duplicate", email],
};

export const useThread = (email, threadId = "") =>
    useQuery({
        queryKey: threadKeys.list(email, threadId?? ""),
        queryFn: () =>
            threadId
                ? getThreadByThreadId(email, threadId)
                : getThreadByEmail(email),
        enabled: Boolean(email),
    });
    export const useDuplicateThreads = (email) =>
    useQuery({
        queryKey: threadKeys.duplicate(email),
        queryFn: () =>getDuplicateThreads(email),
        enabled: Boolean(email),
    });