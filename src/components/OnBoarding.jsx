import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Sparkles, UserCircle2 } from "lucide-react";
import GuidedWalkthrough from "./GuidedWalkthrough";

import {
    BASE_ONBOARDING_KEYS,
    getOnboardingKeys,
    readOnboardingFlag,
    writeOnboardingFlag,
} from "../utils/onboardingStorage";

const FIRST_SYNC_EVENT = "guestpostcrm:first-sync";

const OnBoarding = () => {
    const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);
    const [loadingAction, setLoadingAction] = useState(null);
    const [showGuidedWalkthrough, setShowGuidedWalkthrough] =
        useState(false);
    const navigate = useNavigate();

    const {
        crmEndpoint,
        user,
        businessEmail,
        db_name,
        id,
        isAuthenticated,
    } = useSelector((state) => state.user);

    const onboardingKeys = useMemo(
        () =>
            getOnboardingKeys({
                user,
                businessEmail,
                crmEndpoint,
                dbName: db_name,
                id,
            }),
        [businessEmail, crmEndpoint, db_name, id, user]
    );

       const searchParams = new URLSearchParams(window.location.search);
    const email = searchParams.get("email");

    const isRootEmailUrl =
        window.location.pathname === "/" && !!email;

    useEffect(() => {
        if (!isAuthenticated) return;

        if (isRootEmailUrl) {
            const alreadyShown =
                sessionStorage.getItem("onboardingShown");
 
            if (!alreadyShown) {
                setShowOnboardingPopup(true);
                sessionStorage.setItem("onboardingShown", "true");
            }
        }
    }, [isAuthenticated, isRootEmailUrl]);

    // Guided walkthrough
    useEffect(() => {
        if (!isAuthenticated) return;

        const maybeStartWalkthrough = () => {
            const syncDone = readOnboardingFlag(
                onboardingKeys.syncDone,
                BASE_ONBOARDING_KEYS.syncDone
            );

            const walkthroughSeen = readOnboardingFlag(
                onboardingKeys.guidedWalkthroughSeen,
                BASE_ONBOARDING_KEYS.guidedWalkthroughSeen
            );

            if (syncDone && !walkthroughSeen) {
                setShowGuidedWalkthrough(true);
            }
        };

        maybeStartWalkthrough();

        const syncHandler = (event) => {
            if (event.detail?.status === "completed") {
                maybeStartWalkthrough();
            }
        };

        window.addEventListener(FIRST_SYNC_EVENT, syncHandler);
        window.addEventListener("storage", maybeStartWalkthrough);

        return () => {
            window.removeEventListener(
                FIRST_SYNC_EVENT,
                syncHandler
            );
            window.removeEventListener(
                "storage",
                maybeStartWalkthrough
            );
        };
    }, [onboardingKeys, isAuthenticated]);

    const closeGuidedWalkthrough = () => {
        writeOnboardingFlag(
            onboardingKeys.guidedWalkthroughSeen,
            true
        );

        setShowGuidedWalkthrough(false);
    };

    const hitTryNowEndpoint = async () => {
        if (!email) return;

        await fetch(
            `https://crm.outrightsystems.org/index.php?entryPoint=trynow&email=${encodeURIComponent(
                email
            )}&sync=1`,
            {
                method: "GET",
                mode: "no-cors",
                cache: "no-store",
            }
        ).catch(() => { });
    };

    const redirectToDomainWithEmail = () => {
        window.location.assign(
            `${window.location.origin}?email=${encodeURIComponent(
                email
            )}`
        );
    };

    const handleCompleteProfile = async () => {
        try {
            setLoadingAction("complete");

            await hitTryNowEndpoint();

            setShowOnboardingPopup(false);

            // Complete profile specific action
            redirectToDomainWithEmail();
        } finally {
            setLoadingAction(null);
        }
    };

    const handleSkipForNow = async () => {
        try {
            setLoadingAction("skip");

            await hitTryNowEndpoint();

            setShowOnboardingPopup(false);

            // Skip specific action
            redirectToDomainWithEmail();
        } finally {
            setLoadingAction(null);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <>
            {/* ONBOARDING POPUP */}
            {showOnboardingPopup && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div
                        className="
              relative w-full max-w-md
              rounded-3xl overflow-hidden
              bg-white shadow-2xl
              border border-white/50
              animate-in fade-in zoom-in duration-300
            "
                    >
                        {/* TOP */}
                        <div className="h-28 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 relative">
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                                <div
                                    className="
                    w-20 h-20 rounded-full
                    bg-white shadow-xl
                    flex items-center justify-center
                    border-4 border-white
                  "
                                >
                                    <UserCircle2 className="w-12 h-12 text-violet-500" />
                                </div>
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="pt-14 pb-8 px-8 text-center">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <Sparkles className="text-yellow-500 w-5 h-5" />

                                <h2 className="text-2xl font-bold text-gray-800">
                                    Welcome 🎉
                                </h2>
                            </div>

                            <p className="text-gray-600 text-sm leading-relaxed">
                                Your account has been successfully created.
                                <br />
                                Complete your onboarding to personalize your
                                profile and start using all features.
                            </p>

                            {email && (
                                <div
                                    className="
                    mt-5 px-4 py-3 rounded-2xl
                    bg-violet-50 border border-violet-100
                  "
                                >
                                    <p className="text-xs text-violet-500 font-medium mb-1">
                                        Logged in as
                                    </p>

                                    <p className="text-sm font-bold text-violet-700 break-all">
                                        {email}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleCompleteProfile}
                                disabled={loadingAction !== null}
                                className="
        mt-6 w-full py-3.5 rounded-2xl
        bg-gradient-to-r from-violet-600 to-fuchsia-600
        text-white font-semibold
        shadow-lg shadow-violet-200
        hover:shadow-xl hover:scale-[1.02]
        transition-all duration-300
        disabled:opacity-80 disabled:cursor-not-allowed
    "
                            >
                                {loadingAction === "complete" ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Completing...
                                    </div>
                                ) : (
                                    "Complete Profile"
                                )}
                            </button>

                            <button
                                onClick={handleSkipForNow}
                                disabled={loadingAction !== null}
                                className={`
        mt-3 w-full py-3 rounded-2xl
        border border-gray-200
        bg-gray-50
        text-gray-600
        font-medium
        transition-all duration-300
        ${loadingAction === null
                                        ? "hover:bg-gray-100 hover:border-gray-300"
                                        : "opacity-60 cursor-not-allowed"
                                    }
    `}
                            >
                                {loadingAction === "skip" ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-500 rounded-full animate-spin" />
                                        Skipping...
                                    </div>
                                ) : (
                                    "Skip for now"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <GuidedWalkthrough
                open={showGuidedWalkthrough}
                onClose={closeGuidedWalkthrough}
                navigate={navigate}
            />
        </>
    );
};

export default OnBoarding;