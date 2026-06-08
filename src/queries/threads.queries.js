import { useQuery } from "@tanstack/react-query";
import { getThreadByEmail, getThreadByThreadId } from "../api/threads.api";

export const threadKeys =
{
    all: ["threads",],
    list: (email, threadId) => ["threads", email, threadId],
};

export const useThread = (email, threadId = "") =>
    useQuery({
        queryKey: threadKeys.list(email, threadId),
        queryFn: () =>
            threadId
                ? getThreadByThreadId(email, threadId)
                : getThreadByEmail(email),
        enabled: Boolean(email),
    });