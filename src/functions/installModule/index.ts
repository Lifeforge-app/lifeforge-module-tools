import selectFromFS from "./functions/getZipPath";
import { error, wait } from "../../core/cli";
import unzipFile from "./functions/unzipFile";
import JSZip from "jszip";
import validateFileContent from "./functions/validateFileContent";
import fs from "fs";
import { t } from "../../core/api";
import setupFrontend from "./functions/setupFrontend";

export default async function installModule() {
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

  const frontendPath = await selectFromFS(
    t("prompts.selectFrontendFolder"),
    "folder"
  );

  if (!frontendPath) {
    return;
  }

  try {
    await setupFrontend(frontendPath);
  } catch (e) {
    error((e as Error).message);
    await wait(3000);
    return;
  }
}
