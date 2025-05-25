import prompts from "prompts";
import { t } from "../api";

/**
 * Prompts the user to select an option from a list of options.
 *
 * @param message - The message to display to the user.
 * @param options - An array of options to choose from.
 * @returns The selected option as a string.
 * @throws An error if the operation is cancelled.
 */
export default async function promptSelection(
  message: string,
  options: string[]
): Promise<string> {
  let cancelled = false;

  const { targetOption } = await prompts(
    {
      type: "autocomplete",
      name: "targetOption",
      message,
      choices: options.map((option) => ({
        title: option,
        value: option,
      })),
      initial: false,
    },
    {
      onCancel: () => {
        cancelled = true;
      },
    }
  );

  if (cancelled) {
    throw new Error(t("messages.operationCancelled"));
  }

  return targetOption;
}
