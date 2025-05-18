import path from "path";
import fs from "fs";
import { success, wait } from "../../../../core/cli";
import type { Manifest } from "../../typescript/manifest.type";
import copyToAppsFolder from "./functions/copyToAppsFolder";
import promptCategorySelection from "./functions/promptCategorySelection";
import configRoutesFile from "./functions/configRoutesFile";
import { t } from "../../../../core/api";

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
  const routesFile = path.resolve(frontendPath, "src/core", "Routes.tsx");

  if (!fs.existsSync(appFolder)) {
    throw new Error(
      `Apps folder not found at ${appFolder}. Please ensure the path is correct.`
    );
  }

  if (!fs.existsSync(routesFile)) {
    throw new Error(
      `Routes file not found at ${routesFile}. Please ensure the file exists.`
    );
  }

  const routesContent = fs.readFileSync(routesFile, "utf-8");
  const targetCategory = await promptCategorySelection(routesContent);

  await copyToAppsFolder(appFolder, manifest.name);
  await configRoutesFile(
    routesFile,
    manifest.name,
    targetCategory,
    routesContent
  );

  success(t("messages.frontendInstallationSuccess") + manifest.name);

  await wait(2000);
}
