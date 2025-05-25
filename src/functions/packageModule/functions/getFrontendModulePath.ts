import { t } from "../../../core/api";
import getRoutes from "../../../core/utils/getRoutes";
import promptSelection from "../../../core/utils/promptCategorySelection";
import selectFromFS from "../../../core/utils/selectFromFS";
import path from "path";
import fs from "fs";
import { info, wait } from "../../../core/cli";
import { getProps } from "../../../core/data/propsManager";

/**
 * Retrieves the path to a frontend module and its associated assets.
 *
 * @returns An object containing the module path and assets path (if exist, `null` otherwise).
 * @throws An error if the module is not found in the specified directory.
 */
export default async function getFrontendModulePath(): Promise<{
  modulePath: string;
  assetsPath: string | null;
}> {
  const frontendPath = await getProps<string>("frontendPath");
  if (!frontendPath) {
    throw new Error(
      "Frontend path not found. Please ensure you have set the frontend path correctly."
    );
  }

  const [, routesContent] = getRoutes(frontendPath);

  const modules = routesContent
    .flatMap((e) => e.items || [])
    .filter((e) => e.startsWith("@apps"))
    .map((e) => e.replace(/^@apps\//, ""))
    .sort();
  const targetModule = await promptSelection(
    t("prompts.selectModule"),
    modules
  );

  const modulePath = path.resolve(frontendPath, "src", "apps", targetModule);

  if (!fs.existsSync(modulePath)) {
    throw new Error(
      "Module not found. Please ensure the module exists in the app directory."
    );
  }

  const assetsPath = path.resolve(
    frontendPath,
    "public",
    "assets",
    "apps",
    targetModule
  );

  if (fs.existsSync(assetsPath)) {
    info(`${t("messages.assetsFolderFound")}: ${assetsPath}.`);
    await wait(1000);

    return {
      modulePath,
      assetsPath,
    };
  }

  return {
    modulePath,
    assetsPath: null,
  };
}
