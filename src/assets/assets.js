import logo from "./logo.png";
export default logo;

export const websiteListForDeal = [
  "https://www.wp-1click.com/",
  "https://www.outrightcrm.com/",
  "https://store.outrightcrm.com/",
  "https://www.extractmails.com/",
  "https://www.outrightsystems.org/",
  "https://www.mailsextract.com/",
  "https://www.guestpostcrm.com/",
];
export const periodOptions = [
  { period: "today", title: "Today" },
  { period: "yesterday", title: "Yesterday" },
  { period: "this_week", title: "Last 7 Days" },
  { period: "last_week", title: "Last 14 Days" },
  { period: "this_month", title: "Last 30 Days" },
];
export function formatDateWithDifference(dateString) {
  const inputDate = new Date(dateString);
  const now = new Date();

  // --- SHORT MONTH NAME ---
  const shortMonth = inputDate.toLocaleString("en-US", { month: "short" });

  const day = inputDate.getDate();
  const year = inputDate.getFullYear();

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
  if (minutes > 0) parts.push(`${minutes} min${minutes > 1 ? "s" : ""}`);

  const formattedDate = `${day} ${shortMonth} ${year}`;

  const formattedDifference = parts.length > 0 ? `(${parts.join(" , ")})` : "";

  return `${formattedDate} ${formattedDifference}`;
}
