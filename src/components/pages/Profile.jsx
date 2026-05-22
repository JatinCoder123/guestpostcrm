import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { motion as Motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Globe2,
  Loader2,
  MailCheck,
  PartyPopper,
  Save,
  Sparkles,
  Trophy,
  UserCircle2,
  RefreshCw,
} from "lucide-react";
import { apiRequest, fetchGpc } from "../../services/api";
import { CREATE_DEAL_API_KEY } from "../../store/constants";
import { PageContext } from "../../context/pageContext";
import {
  BASE_ONBOARDING_KEYS,
  getOnboardingKeys,
  readOnboardingFlag,
  readOnboardingJson,
  writeOnboardingFlag,
} from "../../utils/onboardingStorage";

const FIRST_SYNC_EVENT = "guestpostcrm:first-sync";
const ALLOWED_SITES_MODULE = "outr_allowed_sites";

const getUserName = (user) =>
  user?.name || user?.full_name || user?.first_name || user?.user_name || "User";

const getEmail = ({ user, businessEmail }) =>
  businessEmail || user?.email || user?.email1 || user?.email_address || "";

const broadcastSyncState = (detail) => {
  window.dispatchEvent(new CustomEvent(FIRST_SYNC_EVENT, { detail }));
};

const Profile = () => {
  const { handleDateClick } = useContext(PageContext);
  const navigate = useNavigate();
  const { user, businessEmail, currentScore, crmEndpoint, db_name, id } = useSelector(
    (state) => state.user,
  );
  const onboardingKeys = getOnboardingKeys({
    user,
    businessEmail,
    crmEndpoint,
    dbName: db_name,
    id,
  });
  const [websites, setWebsites] = useState([]);
  const [websitesLoading, setWebsitesLoading] = useState(false);
  const [websiteSaving, setWebsiteSaving] = useState(false);
  const [websiteForm, setWebsiteForm] = useState({
    name: "",
    minimum_price: "",
    amount: "",
  });
  const [syncLimit, setSyncLimit] = useState(10);
  const [syncing, setSyncing] = useState(
    () =>
      localStorage.getItem(onboardingKeys.firstSyncStatus) === "loading" ||
      localStorage.getItem(BASE_ONBOARDING_KEYS.firstSyncStatus) === "loading",
  );
  const [syncResult, setSyncResult] = useState(() =>
    readOnboardingJson(
      onboardingKeys.firstSyncResult,
      BASE_ONBOARDING_KEYS.firstSyncResult,
    ),
  );
  const [syncDone, setSyncDone] = useState(
    () =>
      readOnboardingFlag(onboardingKeys.syncDone, BASE_ONBOARDING_KEYS.syncDone),
  );
  const celebratedCompleteRef = useRef(syncDone);

  const profileEmail = getEmail({ user, businessEmail });
  const step3Done =
    websites.length > 0 ||
    readOnboardingFlag(
      onboardingKeys.websiteDone,
      BASE_ONBOARDING_KEYS.websiteDone,
    );
  const completion = syncDone ? 100 : step3Done ? 70 : 50;
  const syncRecords = Array.isArray(syncResult?.records)
    ? syncResult.records
    : [];

  useEffect(() => {
    setSyncing(
      localStorage.getItem(onboardingKeys.firstSyncStatus) === "loading" ||
        localStorage.getItem(BASE_ONBOARDING_KEYS.firstSyncStatus) === "loading",
    );
    setSyncResult(
      readOnboardingJson(
        onboardingKeys.firstSyncResult,
        BASE_ONBOARDING_KEYS.firstSyncResult,
      ),
    );
    const nextSyncDone = readOnboardingFlag(
      onboardingKeys.syncDone,
      BASE_ONBOARDING_KEYS.syncDone,
    );
    setSyncDone(nextSyncDone);
    celebratedCompleteRef.current = nextSyncDone;
  }, [
    onboardingKeys.firstSyncResult,
    onboardingKeys.firstSyncStatus,
    onboardingKeys.syncDone,
  ]);

  useEffect(() => {
    const loadWebsites = async () => {
      if (!crmEndpoint) return;

      setWebsitesLoading(true);
      try {
        const data = await apiRequest({
          endpoint: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all`,
          method: "POST",
          params: { action_type: "get_data" },
          body: {
            module: ALLOWED_SITES_MODULE,
          },
          headers: {
            "x-api-key": CREATE_DEAL_API_KEY,
            "Content-Type": "application/json",
          },
        });
        if (data?.success === false) {
          throw new Error(data.message || "Unable to fetch websites");
        }
        setWebsites(Array.isArray(data) ? data : data?.data ?? []);
      } catch (error) {
        toast.error(error?.message || "Unable to fetch websites");
      } finally {
        setWebsitesLoading(false);
      }
    };

    loadWebsites();
  }, [crmEndpoint]);

  useEffect(() => {
    if (websites.length > 0) {
      writeOnboardingFlag(onboardingKeys.websiteDone, true);
      broadcastSyncState({ websiteDone: true });
    }
  }, [onboardingKeys.websiteDone, websites.length]);

  const celebrate = (options = {}) => {
    confetti({
      particleCount: options.particleCount ?? 80,
      spread: options.spread ?? 65,
      origin: options.origin ?? { y: 0.25 },
      colors: ["#10b981", "#6366f1", "#06b6d4", "#f59e0b"],
    });
  };

  const updateWebsiteField = (field, value) => {
    setWebsiteForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWebsiteSave = async (event) => {
    event.preventDefault();

    const name = websiteForm.name.trim();
    if (!name) {
      toast.error("Website name is required");
      return;
    }

    const minPrice = Number(websiteForm.minimum_price);
    const maxPrice = Number(websiteForm.amount);
    if (
      websiteForm.minimum_price !== "" &&
      websiteForm.amount !== "" &&
      !Number.isNaN(minPrice) &&
      !Number.isNaN(maxPrice) &&
      minPrice > maxPrice
    ) {
      toast.error("Minimum price cannot be greater than maximum price");
      return;
    }

    if (!crmEndpoint) {
      toast.error("CRM endpoint missing");
      return;
    }

    const payload = {
      module: ALLOWED_SITES_MODULE,
      name,
      minimum_price: websiteForm.minimum_price,
      amount: websiteForm.amount,
    };

    setWebsiteSaving(true);
    try {
      const data = await apiRequest({
        endpoint: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all`,
        method: "POST",
        params: { action_type: "post_data" },
        body: {
          parent_bean: payload,
        },
        headers: {
          "x-api-key": CREATE_DEAL_API_KEY,
          "Content-Type": "application/json",
        },
      });

      if (data?.success === false) {
        throw new Error(data.message || "Website save failed");
      }

      const createdWebsite = data?.data || data?.website || payload;
      setWebsites((prev) => [createdWebsite, ...prev]);
      writeOnboardingFlag(onboardingKeys.websiteDone, true);
      broadcastSyncState({ websiteDone: true });
      setWebsiteForm({ name: "", minimum_price: "", amount: "" });
      toast.success(data?.message || "Website saved successfully");
    } catch (error) {
      toast.error(error?.message || "Website save failed");
    } finally {
      setWebsiteSaving(false);
    }
  };

  const handleFirstSync = async () => {
    if (!profileEmail) {
      toast.error("Business email is required before running the first sync");
      return;
    }

    const limit = Math.min(Math.max(Number(syncLimit) || 1, 1), 100);
    setSyncLimit(limit);
    setSyncing(true);
    setSyncResult(null);
    localStorage.setItem(onboardingKeys.firstSyncStatus, "loading");
    localStorage.removeItem(onboardingKeys.firstSyncResult);
    broadcastSyncState({ status: "loading", limit });

    try {
      const data = await fetchGpc({
        method: "GET",
        params: {
          type: "first_sync",
          limit,
        },
      });

      const rawRecords =
        data?.data?.records ??
        data?.data?.data ??
        data?.records ??
        data?.data ??
        [];
      const records = Array.isArray(rawRecords) ? rawRecords : [];
      const count = data?.data?.count ?? data?.count ?? records.length ?? 0;
      const result = {
        count,
        records,
        message: data?.message || `First sync completed for ${count} records.`,
      };
      setSyncResult(result);
      setSyncDone(true);
      localStorage.setItem(onboardingKeys.firstSyncStatus, "completed");
      localStorage.setItem(
        onboardingKeys.firstSyncResult,
        JSON.stringify(result),
      );
      writeOnboardingFlag(onboardingKeys.syncDone, true);
      writeOnboardingFlag(onboardingKeys.firstSyncRecordsSeen, false);
      broadcastSyncState({ status: "completed", result });
      if (!celebratedCompleteRef.current) {
        celebratedCompleteRef.current = true;
        celebrate({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.35 },
        });
      }
      toast.success("All set! Your profile setup is complete");
    } catch (error) {
      localStorage.setItem(onboardingKeys.firstSyncStatus, "idle");
      broadcastSyncState({ status: "idle" });
      toast.error(error?.message || "First sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleRecordClick = (record) => {
    if (!record?.email) {
      toast.error("Email missing for this synced record");
      return;
    }
    localStorage.setItem("firstSyncThreadId", record.thread_id || "");
    localStorage.setItem("firstSyncMessageId", record.message_id || "");
    handleDateClick({ email: record.email, navigate: "/" });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
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

          <div className="grid gap-3 sm:grid-cols-[auto_auto_240px] sm:items-center">
            <MetricCard
              label="AI Credits"
              value={currentScore ?? "N/A"}
              tone="indigo"
            />
            <MetricCard
              label="Websites"
              value={websitesLoading ? "..." : websites.length}
              tone="emerald"
            />
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-wide text-slate-500">
                <span>{completion}% completed</span>
                <span>{syncDone ? "Ready" : "Setup"}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white">
                <Motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-linear-to-r from-emerald-500 via-indigo-500 to-cyan-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {!syncDone && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <SetupStep
              title="Step 3"
              label="Website Added"
              status={step3Done ? "complete" : "active"}
            />
            <SetupStep
              title="Step 4"
              label="Template Generation"
              status="skipped"
            />
            <SetupStep
              title="Step 5"
              label="First Sync"
              status={step3Done ? "active" : "locked"}
            />
          </div>
        </section>
      )}

      {syncDone && (
        <section className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-linear-to-r from-emerald-50 via-cyan-50 to-indigo-50 p-6 shadow-sm">
          <div className="absolute right-6 top-4 text-emerald-200">
            <Sparkles size={72} />
          </div>
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
                <Trophy size={30} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-emerald-600">
                  Setup Complete
                </p>
                <h2 className="text-2xl font-black text-slate-950">
                  You are ready to use GuestPostCRM
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Websites are added, inbox sync is done, and your workspace is
                  ready for action.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-emerald-700 shadow-sm">
                <PartyPopper size={18} />
                100% completed
              </div>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
              >
                <RefreshCw size={16} />
                Refresh Page
              </button>
            </div>
          </div>
        </section>
      )}

      {syncDone && (
        <FirstSyncRecordsTable
          records={syncRecords}
          result={syncResult}
          onRecordClick={handleRecordClick}
          onShowActivity={() => navigate("/RecentEntry")}
        />
      )}

      {!step3Done && !syncDone && (
        <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 text-indigo-600">
                <Globe2 size={20} />
                <p className="text-sm font-black uppercase tracking-widest">
                  Add Website
                </p>
              </div>
              <h2 className="mt-2 text-xl font-black text-slate-950">
                Add your first website to continue setup
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Add the website name and price range here. Saving this moves
                your profile from 50% to 70%, skips template generation, and
                unlocks the first inbox sync.
              </p>
            </div>

            <form
              onSubmit={handleWebsiteSave}
              className="grid gap-4 lg:grid-cols-[1.3fr_0.85fr_0.85fr_auto] lg:items-end"
            >
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Website Name
                </span>
                <input
                  type="text"
                  value={websiteForm.name}
                  onChange={(e) => updateWebsiteField("name", e.target.value)}
                  placeholder="example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Min Price
                </span>
                <input
                  type="number"
                  min="0"
                  value={websiteForm.minimum_price}
                  onChange={(e) =>
                    updateWebsiteField("minimum_price", e.target.value)
                  }
                  placeholder="50"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Max Price
                </span>
                <input
                  type="number"
                  min="0"
                  value={websiteForm.amount}
                  onChange={(e) => updateWebsiteField("amount", e.target.value)}
                  placeholder="150"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15"
                />
              </label>

              <button
                type="submit"
                disabled={websiteSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {websiteSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {websiteSaving ? "Saving..." : "Save Website"}
              </button>
            </form>
          </div>
        </section>
      )}

      {!syncDone && step3Done && (
        <section className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-600">
                <MailCheck size={20} />
                <p className="text-sm font-black uppercase tracking-widest">
                  First Inbox Sync
                </p>
              </div>
              <h2 className="mt-2 text-xl font-black text-slate-950">
                Pull your first unread records
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Template generation is skipped for this onboarding path. Choose
                the current sync limit, from 1 to 100. Completed records appear
                below and can be opened directly in the timeline.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Sync Limit
                </span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={syncLimit}
                  onChange={(e) => setSyncLimit(e.target.value)}
                  className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-black text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/15"
                />
              </label>

              <button
                onClick={handleFirstSync}
                disabled={syncing}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {syncing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
                {syncing ? "Syncing..." : "Run First Sync"}
              </button>
            </div>
          </div>

        {syncResult && (
          <Motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <p className="text-sm font-black text-emerald-700">
                    Sync completed
                  </p>
                  <p className="text-xs font-semibold text-emerald-700/75">
                    {syncResult.message} Found: {syncResult.count}
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-emerald-700">
                <PartyPopper size={16} />
                Ready to review
              </div>
            </div>
          </Motion.div>
        )}

        </section>
      )}
    </div>
  );
};

function MetricCard({ label, value, tone }) {
  const toneClasses = {
    indigo: "border-indigo-100 bg-indigo-50 text-indigo-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-xs font-black uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 text-xl font-black leading-none">{value}</p>
    </div>
  );
}

function SetupStep({ title, label, status }) {
  const statusStyles = {
    active: "border-cyan-200 bg-cyan-50 text-cyan-700",
    complete: "border-emerald-200 bg-emerald-50 text-emerald-700",
    skipped: "border-amber-200 bg-amber-50 text-amber-700",
    locked: "border-slate-200 bg-slate-50 text-slate-400",
  };

  const statusLabels = {
    active: "Active",
    complete: "Done",
    skipped: "Skipped",
    locked: "Locked",
  };

  return (
    <div className={`rounded-xl border p-3 ${statusStyles[status]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-widest">{title}</p>
        <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-black uppercase tracking-wide">
          {statusLabels[status]}
        </span>
      </div>
      <p className="mt-2 text-sm font-black text-slate-900">{label}</p>
    </div>
  );
}

function FirstSyncRecordsTable({ records, result, onRecordClick, onShowActivity }) {
  const count = result?.count ?? records.length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-600">
            <MailCheck size={20} />
            <p className="text-sm font-black uppercase tracking-widest">
              First Sync Records
            </p>
          </div>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            Records found from your first sync
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {result?.message || `First sync completed. Found: ${count}`}
          </p>
        </div>

        <button
          type="button"
          onClick={onShowActivity}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
        >
          <Activity size={16} />
          Show All Activity
        </button>
      </div>

      {records.length > 0 ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Subject</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {records.map((record, index) => (
                <tr
                  key={record.message_id || record.thread_id || index}
                  onClick={() => onRecordClick(record)}
                  className="cursor-pointer transition hover:bg-cyan-50"
                >
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {record.name || "Unknown"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-cyan-700">
                    {record.email || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {record.subject || "No subject"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm font-black text-slate-700">
            No records were returned by the first sync.
          </p>
        </div>
      )}
    </section>
  );
}

export default Profile;
