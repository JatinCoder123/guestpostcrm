import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { motion as Motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Activity,
  ArrowRight,
  BotIcon,
  CheckCircle2,
  Edit3,
  Globe2,
  Eye,
  Loader2,
  MailCheck,
  PartyPopper,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Trophy,
  UserCircle2,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { apiRequest, fetchGpc } from "../../services/api";
import { CREATE_DEAL_API_KEY, FETCH_GPC_X_API_KEY } from "../../store/constants";
import { PageContext } from "../../context/pageContext";
import {
  ONBOARDING_STEP,
  fetchOnboardingProgress,
  getOnboardingRecordName,
  upsertOnboardingProgress,
} from "../../utils/onboardingCompletion";

const FIRST_SYNC_EVENT = "guestpostcrm:first-sync";
const ALLOWED_SITES_MODULE = "outr_allowed_sites";

const TINY_INIT = {
  height: "100%",
  menubar: "file edit view insert format tools table help",
  branding: false,
  statusbar: true,
  plugins: `
    advlist autolink directionality visualblocks visualchars wordcount
    fullscreen preview searchreplace insertdatetime lists link image media
    table charmap pagebreak nonbreaking anchor code codesample help
    emoticons quickbars
  `,
  toolbar: `
    undo redo | blocks fontfamily fontsize |
    bold italic underline strikethrough forecolor backcolor |
    alignleft aligncenter alignright alignjustify |
    bullist numlist outdent indent |
    link image media table | preview fullscreen | code help
  `,
  toolbar_mode: "sliding",
  quickbars_selection_toolbar:
    "bold italic underline | quicklink h2 h3 blockquote",
  quickbars_insert_toolbar: "image media table",
  image_advtab: true,
  image_caption: true,
  image_title: true,
  automatic_uploads: true,
  table_advtab: true,
  table_cell_advtab: true,
  table_row_advtab: true,
  table_resize_bars: true,
  link_assume_external_targets: true,
  link_context_toolbar: true,
  contextmenu: "link image table",
  resize: true,
  content_style: `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 15px;
      line-height: 1.6;
      color: #333;
    }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; }
    table, th, td { border: 1px solid #ccc; }
    th, td { padding: 8px; }
  `,
};

const createEmptyWebsiteForm = () => ({
  name: "",
  minimum_price: "",
  amount: "",
});

const getOnboardingTemplateValue = (template) =>
  template?.onboarding ??
  template?.on_boarding ??
  template?.is_onboarding ??
  template?.onboarding_template;

const isOnboardingTemplate = (template) => {
  const value = getOnboardingTemplateValue(template);
  if (value === true) return true;
  return String(value ?? "").trim().toLowerCase() === "1";
};

const normalizeTemplateRows = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.templates)) return data.templates;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.emailTemplates)) return data.emailTemplates;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.templates)) return data.data.templates;
  if (Array.isArray(data?.data?.records)) return data.data.records;
  if (Array.isArray(data?.data?.emailTemplates)) return data.data.emailTemplates;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.result?.templates)) return data.result.templates;
  return [];
};

const getTemplateHtml = (template) =>
  template?.body_html || template?.html || template?.body || "";

const getUserName = (user) =>
  user?.name || user?.full_name || user?.first_name || user?.user_name || "User";

const decodeHtmlEntities = (str) => {
  if (!str) return str;
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};



const broadcastSyncState = (detail) => {
  window.dispatchEvent(new CustomEvent(FIRST_SYNC_EVENT, { detail }));
};

const getMappableWebsiteFields = (availableFields = {}) => {
  const skipFields = new Set([
    "id",
    "date_entered",
    "date_modified",
    "modified_user_id",
    "modified_by_name",
    "created_by",
    "created_by_name",
    "deleted",
    "created_by_link",
    "modified_user_link",
    "assigned_user_id",
    "assigned_user_name",
    "assigned_user_link",
    "description",
    "li_count",
    "gp_count",
  ]);

  return Object.entries(availableFields)
    .filter(([key]) => !skipFields.has(key))
    .map(([key, meta]) => ({
      key,
      label: meta.label
        .replace(/^LBL_/, "")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      required: meta.required,
    }));
};

