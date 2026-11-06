import { AppError } from "../security/index.js";
export function nextStatus(
  action: string,
  current: string,
  explicitApproval: boolean,
): string {
  if (action === "approve" && !explicitApproval)
    throw new AppError(
      "APPROVAL_REQUIRED",
      "Verification requires explicit user approval.",
    );
  if (action === "approve") return "verified";
  if (action === "reject") return "rejected";
  if (action === "deprecate" || action === "supersede") return "deprecated";
  return current;
}
