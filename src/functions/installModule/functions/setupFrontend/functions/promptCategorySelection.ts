import prompts from "prompts";
import { t } from "../../../../../core/api";

/**
 * Prompts the user to select a category from the provided routes content.
 * The categories are extracted from lines starting with "title:" and sorted alphabetically.
 *
 * @param routesContent - The content of the routes file as a string.
 * @returns The selected category as a string.
 * @throws An error if the operation is cancelled by the user.
 */
export default async function promptCategorySelection(
  categories: string[]
): Promise<string> {
  let cancelled = false;

  const { targetCategory } = await prompts(
    {
      type: "select",
      name: "targetCategory",
      message: t("prompts.selectCategory"),
      choices: categories.map((category) => ({
        title: category,
        value: category,
      })),
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

  return targetCategory;
}