const Profile = () => {
  const { handleDateClick } = useContext(PageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, businessEmail, currentScore, crmEndpoint } = useSelector(
    (state) => state.user,
  );
  const { tinyKey: TINY_EDITOR_API_KEY } = useSelector((state) => state.tinyKey);
  const { loading: contactLoading, contacts } = useSelector(
    (state) => state.contacts,
  );
  const [websites, setWebsites] = useState([]);
  const [websitesLoading, setWebsitesLoading] = useState(false);
  const [websiteSaving, setWebsiteSaving] = useState(false);
  const [websiteForms, setWebsiteForms] = useState([createEmptyWebsiteForm()]);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [savedTemplateIds, setSavedTemplateIds] = useState(() => new Set());
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [templateStage, setTemplateStage] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [templatePreview, setTemplatePreview] = useState(null);
  const [stages, setStages] = useState({});
  const [motiveList, setMotiveList] = useState([]);
  const [motiveListLoading, setMotiveListLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiMotive, setAiMotive] = useState("");
  const [aiDetails, setAiDetails] = useState("");
  const [aiName, setAiName] = useState("");
  const [aiStage, setAiStage] = useState("");
  const [aiIncludeHtml, setAiIncludeHtml] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [profileDeleting, setProfileDeleting] = useState(false);
  const [syncLimit, setSyncLimit] = useState(10);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [firstSyncRecordsSeen, setFirstSyncRecordsSeen] = useState(false);
  const [crmOnboardingStep, setCrmOnboardingStep] = useState(0);
  const [crmProgressLoading, setCrmProgressLoading] = useState(true);
  const celebratedCompleteRef = useRef(false);

  const profileEmail = businessEmail || user.email;
  const onboardingRecordName = getOnboardingRecordName({
    user,
    businessEmail: profileEmail,
  });
  const contactOnboardingDone =
    Array.isArray(contacts) && contacts.length > 0;
  const step3Done =
    contactOnboardingDone || crmOnboardingStep >= ONBOARDING_STEP.WEBSITE_ADDED;
  const templateDone =
    contactOnboardingDone || crmOnboardingStep >= ONBOARDING_STEP.TEMPLATE_READY;
  const syncDone =
    contactOnboardingDone ||
    crmOnboardingStep >= ONBOARDING_STEP.FIRST_SYNC_DONE;
  const onboardingLoading =
    crmProgressLoading || (contactLoading && !contactOnboardingDone);
  const completion = syncDone ? 100 : templateDone ? 85 : step3Done ? 70 : 50;
  const syncRecords = Array.isArray(syncResult?.records)
    ? syncResult.records
    : [];
  const forceShowFirstSyncRecords = new URLSearchParams(location.search).get(
    "showFirstSync",
  ) === "1";
  const showFirstSyncRecords =
    syncDone &&
    syncResult &&
    (!firstSyncRecordsSeen || forceShowFirstSyncRecords);

  useEffect(() => {
    celebratedCompleteRef.current =
      contactOnboardingDone ||
      crmOnboardingStep >= ONBOARDING_STEP.FIRST_SYNC_DONE;
  }, [contactOnboardingDone, crmOnboardingStep]);

  useEffect(() => {
    if (!contactOnboardingDone) return;

    setCrmOnboardingStep((step) =>
      Math.max(step, ONBOARDING_STEP.FIRST_SYNC_DONE),
    );
    setSyncing(false);
    setFirstSyncRecordsSeen(true);
    celebratedCompleteRef.current = true;
    broadcastSyncState({
      status: "completed",
      result: syncResult,
      onboardingStep: ONBOARDING_STEP.FIRST_SYNC_DONE,
    });
  }, [contactOnboardingDone, syncResult]);

  const loadWebsites = useCallback(async () => {
    if (!crmEndpoint) return [];

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
      const nextWebsites = Array.isArray(data) ? data : data?.data ?? [];
      setWebsites(nextWebsites);
      return nextWebsites;
    } catch (error) {
      toast.error(error?.message || "Unable to fetch websites");
      return [];
    } finally {
      setWebsitesLoading(false);
    }
  }, [crmEndpoint]);

  useEffect(() => {
    loadWebsites();
  }, [loadWebsites]);

  const loadTemplates = useCallback(async () => {
    if (!crmEndpoint) return [];

    setTemplatesLoading(true);
    try {
      const data = await fetchGpc({
        method: "GET",
        params: { type: "templates" },
      });
      const rows = normalizeTemplateRows(data);
      const onboardingTemplates = rows.filter(isOnboardingTemplate);
      setTemplates(onboardingTemplates);
      return onboardingTemplates;
    } catch (error) {
      toast.error(error?.message || "Unable to fetch onboarding templates");
      return [];
    } finally {
      setTemplatesLoading(false);
    }
  }, [crmEndpoint]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const result = await fetchGpc({
          method: "POST",
          params: { type: "templates" },
          body: { stages: 1 },
        });
        if (result && typeof result === "object" && !Array.isArray(result)) {
          setStages(result);
        }
      } catch (error) {
        console.error("Failed to fetch template stages:", error);
      }
    };

    fetchStages();
  }, []);

  useEffect(() => {
    const fetchMotives = async () => {
      setMotiveListLoading(true);
      try {
        const result = await fetchGpc({
          params: { type: "motive_list" },
        });
        setMotiveList(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Failed to fetch motive list:", error);
        setMotiveList([]);
      } finally {
        setMotiveListLoading(false);
      }
    };

    fetchMotives();
  }, []);

  useEffect(() => {
    if (!crmEndpoint || !onboardingRecordName) {
      setCrmProgressLoading(false);
      return;
    }

    let ignore = false;

    const loadCrmOnboardingProgress = async () => {
      setCrmProgressLoading(true);
      try {
        const current = await fetchOnboardingProgress({
          crmEndpoint,
          name: onboardingRecordName,
        });
        const progress =
          current.step > 0
            ? current
            : await upsertOnboardingProgress({
                crmEndpoint,
                name: onboardingRecordName,
                step: ONBOARDING_STEP.PROFILE_STARTED,
              });
        if (ignore) return;

        setCrmOnboardingStep(progress.step);
        if (progress.step >= ONBOARDING_STEP.WEBSITE_ADDED) {
          broadcastSyncState({
            websiteDone: true,
            onboardingStep: progress.step,
          });
        }
        if (progress.step >= ONBOARDING_STEP.FIRST_SYNC_DONE) {
          setSyncing(false);
          setFirstSyncRecordsSeen(true);
          celebratedCompleteRef.current = true;
          broadcastSyncState({
            status: "completed",
            onboardingStep: progress.step,
          });
        }
      } catch (error) {
        console.error("Failed to load CRM onboarding progress:", error);
      } finally {
        if (!ignore) setCrmProgressLoading(false);
      }
    };

    loadCrmOnboardingProgress();

    return () => {
      ignore = true;
    };
  }, [crmEndpoint, onboardingRecordName]);

  const celebrate = (options = {}) => {
    confetti({
      particleCount: options.particleCount ?? 80,
      spread: options.spread ?? 65,
      origin: options.origin ?? { y: 0.25 },
      colors: ["#10b981", "#6366f1", "#06b6d4", "#f59e0b"],
    });
  };

  const completeWebsiteStep = async () => {
    await upsertOnboardingProgress({
      crmEndpoint,
      name: onboardingRecordName,
      step: ONBOARDING_STEP.WEBSITE_ADDED,
    });
    setCrmOnboardingStep(ONBOARDING_STEP.WEBSITE_ADDED);
    broadcastSyncState({
      websiteDone: true,
      onboardingStep: ONBOARDING_STEP.WEBSITE_ADDED,
    });
  };

  const completeTemplateStep = async () => {
    await upsertOnboardingProgress({
      crmEndpoint,
      name: onboardingRecordName,
      step: ONBOARDING_STEP.TEMPLATE_READY,
    });
    setCrmOnboardingStep(ONBOARDING_STEP.TEMPLATE_READY);
    broadcastSyncState({
      onboardingStep: ONBOARDING_STEP.TEMPLATE_READY,
    });
  };

  const saveWebsitePayload = async (payload) => {
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

    return data;
  };

  const updateWebsiteField = (index, field, value) => {
    setWebsiteForms((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addWebsiteRow = () => {
    setWebsiteForms((prev) => [...prev, createEmptyWebsiteForm()]);
  };

  const removeWebsiteRow = (index) => {
    setWebsiteForms((prev) =>
      prev.length === 1
        ? [createEmptyWebsiteForm()]
        : prev.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const handleWebsiteSave = async (event) => {
    event.preventDefault();

    const validForms = websiteForms
      .map((item) => ({
        name: item.name.trim(),
        minimum_price: item.minimum_price,
        amount: item.amount,
      }))
      .filter(
        (item) =>
          item.name || item.minimum_price !== "" || item.amount !== "",
      );

    if (validForms.length === 0) {
      toast.error("At least one website is required");
      return;
    }

    for (const [index, item] of validForms.entries()) {
      if (!item.name) {
        toast.error(`Website name is required in row ${index + 1}`);
        return;
      }

      const minPrice = Number(item.minimum_price);
      const maxPrice = Number(item.amount);
      if (
        item.minimum_price !== "" &&
        item.amount !== "" &&
        !Number.isNaN(minPrice) &&
        !Number.isNaN(maxPrice) &&
        minPrice > maxPrice
      ) {
        toast.error(
          `Minimum price cannot be greater than maximum price in row ${index + 1}`,
        );
        return;
      }
    }

    if (!crmEndpoint) {
      toast.error("CRM endpoint missing");
      return;
    }

    setWebsiteSaving(true);
    try {
      const createdWebsites = [];

      for (const item of validForms) {
        const payload = {
          module: ALLOWED_SITES_MODULE,
          name: item.name,
          minimum_price: item.minimum_price,
          amount: item.amount,
          description: item.name
        };
        const data = await saveWebsitePayload(payload);
        createdWebsites.push(data?.data || data?.website || payload);
      }

      setWebsites((prev) => [...createdWebsites, ...prev]);
      await completeWebsiteStep();
      setWebsiteForms([createEmptyWebsiteForm()]);
      toast.success(
        createdWebsites.length === 1
          ? "Website saved successfully"
          : `${createdWebsites.length} websites saved successfully`,
      );
    } catch (error) {
      toast.error(error?.message || "Website save failed");
    } finally {
      setWebsiteSaving(false);
    }
  };

  const handleWebsiteImportSuccess = async () => {
    await loadWebsites();
    await completeWebsiteStep();
  };

  const openTemplateEditor = (template) => {
    setActiveTemplate(template);
    setTemplateName(template?.name || "");
    setTemplateStage(template?.stage || template?.stage_type || "others");
    setTemplateDescription(template?.description || "");
    setTemplateContent(getTemplateHtml(template) || "<p>Start writing here...</p>");
  };

  const closeTemplateEditor = () => {
    if (templateSaving || aiGenerating) return;
    setActiveTemplate(null);
    setShowAiModal(false);
  };

  const openAiTemplateModal = () => {
    setAiName(templateName || activeTemplate?.name || "");
    setAiStage(
      templateStage ||
        activeTemplate?.stage ||
        activeTemplate?.stage_type ||
        Object.keys(stages)[0] ||
        "others",
    );
    setAiMotive("");
    setAiDetails(templateDescription || activeTemplate?.description || "");
    setAiIncludeHtml(true);
    setShowAiModal(true);
  };

  const handleGenerateTemplate = async () => {
    if (!crmEndpoint) {
      toast.error("CRM endpoint missing");
      return;
    }

    setAiGenerating(true);
    try {
      const formData = new FormData();
      formData.append("motive", aiMotive);
      formData.append("details", aiDetails);
      formData.append("current_name", aiName);
      formData.append("stage", aiStage);

      if (aiIncludeHtml && templateContent) {
        formData.append("html", decodeHtmlEntities(templateContent));
      }

      const response = await fetch(
        `${crmEndpoint.split("?")[0]}?entryPoint=fetch_gpc&type=generate_template`,
        {
          method: "POST",
          headers: {
            "X-Api-Key": FETCH_GPC_X_API_KEY,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result?.success || !result?.data?.html) {
        throw new Error(result?.message || result?.error || "Generation failed");
      }

      setTemplateContent(result.data.html);
      if (aiName) setTemplateName(aiName);
      if (aiStage) setTemplateStage(aiStage);
      if (aiDetails) setTemplateDescription(aiDetails);
      setShowAiModal(false);
      toast.success("Template generated successfully");
    } catch (error) {
      toast.error(error?.message || "Template generation failed");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleTemplateSave = async () => {
    if (!activeTemplate) return;
    if (!templateName.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!templateContent.trim()) {
      toast.error("Template content is required");
      return;
    }
    if (!crmEndpoint) {
      toast.error("CRM endpoint missing");
      return;
    }

    setTemplateSaving(true);
    try {
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      const payload = {
        module: "EmailTemplates",
        name: templateName.trim(),
        description: templateDescription || "",
        body_html: templateContent,
        subject: activeTemplate.subject || "",
        type: activeTemplate.type || "",
        stage: templateStage || activeTemplate.stage || activeTemplate.stage_type || "",
        assigned_user_id: activeTemplate.assigned_user_id || "",
        published: activeTemplate.published || "off",
        text_only: activeTemplate.text_only || "0",
        onboarding: "1",
        date_entered: activeTemplate.date_entered || now,
        date_modified: now,
      };

      if (activeTemplate.id) {
        payload.id = activeTemplate.id;
      }

      const data = await apiRequest({
        method: "POST",
        endpoint: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all`,
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
        throw new Error(data.message || data.error || "Template save failed");
      }

      const savedId = data.parent_id || data.id || activeTemplate.id;
      setSavedTemplateIds((prev) => new Set([...prev, savedId]));
      setTemplates((prev) =>
        prev.map((item) =>
          item.id === activeTemplate.id
            ? { ...item, ...payload, id: savedId || item.id }
            : item,
        ),
      );
      await completeTemplateStep();
      setActiveTemplate(null);
      toast.success("Template saved. First sync is now unlocked.");
    } catch (error) {
      toast.error(error?.message || "Template save failed");
    } finally {
      setTemplateSaving(false);
    }
  };

  const handleSkipTemplates = () => {
    if (templateDone) return;
    toast.info("Save at least one template to unlock the first sync.");
  };

  const handleFirstSync = async () => {
    if (!profileEmail) {
      toast.error("Business email is required before running the first sync");
      return;
    }
    if (!templateDone) {
      toast.error("Please edit and save at least one template first");
      return;
    }

    const limit = Math.min(Math.max(Number(syncLimit) || 1, 1), 100);
    setSyncLimit(limit);
    setSyncing(true);
    setSyncResult(null);
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
      await upsertOnboardingProgress({
        crmEndpoint,
        name: onboardingRecordName,
        step: ONBOARDING_STEP.FIRST_SYNC_DONE,
      });
      setCrmOnboardingStep(ONBOARDING_STEP.FIRST_SYNC_DONE);
      setSyncResult(result);
      setFirstSyncRecordsSeen(false);
      broadcastSyncState({
        status: "completed",
        result,
        onboardingStep: ONBOARDING_STEP.FIRST_SYNC_DONE,
      });
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

  const handleDeleteProfile = async () => {
    if (!profileEmail) {
      toast.error("Business email is required to delete profile");
      return;
    }

    const confirmed = window.confirm(
      `Delete profile data for ${profileEmail}? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setProfileDeleting(true);
    try {
      const response = await fetch(
        `https://crm.outrightsystems.org/index.php?entryPoint=trynow&email=${encodeURIComponent(
          profileEmail,
        )}&delete=1`,
      );

      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            text ||
            `Delete failed with status ${response.status}`,
        );
      }

      toast.success(data?.message || "Profile delete request completed");
    } catch (error) {
      toast.error(error?.message || "Unable to delete profile");
    } finally {
      setProfileDeleting(false);
    }
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

          <div className="grid gap-3 sm:grid-cols-[auto_auto_240px_auto] sm:items-center">
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
                <span>
                  {onboardingLoading ? "Checking..." : `${completion}% completed`}
                </span>
                <span>{onboardingLoading ? "Loading" : syncDone ? "Ready" : "Setup"}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white">
                <Motion.div
                  initial={{ width: 0 }}
                  animate={{ width: onboardingLoading ? "35%" : `${completion}%` }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className={`h-full rounded-full transition-all ${
                    onboardingLoading
                      ? "animate-pulse bg-slate-300"
                      : "bg-linear-to-r from-emerald-500 via-indigo-500 to-cyan-500"
                  }`}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleDeleteProfile}
              disabled={profileDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {profileDeleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              {profileDeleting ? "Deleting..." : "Delete Profile"}
            </button>
          </div>
        </div>
      </section>

      {onboardingLoading && <ProfileOnboardingSkeleton />}

      {!onboardingLoading && !syncDone && (
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
              status={templateDone ? "complete" : step3Done ? "active" : "locked"}
            />
            <SetupStep
              title="Step 5"
              label="First Sync"
              status={templateDone ? "active" : "locked"}
            />
          </div>
        </section>
      )}

      {!onboardingLoading && syncDone && (
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
                Websites are added, templates are ready, inbox sync is done,
                  and your workspace is ready for action.
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

      {!onboardingLoading && showFirstSyncRecords && (
        <FirstSyncRecordsTable
          records={syncRecords}
          result={syncResult}
          onRecordClick={handleRecordClick}
          onShowActivity={() => navigate("/RecentEntry")}
        />
      )}

      {!onboardingLoading && !step3Done && !syncDone && (
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
                Add website names and price ranges here, or import them from a
                CSV. Saving this moves your profile from 50% to 70% and unlocks
                the onboarding template step.
              </p>
            </div>

            <form
              onSubmit={handleWebsiteSave}
              className="space-y-4"
            >
              <div className="space-y-3">
                {websiteForms.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-3 lg:grid-cols-[1.3fr_0.85fr_0.85fr_auto] lg:items-end"
                  >
                    <label className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                        Website Name
                      </span>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateWebsiteField(index, "name", e.target.value)
                        }
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
                        value={item.minimum_price}
                        onChange={(e) =>
                          updateWebsiteField(
                            index,
                            "minimum_price",
                            e.target.value,
                          )
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
                        value={item.amount}
                        onChange={(e) =>
                          updateWebsiteField(index, "amount", e.target.value)
                        }
                        placeholder="150"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => removeWebsiteRow(index)}
                      disabled={websiteSaving}
                      title="Remove row"
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={addWebsiteRow}
                  disabled={websiteSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={16} />
                  Add Another
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  <WebsiteCsvImport
                    disabled={websiteSaving}
                    onImportSuccess={handleWebsiteImportSuccess}
                  />
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
                    {websiteSaving ? "Saving..." : "Save Websites"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      )}

      {!onboardingLoading && !syncDone && step3Done && !templateDone && (
        <section className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-violet-600">
                  <BotIcon size={20} />
                  <p className="text-sm font-black uppercase tracking-widest">
                    Template Generation
                  </p>
                </div>
                <h2 className="mt-2 text-xl font-black text-slate-950">
                  Review and save an onboarding template
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Edit any template below, then save it to continue. You can
                  preview or skip individual templates, but at least one saved
                  template is required before first sync.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSkipTemplates}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-500 transition hover:bg-slate-50"
              >
                Skip
              </button>
            </div>

            {templatesLoading ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
                <Loader2
                  size={26}
                  className="mx-auto mb-3 animate-spin text-violet-600"
                />
                <p className="text-sm font-black text-slate-700">
                  Loading onboarding templates...
                </p>
              </div>
            ) : templates.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {templates.map((template) => {
                  const saved = savedTemplateIds.has(template.id);
                  return (
                    <div
                      key={template.id || template.name}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-black text-slate-950">
                            {template.name || "Untitled template"}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-500">
                            {template.description || template.stage || "No description"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                            saved
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-violet-100 text-violet-700"
                          }`}
                        >
                          {saved ? "Saved" : "Ready"}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setTemplatePreview(template)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-100"
                        >
                          <Eye size={14} />
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => openTemplateEditor(template)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-xs font-black text-white transition hover:bg-violet-700"
                        >
                          <Edit3 size={14} />
                          Edit & Save
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm font-black text-slate-700">
                  No onboarding templates were found.
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Templates with onboarding value 1 will appear here.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {!onboardingLoading && !syncDone && step3Done && templateDone && (
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
                Your first onboarding template is saved. Choose the current
                sync limit, from 1 to 100. Completed records appear below and
                can be opened directly in the timeline.
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

      {templatePreview && (
        <TemplatePreviewModal
          template={templatePreview}
          onClose={() => setTemplatePreview(null)}
          onEdit={() => {
            openTemplateEditor(templatePreview);
            setTemplatePreview(null);
          }}
        />
      )}

      {activeTemplate && (
        <TemplateEditorModal
          tinyKey={TINY_EDITOR_API_KEY}
          name={templateName}
          setName={setTemplateName}
          stage={templateStage}
          setStage={setTemplateStage}
          description={templateDescription}
          setDescription={setTemplateDescription}
          content={templateContent}
          setContent={setTemplateContent}
          saving={templateSaving}
          generating={aiGenerating}
          onGenerateWithAi={openAiTemplateModal}
          onClose={closeTemplateEditor}
          onSave={handleTemplateSave}
        />
      )}

      <AiGenerateModal
        isOpen={showAiModal}
        onClose={() => !aiGenerating && setShowAiModal(false)}
        aiName={aiName}
        setAiName={setAiName}
        aiStage={aiStage}
        setAiStage={setAiStage}
        aiMotive={aiMotive}
        setAiMotive={setAiMotive}
        aiDetails={aiDetails}
        setAiDetails={setAiDetails}
        aiIncludeHtml={aiIncludeHtml}
        setAiIncludeHtml={setAiIncludeHtml}
        stages={stages}
        motiveList={motiveList}
        motiveListLoading={motiveListLoading}
        onGenerate={handleGenerateTemplate}
        isGenerating={aiGenerating}
      />
    </div>
  );
};

function ProfileOnboardingSkeleton() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="animate-pulse space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-3 w-36 rounded-full bg-slate-200" />
            <div className="h-4 w-64 rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              <div className="mb-3 h-3 w-20 rounded-full bg-slate-200" />
              <div className="h-4 w-32 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <div className="mb-3 h-4 w-48 rounded-full bg-slate-200" />
          <div className="mb-2 h-3 w-full max-w-2xl rounded-full bg-slate-100" />
          <div className="h-3 w-2/3 rounded-full bg-slate-100" />
        </div>
      </div>
    </section>
  );
}

function AiGenerateModal({
  isOpen,
  onClose,
  aiName,
  setAiName,
  aiStage,
  setAiStage,
  aiMotive,
  setAiMotive,
  aiDetails,
  setAiDetails,
  aiIncludeHtml,
  setAiIncludeHtml,
  stages,
  motiveList,
  motiveListLoading,
  onGenerate,
  isGenerating,
}) {
  if (!isOpen) return null;

  const handleMotiveSelect = (event) => {
    const selected = event.target.value;
    setAiMotive(selected);
    const found = (motiveList || []).find((item) => item.motive === selected);
    if (found) setAiDetails(found.description || "");
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4"
      onClick={onClose}
    >
      <Motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 24 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 bg-linear-to-r from-violet-600 to-fuchsia-600 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <BotIcon size={24} />
            <h2 className="text-xl font-black">Generate Template with AI</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-xl p-2 transition hover:bg-white/15 disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">
              Template Name
            </span>
            <input
              type="text"
              value={aiName}
              onChange={(event) => setAiName(event.target.value)}
              placeholder="Welcome Email"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">Stage</span>
            {Object.keys(stages || {}).length > 0 ? (
              <select
                value={aiStage}
                onChange={(event) => setAiStage(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
              >
                <option value="">Select Stage</option>
                {Object.keys(stages || {}).map((key) => (
                  <option key={key} value={key}>
                    {stages[key]}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={aiStage}
                onChange={(event) => setAiStage(event.target.value)}
                placeholder="others"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
              />
            )}
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">Motive</span>
            {motiveListLoading ? (
              <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-400">
                Loading motives...
              </div>
            ) : (
              <select
                value={aiMotive}
                onChange={handleMotiveSelect}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
              >
                <option value="">Select Motive</option>
                {(motiveList || []).map((item, index) => (
                  <option key={`${item.motive || "motive"}-${index}`} value={item.motive}>
                    {item.motive}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">
              Details / Description
            </span>
            <textarea
              rows={4}
              value={aiDetails}
              onChange={(event) => setAiDetails(event.target.value)}
              placeholder="Add details for the AI template..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
            />
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={aiIncludeHtml}
              onChange={(event) => setAiIncludeHtml(event.target.checked)}
              className="h-4 w-4 accent-violet-600"
            />
            <span className="text-sm font-bold text-slate-700">
              Include current HTML as base content
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <BotIcon size={16} />
            )}
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </Motion.div>
    </div>
  );
}

function TemplatePreviewModal({ template, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="flex h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-slate-950">
              {template?.name || "Template Preview"}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {template?.stage || template?.stage_type || "Onboarding template"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-black text-white transition hover:bg-violet-700"
            >
              <Edit3 size={15} />
              Edit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-slate-100 p-4">
          <div
            className="mx-auto min-h-full max-w-3xl bg-white p-4 shadow-sm"
            dangerouslySetInnerHTML={{
              __html: getTemplateHtml(template) || "<p>No template content</p>",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function TemplateEditorModal({
  tinyKey,
  name,
  setName,
  stage,
  setStage,
  description,
  setDescription,
  content,
  setContent,
  saving,
  generating,
  onGenerateWithAi,
  onClose,
  onSave,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      onClick={onClose}
    >
      <Motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 24 }}
        className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 bg-linear-to-r from-violet-600 to-cyan-600 px-6 py-4 text-white">
          <h2 className="text-xl font-black">Edit Onboarding Template</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving || generating}
            className="rounded-xl p-2 transition hover:bg-white/15 disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        <div className="grid gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 md:grid-cols-[1fr_220px_1fr]">
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wide text-slate-400">
              Template Name
            </span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wide text-slate-400">
              Stage
            </span>
            <input
              type="text"
              value={stage}
              onChange={(event) => setStage(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wide text-slate-400">
              Description
            </span>
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1">
          <Editor
            apiKey={tinyKey}
            value={content}
            onEditorChange={setContent}
            init={TINY_INIT}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3">
          <p className="text-sm font-semibold text-slate-500">
            Saving stores this template with onboarding value 1.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onGenerateWithAi}
              disabled={saving || generating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <BotIcon size={16} />
              )}
              {generating ? "Generating..." : "Generate with AI"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving || generating}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Saving..." : "Save Template"}
            </button>
          </div>
        </div>
      </Motion.div>
    </div>
  );
}

function WebsiteCsvImport({ disabled, onImportSuccess }) {
  const [step, setStep] = useState("idle");
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [mapping, setMapping] = useState({});
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const fileRef = useRef(null);

  const reset = () => {
    setStep("idle");
    setFile(null);
    setPreviewData(null);
    setMapping({});
    setError(null);
    fileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setError("Only .csv files are allowed.");
      setStep("error");
      return;
    }

    setError(null);
    setFile(selected);
    fileRef.current = selected;
    setStep("previewing");

    try {
      const formData = new FormData();
      formData.append("file", selected, selected.name);
      const json = await fetchGpc({
        method: "POST",
        params: { type: "get_json" },
        body: formData,
      });

      if (!json.success) {
        throw new Error(json.message || json.error || "Preview failed");
      }

      setPreviewData(json);
      const autoMap = {};
      getMappableWebsiteFields(json.available_fields).forEach((field) => {
        if (json.data?.includes(field.label)) autoMap[field.key] = field.label;
        else if (json.data?.includes(field.key)) autoMap[field.key] = field.key;
      });
      setMapping(autoMap);
      setStep("mapping");
    } catch (err) {
      setError(err.message || "Failed to read CSV. Please try again.");
      setStep("error");
    }
  };

  const handleImport = async () => {
    const currentFile = fileRef.current;
    if (!currentFile) return;

    setError(null);
    setStep("importing");
    try {
      const freshFile = new File([currentFile], currentFile.name, {
        type: "text/csv",
      });
      const formData = new FormData();
      formData.append("file", freshFile, freshFile.name);
      formData.append(
        "data",
        new Blob([JSON.stringify(mapping)], { type: "text/plain" }),
      );

      const json = await fetchGpc({
        method: "POST",
        params: { type: "get_json", upload: 1 },
        body: formData,
      });

      if (!json.success) {
        throw new Error(json.message || json.error || "Import failed");
      }

      await onImportSuccess?.();
      toast.success(
        json.count
          ? `${json.count} websites imported successfully`
          : "Websites imported successfully",
      );
      reset();
    } catch (err) {
      setError(err.message || "Import failed. Please try again.");
      setStep("mapping");
    }
  };

  const fields = previewData
    ? getMappableWebsiteFields(previewData.available_fields)
    : [];
  const csvColumns = previewData?.data ?? [];
  const showModal = step !== "idle";

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        disabled={disabled || step === "previewing" || step === "importing"}
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-black text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Upload size={16} />
        Import CSV
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-sm font-black text-slate-950">
                  {step === "mapping" ? "Map CSV Columns" : "Import Websites"}
                </p>
                {file && (
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    {file.name}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={reset}
                disabled={step === "importing"}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              {error && (
                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
                  {error}
                </div>
              )}

              {step === "previewing" && (
                <div className="py-10 text-center">
                  <Loader2
                    size={26}
                    className="mx-auto mb-3 animate-spin text-indigo-600"
                  />
                  <p className="text-sm font-black text-slate-800">
                    Reading CSV...
                  </p>
                </div>
              )}

              {step === "mapping" && (
                <>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                      {previewData?.total_rows ?? 0} rows
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                      {Object.keys(mapping).length} fields mapped
                    </span>
                  </div>

                  <div className="mb-4 max-h-80 space-y-2 overflow-y-auto pr-1">
                    {fields.map((field) => (
                      <div
                        key={field.key}
                        className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-[1fr_1fr] sm:items-center"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black text-slate-800">
                            {field.label}
                            {field.required && (
                              <span className="ml-1 text-red-400">*</span>
                            )}
                          </p>
                          <p className="truncate font-mono text-[10px] text-slate-400">
                            {field.key}
                          </p>
                        </div>
                        <select
                          value={mapping[field.key] ?? ""}
                          onChange={(event) =>
                            setMapping((prev) => {
                              const next = { ...prev };
                              if (event.target.value) {
                                next[field.key] = event.target.value;
                              } else {
                                delete next[field.key];
                              }
                              return next;
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15"
                        >
                          <option value="">Skip</option>
                          {csvColumns.map((column) => (
                            <option key={column} value={column}>
                              {column}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={reset}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-500 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleImport}
                      disabled={Object.keys(mapping).length === 0}
                      className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Import
                    </button>
                  </div>
                </>
              )}

              {step === "importing" && (
                <div className="py-10 text-center">
                  <Loader2
                    size={26}
                    className="mx-auto mb-3 animate-spin text-indigo-600"
                  />
                  <p className="text-sm font-black text-slate-800">
                    Importing websites...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
