const BASE_KEYS = {
  websiteDone: "guestpostcrm:onboarding:website_added",
  syncDone: "guestpostcrm:onboarding:first_sync_done",
  firstSyncStatus: "guestpostcrm:first_sync:status",
  firstSyncResult: "guestpostcrm:first_sync:result",
  firstSyncRecordsSeen: "guestpostcrm:first_sync:records_seen",
  guidedWalkthroughSeen: "guestpostcrm:onboarding:guided_walkthrough_seen",
};

const getRawUserScope = ({ user, businessEmail, crmEndpoint, dbName, id } = {}) =>
  businessEmail ||
  user?.email ||
  user?.email1 ||
  user?.email_address ||
  id ||
  dbName ||
  crmEndpoint ||
  "default";

const getScopedKey = (key, scope) =>
  `${key}:${encodeURIComponent(String(scope).toLowerCase())}`;

export const getOnboardingKeys = (identity = {}) => {
  const scope = getRawUserScope(identity);

  return Object.fromEntries(
    Object.entries(BASE_KEYS).map(([name, key]) => [
      name,
      getScopedKey(key, scope),
    ]),
  );
};

export const readOnboardingFlag = (key, legacyKey = null) => {
  const scopedValue = localStorage.getItem(key);
  if (scopedValue !== null) return scopedValue === "true";

  return legacyKey ? localStorage.getItem(legacyKey) === "true" : false;
};

export const writeOnboardingFlag = (key, value) => {
  localStorage.setItem(key, value ? "true" : "false");
};

export const readOnboardingJson = (key, legacyKey = null) => {
  try {
    const rawValue = localStorage.getItem(key) ?? (
      legacyKey ? localStorage.getItem(legacyKey) : null
    );
    return JSON.parse(rawValue || "null");
  } catch {
    return null;
  }
};

export const BASE_ONBOARDING_KEYS = BASE_KEYS;
