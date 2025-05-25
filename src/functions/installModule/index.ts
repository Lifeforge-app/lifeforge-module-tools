import selectFromFS from "../../core/utils/selectFromFS";
import { error, wait } from "../../core/cli";
import unzipFile from "./functions/unzipFile";
import JSZip from "jszip";
import validateFileContent from "./functions/validateFileContent";
import fs from "fs";
import { t } from "../../core/api";
import setupFrontend from "./functions/setupFrontend";
import confirmManifest from "./functions/confirmManifest";
import setupBackend from "./functions/setupBackend";
import { getProps } from "../../core/data/propsManager";

/**
 * Entry point for installing a module from a ZIP file.
 *
 * @param apiHost - The API host URL.
 * @param sessionToken - The session token for authentication.
 */
export default async function installModule(
  apiHost: string,
  sessionToken: string
): Promise<void> {
  try {
    const targetZip = await selectFromFS(t("prompts.selectModuleZip"), "zip");

    console.clear();

    const jszip = JSZip();
    const fileContent = fs.readFileSync(targetZip);
    const zipContent = await jszip.loadAsync(fileContent);

    if (!(await validateFileContent(zipContent))) {
      await wait(2000);
      return;
    }

    await unzipFile(zipContent);
    await wait(1000);

    const manifest = await confirmManifest();

    if (!manifest) {
      await wait(1000);
      return;
    }

    const frontendPath = await getProps<string>("frontendPath");
    if (!frontendPath) {
      throw new Error(
        "Frontend path not found. Please ensure you have set the frontend path correctly."
      );
    }

    await setupFrontend(frontendPath, manifest);
    await setupBackend(manifest, apiHost, sessionToken);
  } catch (e) {
    error((e as Error).message);
    await wait(2000);
    return;
  }
}
