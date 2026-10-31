// GHL conversation bodies wrap some links in Markdown-style square brackets.
// Exclude those delimiters so the audit requests the URL the recipient opens.
export function invoicePaymentLinks(body) {
  const candidates = String(body || "").match(/https?:\/\/[^\s"'<>\[\]]+/gi) || [];
  return [...new Set(candidates.map((value) => value.replace(/&amp;/g, "&")))].filter((value) => {
    try {
      const url = new URL(value);
      return url.hostname === "fastpaydirect.com"
        || url.hostname.endsWith(".fastpaydirect.com")
        || /invoice/i.test(url.pathname);
    } catch {
      return false;
    }
  });
}
