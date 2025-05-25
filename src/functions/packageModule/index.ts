import { t } from "../../core/api";
import { error, wait } from "../../core/cli";
import { pressAnyKeyToContinue } from "../../core/cli/utils";
import selectFromFS from "../../core/utils/selectFromFS";
import confirmManifest from "./functions/confirmManifest";
import confirmModulePaths from "./functions/confirmModulePaths";
import getBackendModulePath from "./functions/getBackendModulePath";
import getFrontendModulePath from "./functions/getFrontendModulePath";
import getManifest from "./functions/getManifest";
import processPackaging from "./functions/processPackaging";

/**
 * Entry point for packaging a module.
 *
 * @param apiHost - The API host URL.
 * @param sessionToken - The session token for authentication.
 * @param userName - The username of the user packaging the module.
 * @returns A promise that resolves when the packaging process is complete.
 */
export default async function packageModule(
  apiHost: string,
  sessionToken: string,
  userName: string
): Promise<void> {
  try {
    const frontendModulePath = await getFrontendModulePath();
    const backendModulePath = await getBackendModulePath(apiHost, sessionToken);
    const targetSavePath = await selectFromFS(
      t("prompts.selectSavePath"),
      "folder"
    );

    await confirmModulePaths(
      frontendModulePath,
      backendModulePath,
      targetSavePath
    );

    const manifest = await getManifest(frontendModulePath.modulePath, userName);
    await confirmManifest(manifest);

    await processPackaging(
      apiHost,
      sessionToken,
      manifest,
      frontendModulePath,
      backendModulePath,
      targetSavePath
    );

    await pressAnyKeyToContinue();
  } catch (e) {
    error((e as Error).message);
    await wait(2000);
    return;
  }
}
