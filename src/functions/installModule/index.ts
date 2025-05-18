import selectFromFS from "./functions/selectPath";
import { error, wait } from "../../core/cli";
import unzipFile from "./functions/unzipFile";
import JSZip from "jszip";
import validateFileContent from "./functions/validateFileContent";
import fs from "fs";
import { t } from "../../core/api";
import setupFrontend from "./functions/setupFrontend";
import confirmManifest from "./functions/confirmManifest";
import setupBackend from "./functions/setupBackend";

export default async function installModule(
  apiHost: string,
  sessionToken: string
) {
  const targetZip = await selectFromFS(t("prompts.selectModuleZip"), "zip");

  if (!targetZip) {
    return;
  }

  console.clear();

  const jszip = JSZip();
  const fileContent = fs.readFileSync(targetZip);
  const zipContent = await jszip.loadAsync(fileContent);

  if (!(await validateFileContent(zipContent))) {
    await wait(3000);
    return;
  }

  await unzipFile(zipContent);
  await wait(1000);

  const manifest = await confirmManifest();

  if (!manifest) {
    await wait(1000);
    return;
  }

  const frontendPath = await selectFromFS(
    t("prompts.selectFrontendFolder"),
    "folder"
  );

  if (!frontendPath) {
    return;
  }

  try {
    await setupFrontend(frontendPath, manifest);
  } catch (e) {
    error((e as Error).message);
    await wait(3000);
    return;
  }

  try {
    await setupBackend(manifest, apiHost, sessionToken);
  } catch (e) {
    error((e as Error).message);
    await wait(3000);
    return;
  }
}
