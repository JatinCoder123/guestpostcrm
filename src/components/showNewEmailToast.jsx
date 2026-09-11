import { toast } from "react-hot-toast";
import { MailCheck } from "lucide-react";
import { queryClient } from "../lib/queryClient";
import { emailKeys } from "../queries/email.queries";

export const showNewEmailToast = ({
    dispatch,
    navigate,
    handleClear,
    preferencesAction,
    unrepliedAction,
}) => {
    toast.custom(
        (t) => (
            <div
                className={`
                    ${t.visible
                        ? "animate-enter"
                        : "animate-leave"
                    }
                    w-[340px]
                    overflow-hidden
                    rounded-xl
                    border
                    border-border
                    bg-card
                    shadow-lg
                `}
            >
                <div className="flex items-start gap-3 p-3">
                    {/* Icon */}
                    <div
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-primary/10
                        "
                    >
                        <MailCheck
                            size={18}
                            className="text-primary"
                        />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                        <p
                            className="
                                text-sm
                                font-semibold
                                text-card-foreground
                            "
                        >
                            New Email Received
                        </p>

                        <p
                            className="
                                mt-0.5
                                text-xs
                                text-muted-foreground
                            "
                        >
                            A new email has arrived.
                        </p>
                    </div>

                    {/* Open Button */}
                    <button
                        type="button"
                        onClick={() => {
                            dispatch(
                                unrepliedAction.setShowNewEmailBanner(
                                    false
                                )
                            );

                            dispatch(
                                preferencesAction.resetTablePreferences(
                                    "emails"
                                )
                            );

                            handleClear();

                            queryClient.removeQueries({
                                queryKey: emailKeys.all,
                            });

                            navigate("/");

                            toast.dismiss(t.id);
                        }}
                        className="
                            shrink-0
                            rounded-md
                            bg-muted
                            px-2.5
                            py-1.5
                            text-xs
                            font-medium
                            text-foreground
                            transition-colors
                            hover:bg-accent
                        "
                    >
                        Open
                    </button>
                </div>

                {/* Progress */}
                <div className="h-[2px] bg-muted">
                    <div
                        className="
                            h-full
                            bg-primary
                            animate-[progress_7s_linear_forwards]
                        "
                    />
                </div>
            </div>
        ),
        {
            duration: 7000,
            position: "top-right",
        }
    );
};