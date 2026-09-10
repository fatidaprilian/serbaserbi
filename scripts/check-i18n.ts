import { id } from "../lib/i18n/locales/id";
import { en } from "../lib/i18n/locales/en";

interface Issue {
  type: "missing" | "empty";
  locale: string;
  path: string;
  detail: string;
}

const issues: Issue[] = [];

function flattenKeys(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenKeys(value as Record<string, unknown>, fullPath));
    } else if (typeof value === "string") {
      result[fullPath] = value;
    }
  }
  return result;
}

console.log("=== SerbaSerbi i18n Parity & Completeness Checker ===");

const flatId = flattenKeys(id as unknown as Record<string, unknown>);
const flatEn = flattenKeys(en as unknown as Record<string, unknown>);

const idKeyCount = Object.keys(flatId).length;
const enKeyCount = Object.keys(flatEn).length;

console.log(`[INFO] Master Indonesian dictionary keys: ${idKeyCount}`);
console.log(`[INFO] English dictionary keys:           ${enKeyCount}`);

// Check 1: Keys in ID missing in EN
for (const [key, val] of Object.entries(flatId)) {
  if (!(key in flatEn)) {
    issues.push({
      type: "missing",
      locale: "en",
      path: key,
      detail: `Key exists in id.ts but is missing in en.ts`,
    });
  } else if (!flatEn[key] || flatEn[key].trim() === "") {
    issues.push({
      type: "empty",
      locale: "en",
      path: key,
      detail: `Value in en.ts is empty`,
    });
  }

  if (!val || val.trim() === "") {
    issues.push({
      type: "empty",
      locale: "id",
      path: key,
      detail: `Value in id.ts is empty`,
    });
  }
}

// Check 2: Keys in EN missing in ID
for (const key of Object.keys(flatEn)) {
  if (!(key in flatId)) {
    issues.push({
      type: "missing",
      locale: "id",
      path: key,
      detail: `Key exists in en.ts but is missing in id.ts`,
    });
  }
}

console.log("\n--- Parity Audit Results ---");
if (issues.length === 0) {
  console.log(`[PASS] 100% Key Parity! All ${idKeyCount} keys match 1-to-1 between ID and EN.`);
} else {
  console.error(`[FAIL] Found ${issues.length} translation issues:`);
  for (const issue of issues) {
    console.error(`  - [${issue.type.toUpperCase()}] [${issue.locale}] ${issue.path}: ${issue.detail}`);
  }
}

if (issues.length > 0) {
  process.exit(1);
} else {
  console.log("[PASS] i18n Verification completed successfully.\n");
  process.exit(0);
}
