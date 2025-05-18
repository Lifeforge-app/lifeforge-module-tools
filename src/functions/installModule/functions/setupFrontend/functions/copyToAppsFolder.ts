import path from "path";
import fs from "fs";
import ora from "ora";
import { t } from "../../../../../core/api";
import { DATA_PATH } from "../../../../../core/auth/constants/constant";

/**
 * Copies the module frontend files to the specified apps folder.
 * If the module folder already exists, an error is thrown.
 *
 * @param appFolder - The path to the apps folder where the module will be copied.
 * @param moduleName - The name of the module to be copied.
 * @throws An error if the module folder already exists or if the frontend path is not found.
 */
export default async function copyToAppsFolder(
  appFolder: string,
  moduleName: string
) {
  const moduleFolder = path.resolve(appFolder, moduleName);
  if (fs.existsSync(moduleFolder)) {
    throw new Error(
      `Module folder already exists at ${moduleFolder}. Please remove it or choose a different name.`
    );
  }

  const moduleFrontendPath = path.resolve(DATA_PATH, "unzipped", "frontend");
  if (!fs.existsSync(moduleFrontendPath)) {
    throw new Error(
      `Module frontend path not found at ${moduleFrontendPath}. Please ensure the module is unzipped correctly.`
    );
  }

  const spinner = ora(t("messages.copyingFiles")).start();

  try {
    fs.renameSync(moduleFrontendPath, moduleFolder);
    spinner.succeed(t("messages.copyFilesSuccess"));
  } catch (error) {
    spinner.fail(t("messages.copyFilesFailed"));
    throw new Error(
      `Failed to copy files from ${moduleFrontendPath} to ${moduleFolder}: ${error}`
    );
  }
}
