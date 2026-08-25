import { http } from "../services/api";

/**
 * Gets the logged-in user's completed GPC training count from Rightee CRM.
 * `description` is the email field and `training_number` is the progress field
 * on the `outr_gpc_users` module.
 */
export const getGpcTrainingStatus = async (email) => {
  if (!email) return null;

  const response = await http({
    method: "POST",
    rightee: true,
    body: {
      action: "fetch",
      module: "outr_gpc_users",
      fields: ["training_number"],
      filters: { description: email },
    },
  });

  const record = response?.records?.[0];
  if (!record) return null;

  const training = Number(record.training_number);
  return Number.isFinite(training) ? training : 0;
};
