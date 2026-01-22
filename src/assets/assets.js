import logo from "./logo.png";
import duplicateImg from "./duplicate.png";
 import send from "./send.png";
import preview from "./preview.png";
import onlyupdate from "./onlyupdate.png";
import update_With_send from "./update_With_send.jpg";
export default logo;
export const images = { duplicateImg };
export const websiteLists = [
  "https://www.wp-1click.com/",
  "https://www.outrightcrm.com/",
  "https://store.outrightcrm.com/",
  "https://www.extractmails.com/",
  "https://www.outrightsystems.org/",
  "https://www.mailsextract.com/",
  "https://www.guestpostcrm.com/",
];
export const getDomain = (url) => {
  if (!url) return "";
  if (url.includes("/index.php")) {
    return url.split("/index.php")[0];
  }
  return url;
}

export const periodOptions = [
  { period: "today", title: "Today" },
  { period: "yesterday", title: "Yesterday" },
  { period: "this_week", title: "This week" },
  { period: "last_7_days", title: "Last 7 days" },
  { period: "last_30_days", title: "Last 30 days" },
  { period: "this_month", title: "This month" },
  { period: "last_month", title: "Last month" },
  { period: "last_3_months", title: "Last 3 months" },

];
export function getDifference(dateString) {
  const inputDate = new Date(dateString);
  const now = new Date();

  // --- TIME DIFFERENCE ---
  let diffMs = Math.abs(now - inputDate);

  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
  diffMs -= months * (1000 * 60 * 60 * 24 * 30.44);

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  diffMs -= days * (1000 * 60 * 60 * 24);

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs -= hours * (1000 * 60 * 60);

  const minutes = Math.floor(diffMs / (1000 * 60));

  // --- BUILD PARTS ARRAY ---
  const parts = [];

  if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);

  const formattedDifference = parts.length > 0 ? `(${parts.join(" , ")})` : "";

  return `${formattedDifference}`;
}
export function formatTime(dateString) {
  const inputDate = new Date(dateString);

  const shortMonth = inputDate.toLocaleString("en-US", { month: "short" });
  const day = inputDate.getDate();
  const year = inputDate.getFullYear();

  // Format time (24hr format)
  const time = inputDate.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });


  return `${day} ${shortMonth} ${year}, ${time}`;
}
export function excludeEmail(str) {
  if (str.includes("<")) {
    return str.split("<")[1].split(">")[0].trim();
  }
  return str;
}
export function excludeName(str) {
  if (str?.includes("<")) {
    return str.split("<")[0];
  }
  return str;
}
export function daysUntil(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = d - now;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days;
}


export function formatExpiryLabel(dateString) {
  const days = daysUntil(dateString) ?? 2;
  if (days === null) return "No Expiry Date";
  if (days <= 0) return "Expired";
  if (days <= 3) return `🔥 ${days} day${days > 1 ? "s" : ""} left`;
  return `⏳ ${days} day${days > 1 ? "s" : ""} left`;
}

// If mailersSummary has numeric progress return it, otherwise map common stage text to progress %
export function getStageProgress(stageText) {
  if (!stageText) return 0;
  // if stageText is numeric string or number
  const num = Number(stageText);
  if (!isNaN(num)) {
    return Math.max(0, Math.min(100, num));
  }

  const s = stageText.toLowerCase();
  if (s.includes("won") || s.includes("closed") || s.includes("completed"))
    return 100;
  if (s.includes("proposal") || s.includes("negotiation")) return 75;
  if (s.includes("contacted") || s.includes("follow")) return 45;
  if (s.includes("lead") || s.includes("new")) return 20;
  return 40; // default
}
// Helper: decode Base64 → UTF-8 string
export function base64ToUtf8(base64) {
  try {
    // atob gives binary string; decodeURIComponent + escape handle UTF-8 chars
    return decodeURIComponent(
      Array.prototype.map
        .call(
          atob(base64),
          (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );
  } catch (e) {
    // fallback to plain atob (may break for multi-byte chars)
    try {
      return atob(base64);
    } catch {
      return "";
    }
  }
}


export const extractEmail = (str) => {
  if (str.includes("<")) {
    return str.split("<")[1].split(">")[0];
  }
  return str;

}



export const sendEmailBtn = send;
export const previewBtn = preview;
export const updatesentBtn = onlyupdate;
export const updateBtn = update_With_send;
 