import { useQuery } from "@tanstack/react-query";

import {
    getMailerSummary,
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
};

export const useMailerSummary =
    (email) =>
        useQuery({
            queryKey:
                mailerSummaryKeys.byEmail(
                    email
                ),

            queryFn: () =>
                getMailerSummary(
                    email
                ),

            enabled:
                Boolean(email),

            staleTime:
                5 *
                60 *
                1000,
        });