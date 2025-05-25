import ora from "ora";
import { t } from "../../../core/api";
import axios from "axios";
import promptSelection from "../../../core/utils/promptCategorySelection";

/**
 * Fetches the backend module paths from the API and prompts the user to select one.
 *
 * @param apiEndpoint - The API endpoint to fetch the backend module paths.
 * @param sessionToken - The session token for authentication.
 * @returns The selected backend module path.
 * @throws An error if the API request fails or if no paths are returned.
 */
export default async function getBackendModulePath(
  apiEndpoint: string,
  sessionToken: string
): Promise<string> {
  console.clear();
  const spinner = ora(t("messages.fetchingBackendModulePath")).start();

  const backendPaths = await axios
    .get<{
      state: "success" | "error";
      data: string[];
      message?: string;
    }>(`${apiEndpoint}/modules/paths`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })
    .catch((error) => {
      spinner.fail(
        error.response?.data?.message || t("messages.backendModulePathsError")
      );
      throw new Error(
        error.response?.data?.message || t("messages.backendModulePathsError")
      );
    });

  spinner.succeed(t("messages.backendModulePathsFetched"));

  const targetPath = await promptSelection(
    t("prompts.selectBackendModulePath"),
    backendPaths.data.data
  );

  return targetPath;
}
