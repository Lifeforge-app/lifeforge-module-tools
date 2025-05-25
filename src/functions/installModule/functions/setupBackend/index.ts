import axios from "axios";
import type { Manifest } from "../../../../core/typescript/manifest.type";
import zipFile from "./functions/zipFile";
import { t } from "../../../../core/api";
import uploadToBackend from "./functions/uploadToBackend";
import { success, wait } from "../../../../core/cli";
import prompts from "prompts";
import { pressAnyKeyToContinue } from "../../../../core/cli/utils";

export default async function setupBackend(
  manifest: Manifest,
  apiHost: string,
  sessionToken: string
) {
  const zippedBuffer = await zipFile();

  await uploadToBackend(zippedBuffer, manifest.name, apiHost, sessionToken);

  success(t("messages.backendInstallationSuccess") + manifest.name);
  await pressAnyKeyToContinue();
}
