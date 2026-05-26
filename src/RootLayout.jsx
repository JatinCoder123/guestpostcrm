import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { viewEmailAction } from "./store/Slices/viewEmail";
import { PageContext } from "./context/pageContext";
import DisplayIntro from "./components/DisplayIntro";
import WelcomeHeader from "./components/WelcomeHeader";
import Footer from "./components/Footer";
import { SocketContext } from "./context/SocketContext";
import { getDomain } from "./assets/assets";
import LowCreditWarning from "./components/LowCreditWarning";
import GuidedWalkthrough from "./components/GuidedWalkthrough";
import { toast } from "react-toastify";
import useRefresh from "./hooks/useRefresh";
import { unrepliedAction } from "./store/Slices/unrepliedEmails";
import { X, UserCircle2, Sparkles } from "lucide-react";
import {
  BASE_ONBOARDING_KEYS,
  getOnboardingKeys,
  readOnboardingFlag,
  writeOnboardingFlag,
} from "./utils/onboardingStorage";

const FIRST_SYNC_EVENT = "guestpostcrm:first-sync";

const RootLayout = () => {
  const [showAvatar, setShowAvatar] = useState(true);
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);
  const [showGuidedWalkthrough, setShowGuidedWalkthrough] = useState(false);

  const { message, error } = useSelector((state) => state.viewEmail);
  const { crmEndpoint, currentScore, user, businessEmail, db_name, id } =
    useSelector((state) => state.user);

  const onboardingKeys = useMemo(
    () =>
      getOnboardingKeys({
        user,
        businessEmail,
        crmEndpoint,
        dbName: db_name,
        id,
      }),
    [businessEmail, crmEndpoint, db_name, id, user],
  );

  const {
    displayIntro,
    setActivePage,
    collapsed,
  } = useContext(PageContext);

  const { currentAvatar, setCrm } = useContext(SocketContext);

  useRefresh();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const location = useLocation().pathname.split("/")[2];
  const pathname = useLocation().pathname;

  const searchParams = new URLSearchParams(window.location.search);
  const email = searchParams.get("email");

  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [pathname]);

  useEffect(() => {
    if (crmEndpoint) {
      setCrm(getDomain(crmEndpoint));
    }
  }, [crmEndpoint]);

  // Show avatar when new avatar arrives
  useEffect(() => {
    setShowAvatar(true);
  }, [currentAvatar]);

  useEffect(() => {
    if (message) {
      dispatch(viewEmailAction.clearAllMessage());
      toast.success(message);
    }

    if (error) {
      dispatch(viewEmailAction.clearAllErrors());
      toast.error(error);
    }
  }, [message, error]);

  // Set active page based on URL
  useEffect(() => {
    setActivePage(location);
  }, [location, setActivePage]);

  // Show onboarding popup
  useEffect(() => {
    if (email) {
      const alreadyShown = sessionStorage.getItem("onboardingShown");

      if (!alreadyShown) {
        setShowOnboardingPopup(true);
        sessionStorage.setItem("onboardingShown", "true");
      }
    }
  }, [email]);

  useEffect(() => {
    const maybeStartWalkthrough = () => {
      const syncDone = readOnboardingFlag(
        onboardingKeys.syncDone,
        BASE_ONBOARDING_KEYS.syncDone,
      );

      const walkthroughSeen = readOnboardingFlag(
        onboardingKeys.guidedWalkthroughSeen,
        BASE_ONBOARDING_KEYS.guidedWalkthroughSeen,
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
      window.removeEventListener(FIRST_SYNC_EVENT, syncHandler);
      window.removeEventListener("storage", maybeStartWalkthrough);
    };
  }, [onboardingKeys]);

  const closeGuidedWalkthrough = () => {
    writeOnboardingFlag(onboardingKeys.guidedWalkthroughSeen, true);
    setShowGuidedWalkthrough(false);
  };





  const isLowCredit = Number(currentScore) <= 0;

  if (displayIntro) {
    return <DisplayIntro key="intro" />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* SIDEBAR */}
      <div className="shrink-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Sidebar />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* TOP NAV */}
        <TopNav setShowAvatar={setShowAvatar} />

        {/* MAIN CONTENT */}
        <main
          ref={mainRef}
          className={`flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar transition-all duration-300 ${collapsed ? "ml-4" : "ml-0"
            }`}
        >
          <div className="p-3" data-tour="main-workspace">
            {isLowCredit && (
              <LowCreditWarning score={currentScore} />
            )}

            <div className="p-3">
              <WelcomeHeader />
              <Outlet />
            </div>
          </div>

          {/* ONBOARDING POPUP */}
          {showOnboardingPopup && (
            <OnboardPopUp
              setShowOnboardingPopup={setShowOnboardingPopup}
              email={email}
            />
          )}

          <Footer />
        </main>
      </div>

      {/* GUIDED WALKTHROUGH */}
      <GuidedWalkthrough
        open={showGuidedWalkthrough}
        onClose={closeGuidedWalkthrough}
        navigate={navigate}
      />
    </div>
  );
};

export default RootLayout;

function OnboardPopUp({ setShowOnboardingPopup }) {
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);

  const hitTryNowEndpoint = async () => {
    if (!email) return;

    await fetch(
      `https://crm.outrightsystems.org/index.php?entryPoint=trynow&email=${encodeURIComponent(
        email,
      )}&sync=1`,
      {
        method: "GET",
        mode: "no-cors",
        cache: "no-store",
      },
    ).catch(() => {
      // Keep onboarding moving even if the tracking endpoint is unavailable.
    });
  };
  const handleCompleteProfile = async () => {
    try {
      setIsOnboardingLoading(true);

      await hitTryNowEndpoint();

      setShowOnboardingPopup(false);
      window.location.assign("/profile");
    } finally {
      setIsOnboardingLoading(false);
    }
  };

  const handleSkipForNow = async () => {
    try {
      setIsOnboardingLoading(true);

      await hitTryNowEndpoint();

      setShowOnboardingPopup(false);
      window.location.reload();
    } finally {
      setIsOnboardingLoading(false);
    }
  };
  return <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
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
          Complete your onboarding to personalize your profile and
          start using all features.
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
          disabled={isOnboardingLoading}
          className="
                      mt-6 w-full py-3 rounded-2xl
                      bg-gradient-to-r from-violet-500 to-fuchsia-500
                      text-white font-semibold
                      shadow-lg hover:scale-[1.02]
                      transition-all duration-300
                      disabled:opacity-70 disabled:cursor-not-allowed
                    "
        >
          {isOnboardingLoading
            ? "Please wait..."
            : "Complete Profile"}
        </button>

        <button
          onClick={handleSkipForNow}
          disabled={isOnboardingLoading}
          className="
                      mt-3 text-sm text-gray-500
                      hover:text-gray-700 transition
                      disabled:opacity-70 disabled:cursor-not-allowed
                    "
        >
          {isOnboardingLoading
            ? "Loading..."
            : "Skip for now"}
        </button>
      </div>
    </div>
  </div>
}