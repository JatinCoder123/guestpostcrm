import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    getMailerSummary,
    regenMailerSummary,
} from "../api/mailerSummary.api";

export const mailerSummaryKeys =
{
    all: [
        "mailer-summary",
    ],

    byThread: (
        threadId
    ) => [
            "mailer-summary",
            threadId,
        ],
    regen: (
        email
    ) => [
            "regen-summary",
            email,
        ],
};

export const useMailerSummary =
    (threadId) =>
        useQuery({
            queryKey: mailerSummaryKeys.byThread(threadId),
            queryFn: () => getMailerSummary(threadId),
            enabled: Boolean(threadId),
        });
export const useRegenMailerSummary =
    () => {

        const queryClient =
            useQueryClient();

        return useMutation({
            mutationFn:
                regenMailerSummary,

            onSuccess: (_,) => {

                queryClient.invalidateQueries({
                    queryKey:
                        mailerSummaryKeys.all
                });
            },
        });
    };