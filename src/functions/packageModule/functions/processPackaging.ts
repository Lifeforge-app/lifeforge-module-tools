import type { Manifest } from "../../../core/typescript/manifest.type";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import traverse from "../../installModule/utils/traversePath";
import { success } from "../../../core/cli";
import { t } from "../../../core/api";
import ora from "ora";
import axios from "axios";

/**
 * Processes the packaging of a module by creating a zip file containing the frontend, backend, and manifest files.
 * It fetches the backend files from the server, zips the frontend and backend files, and saves the zip file to the specified path.
 *
 * @param apiHost - The API host URL.
 * @param sessionToken - The session token for authentication.
 * @param manifest - The manifest object containing module information.
 * @param frontendModulePath - An object containing the module path and assets path for the frontend.
 * @param backendModulePath - The path to the backend module.
 * @param targetSavePath - The path where the zip file will be saved.
 * @returns A promise that resolves when the packaging process is complete.
 * @throws An error if there is an issue processing the packaging, such as fetching backend files or zipping the content.
 */
export default async function processPackaging(
  apiHost: string,
  sessionToken: string,
  manifest: Manifest,
  frontendModulePath: {
    modulePath: string;
    assetsPath: string | null;
  },
  backendModulePath: string | null,
  targetSavePath: string
): Promise<void> {
  const zip = new JSZip();

  const frontendInstance = zip.folder("frontend");
  traverse(
    frontendModulePath.modulePath,
    frontendModulePath.modulePath,
    frontendInstance!
  );

  success(t("messages.frontendPackagingSuccess"));

  const frontendAssetsInstance = zip.folder("assets");

  if (frontendModulePath.assetsPath) {
    traverse(
      frontendModulePath.assetsPath,
      frontendModulePath.assetsPath,
      frontendAssetsInstance!
    );

    success(t("messages.frontendAssetsPackagingSuccess"));
  }

  const spinner = ora(t("messages.fetchingBackendFiles")).start();

  const backendFiles = await axios
    .post(
      `${apiHost}/modules/package/${backendModulePath}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        responseType: "arraybuffer",
      }
    )
    .catch((error) => {
      spinner.fail(t("messages.backendPackagingError"));
      throw new Error(
        error.response?.data?.message || t("messages.backendPackagingError")
      );
    });

  spinner.succeed(t("messages.successfullyFetchedBackendFiles"));

  const backendZipBuffer = Buffer.from(backendFiles.data, "base64");
  const backendZip = await JSZip.loadAsync(backendZipBuffer);
  const backendInstance = zip.folder("backend");
  backendZip.forEach((relativePath, file) => {
    if (!file.dir) {
      backendInstance!.file(relativePath, file.async("nodebuffer"));
    } else {
      backendInstance!.folder(relativePath);
    }
  });
  success(t("messages.backendPackagingSuccess"));

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  success(t("messages.manifestPackagingSuccess"));

  const zippingSpinner = ora(t("messages.zippingFile")).start();

  try {
    const zipContent = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9,
      },
    });
    zippingSpinner.succeed(t("messages.zipSuccess"));

    const targetPath = path.resolve(
      targetSavePath,
      `[Lifeforge Module] ${manifest.name}.zip`
    );

    fs.writeFileSync(targetPath, zipContent);
    success(`${t("messages.zipSavedTo")}: ${targetPath}`);
  } catch (e) {
    zippingSpinner.fail(t("messages.zipError"));
    throw new Error((e as Error).message);
  }
}
