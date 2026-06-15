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

    byEmail: (
        email
    ) => [
            "mailer-summary",
            email,
        ],
    regen: (
        email
    ) => [
            "regen-summary",
            email,
        ],
};

export const useMailerSummary =
    (email) =>
        useQuery({
            queryKey: mailerSummaryKeys.byEmail(email),
            queryFn: () => getMailerSummary(email),
            enabled: Boolean(email),
        });
export const useRegenMailerSummary =
    () => {

        const queryClient =
            useQueryClient();

        return useMutation({
            mutationFn:
                regenMailerSummary,

            onSuccess: (
                _,
                email
            ) => {

                queryClient.invalidateQueries({
                    queryKey:
                        mailerSummaryKeys.byEmail(
                            email
                        ),
                });
            },
        });
    };