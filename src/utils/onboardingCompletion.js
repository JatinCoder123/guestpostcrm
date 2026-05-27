import { apiRequest, fetchGpc } from "../services/api";
import { CREATE_DEAL_API_KEY } from "../store/constants";
import { writeOnboardingFlag } from "./onboardingStorage";

export const ONBOARDING_STEP = {
  PROFILE_STARTED: 1,
  WEBSITE_ADDED: 2,
  TEMPLATE_READY: 3,
  FIRST_SYNC_DONE: 4,
};

export const SELF_TEST_BOT_MODULE = "outr_self_test_bot";

const getPostAllEndpoint = (crmEndpoint) =>
  `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all`;

const getPostAllHeaders = () => ({
  "x-api-key": CREATE_DEAL_API_KEY,
  "Content-Type": "application/json",
});

const getRows = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  return [];
};

export const getOnboardingRecordName = ({ user, businessEmail } = {}) =>
  businessEmail ||
  user?.email ||
  user?.email1 ||
  user?.email_address ||
  user?.name ||
  "GuestPostCRM onboarding";

export const getStepFromSubject = (subject) => {
  const step = Number.parseInt(String(subject ?? "").trim(), 10);
  return Number.isFinite(step) ? step : 0;
};

export const fetchOnboardingProgress = async ({ crmEndpoint, name }) => {
  if (!crmEndpoint || !name) return { record: null, step: 0 };

  const data = await apiRequest({
    endpoint: getPostAllEndpoint(crmEndpoint),
    method: "POST",
    params: { action_type: "get_data" },
    body: {
      module: SELF_TEST_BOT_MODULE,
      where: { name },
      order_by: "date_entered",
      direction: "DESC",
      limit_from: 0,
      limit_to: 1,
    },
    headers: getPostAllHeaders(),
  });

  const record = getRows(data)[0] ?? null;
  return {
    record,
    step: getStepFromSubject(record?.subject),
  };
};

export const upsertOnboardingProgress = async ({
  crmEndpoint,
  name,
  step,
}) => {
  if (!crmEndpoint || !name || !step) return { record: null, step: 0 };

  const current = await fetchOnboardingProgress({ crmEndpoint, name });
  if (current.record && current.step >= step) return current;

  const payload = {
    module: SELF_TEST_BOT_MODULE,
    name,
    subject: String(step),
  };

  if (current.record?.id) {
    payload.id = current.record.id;
  }

  const data = await apiRequest({
    endpoint: getPostAllEndpoint(crmEndpoint),
    method: "POST",
    params: { action_type: "post_data" },
    body: {
      parent_bean: payload,
    },
    headers: getPostAllHeaders(),
  });

  if (data?.success === false) {
    throw new Error(data.message || "Unable to update onboarding step");
  }

  return {
    record: { ...current.record, ...payload },
    step,
  };
};

export const hasContactInfoRecord = async () => {
  const data = await fetchGpc({
    params: { type: "contacts", page: 1, page_size: 1 },
  });

  const records = Array.isArray(data?.data) ? data.data : [];
  const count = Number(data?.data_count ?? data?.count ?? records.length ?? 0);

  return count > 0 || records.length > 0;
};

export const syncLocalOnboardingFromCrmStep = (onboardingKeys, step) => {
  if (step >= ONBOARDING_STEP.WEBSITE_ADDED) {
    writeOnboardingFlag(onboardingKeys.websiteDone, true);
  }

  if (step >= ONBOARDING_STEP.FIRST_SYNC_DONE) {
    const result = {
      count: 1,
      records: [],
      message: "CRM onboarding step shows first sync is complete.",
    };

    localStorage.setItem(onboardingKeys.firstSyncStatus, "completed");
    localStorage.setItem(onboardingKeys.firstSyncResult, JSON.stringify(result));
    writeOnboardingFlag(onboardingKeys.syncDone, true);
    writeOnboardingFlag(onboardingKeys.firstSyncRecordsSeen, true);
    return result;
  }

  return null;
};

export const markSyncDoneFromExistingContact = (onboardingKeys) => {
  const result = {
    count: 1,
    records: [],
    message: "Contact record found. First sync is already complete.",
  };

  localStorage.setItem(onboardingKeys.firstSyncStatus, "completed");
  localStorage.setItem(onboardingKeys.firstSyncResult, JSON.stringify(result));
  writeOnboardingFlag(onboardingKeys.syncDone, true);
  writeOnboardingFlag(onboardingKeys.firstSyncRecordsSeen, true);

  return result;
};
