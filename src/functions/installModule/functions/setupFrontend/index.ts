import path from "path";
import fs from "fs";
import { success } from "../../../../core/cli";
import type { Manifest } from "../../../../core/typescript/manifest.type";
import copyToAppsFolder from "./functions/copyToAppsFolder";
import promptSelection from "../../../../core/utils/promptCategorySelection";
import configRoutesFile from "./functions/configRoutesFile";
import { t } from "../../../../core/api";
import { pressAnyKeyToContinue } from "../../../../core/cli/utils";
import getRoutes from "../../../../core/utils/getRoutes";

/**
 * Sets up the frontend by copying the module to the apps folder and configuring the routes file.
 *
 * @param frontendPath - The path to the frontend folder.
 * @param manifest - The manifest object containing module information.
 * @throws An error if the apps folder or routes file is not found.
 */
export default async function setupFrontend(
  frontendPath: string,
  manifest: Manifest
) {
  const appFolder = path.resolve(frontendPath, "src", "apps");

  if (!fs.existsSync(appFolder)) {
    throw new Error(
      `Apps folder not found at ${appFolder}. Please ensure the path is correct.`
    );
  }

  const [routesPath, routesContent] = getRoutes(frontendPath);

  const categories = routesContent
    .map((e) => e.title)
    .filter(Boolean)
    .sort();
  const targetCategory = await promptSelection(
    t("prompts.selectCategory"),
    categories
  );

  await configRoutesFile(
    routesPath,
    manifest.name,
    targetCategory,
    routesContent
  );
  await copyToAppsFolder(appFolder, manifest.name);

  success(`${t("messages.frontendInstallationSuccess")} ${manifest.name}`);
  await pressAnyKeyToContinue();
}
