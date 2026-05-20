import { createElement, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  DatabaseZap,
  Globe2,
  MailCheck,
  SkipForward,
  UserCircle2,
} from "lucide-react";
import { fetchGpc } from "../../services/api";
import { getManageWeb } from "../../store/Slices/webManager";

const WEBSITE_DONE_KEY = "guestpostcrm:onboarding:website_added";
const SYNC_DONE_KEY = "guestpostcrm:onboarding:first_sync_done";

const getUserName = (user) =>
  user?.name || user?.full_name || user?.first_name || user?.user_name || "User";

const getEmail = ({ user, businessEmail }) =>
  businessEmail || user?.email || user?.email1 || user?.email_address || "";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, businessEmail, db_name, currentScore } = useSelector(
    (state) => state.user,
  );
  const { websites, loading: websitesLoading } = useSelector(
    (state) => state.webManager,
  );
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncDone, setSyncDone] = useState(
    () => localStorage.getItem(SYNC_DONE_KEY) === "true",
  );

  const profileEmail = getEmail({ user, businessEmail });
  const step3Done =
    websites.length > 0 || localStorage.getItem(WEBSITE_DONE_KEY) === "true";
  const activeStep = searchParams.get("step") === "5" || step3Done ? 5 : 3;
  const completion = syncDone ? 100 : step3Done ? 85 : 70;

  const detailRows = useMemo(
    () => [
      { label: "Name", value: getUserName(user) },
      { label: "Email", value: profileEmail || "Not available" },
      { label: "Business Email", value: businessEmail || "Not available" },
      { label: "Database", value: db_name || "Not available" },
      { label: "AI Credits", value: currentScore ?? "Not available" },
      { label: "Websites Added", value: websites.length },
    ],
    [businessEmail, currentScore, db_name, profileEmail, user, websites.length],
  );

  useEffect(() => {
    dispatch(getManageWeb(false));
  }, [dispatch]);

  useEffect(() => {
    if (websites.length > 0) {
      localStorage.setItem(WEBSITE_DONE_KEY, "true");
    }
  }, [websites.length]);

  const handleAddWebsite = () => {
    navigate("/settings/websites?create=website&onboarding=step3");
  };

  const handleFirstSync = async () => {
    if (!profileEmail) {
      toast.error("Business email is required before running the first sync");
      return;
    }

    setSyncing(true);
    setSyncResult(null);

    try {
      const data = await fetchGpc({
        method: "POST",
        params: {
          type: "sync_opr",
          email: profileEmail,
          fetch_type: "email_unread",
          max: 100,
        },
      });
      const count = data?.total_found ?? data?.email_unread?.length ?? 0;
      setSyncResult({
        count,
        message: data?.message || `First sync completed for ${count} emails.`,
      });
      setSyncDone(true);
      localStorage.setItem(SYNC_DONE_KEY, "true");
      toast.success("First sync completed");
    } catch (error) {
      toast.error(error?.message || "First sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <UserCircle2 size={38} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-indigo-500">
                Profile Setup
              </p>
              <h1 className="text-2xl font-black text-slate-950">
                {getUserName(user)}
              </h1>
              <p className="text-sm text-slate-500">{profileEmail}</p>
            </div>
          </div>

          <div className="">
            <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-700">
              <span>{completion}% completed</span>
              <span>Step {activeStep}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full  from-emerald-500 via-indigo-500 to-cyan-500 transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {detailRows.map((row) => (
            <div key={row.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {row.label}
              </p>
              <p className="mt-1 break-all text-sm font-bold text-slate-900">
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600">
                <Globe2 size={20} />
                <p className="text-sm font-black uppercase tracking-widest">
                  Step 3
                </p>
              </div>
              <h2 className="mt-2 text-xl font-black text-slate-950">
                Add Websites, Traffic Levels & Pricing
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Add your publisher inventory or managed websites. Include the
                website URL, monthly traffic, minimum price, maximum price,
                categories, and country so GuestPostCRM can classify inventory
                and keep negotiations inside approved pricing limits.
              </p>
            </div>
            {step3Done && <CheckCircle2 className="text-emerald-500" />}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <InfoBlock
              icon={DatabaseZap}
              title="Pricing Ranges"
              text="Negotiation sequences can start near max pricing and adjust without leaving approved limits."
            />
            <InfoBlock
              icon={Activity}
              title="Traffic Tiers"
              text="Traffic helps classify premium, secondary, and entry-level websites for better matching."
            />
            <InfoBlock
              icon={BadgeCheck}
              title="Publisher Fit"
              text="Categories and country improve filtering, packages, and outreach targeting."
            />
          </div>

          <button
            onClick={handleAddWebsite}
            disabled={websitesLoading}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {step3Done ? "Add Another Website" : "Proceed Step 3"}
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <SkipForward size={18} />
              <p className="text-sm font-black uppercase tracking-widest">
                Step 4 Skipped
              </p>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Template generation is intentionally skipped in this profile flow.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-cyan-600">
                  <MailCheck size={18} />
                  <p className="text-sm font-black uppercase tracking-widest">
                    Step 5
                  </p>
                </div>
                <h2 className="mt-2 text-lg font-black text-slate-950">
                  Run First Sync for 100 Unread Emails
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Scan up to 100 unread emails and let GuestPostCRM prepare the
                  first intelligent inbox sync.
                </p>
              </div>
              {syncDone && <CheckCircle2 className="text-emerald-500" />}
            </div>

            {syncResult && (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                {syncResult.message} Found: {syncResult.count}
              </div>
            )}

            <button
              onClick={handleFirstSync}
              disabled={!step3Done || syncing}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {syncing ? "Syncing..." : syncDone ? "Run Sync Again" : "Run First Sync"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

function InfoBlock({ icon, title, text }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      {createElement(icon, { className: "text-indigo-500", size: 18 })}
      <h3 className="mt-3 text-sm font-black text-slate-900">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}

export default Profile;
