import { t } from "../api";
import storeProps from "../data/propsManager";
import selectFromFS from "./selectFromFS";
import path from "path";
import fs from "fs";
import { error, exitProcess, success, wait } from "../cli";
import { pressAnyKeyToContinue } from "../cli/utils";

/**
 * Prompts the user to select a frontend folder and stores the path in the props manager.
 * The selected folder is expected to contain the frontend application files.
 *
 * Perform basic validation checks, trying to ensure that the selected folder contains
 * a valid Lifeforge frontend application.
 */
export default async function promptAndStoreFrontendFolder() {
  let frontendPath = "";

  while (true) {
    try {
      frontendPath = await selectFromFS(
        t("prompts.selectFrontendFolder"),
        "folder"
      );

      const packageJSONPath = path.resolve(frontendPath, "package.json");
      if (!fs.existsSync(packageJSONPath)) {
        throw new Error(
          `Package.json not found in the selected folder: ${frontendPath}. Please select a valid frontend folder.`
        );
      }

      const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath, "utf-8"));
      if (packageJSON.name !== "lifeforge") {
        throw new Error(
          `The selected folder does not contain a valid Lifeforge frontend application. Please select a valid frontend folder.`
        );
      }

      if (!fs.existsSync(path.resolve(frontendPath, "src", "apps"))) {
        throw new Error(
          `The selected folder does not contain the expected 'src/apps' directory. Please select a valid frontend folder.`
        );
      }

      if (
        !fs.existsSync(
          path.resolve(frontendPath, "src", "core", "routes", "routes.json")
        )
      ) {
        throw new Error(
          `The selected folder does not contain the expected 'core/routes/routes.json' file. Please select a valid frontend folder.`
        );
      }

      break;
    } catch (e) {
      error((e as Error).message);

      if ((e as Error).message.includes("Operation cancelled")) {
        await exitProcess(1);
      } else {
        await wait(2000);
      }
    }
  }

  storeProps({
    frontendPath,
  });

  success(`${t("messages.frontendFolderStoredAs")}: ${frontendPath}.`);
  await pressAnyKeyToContinue();
}
