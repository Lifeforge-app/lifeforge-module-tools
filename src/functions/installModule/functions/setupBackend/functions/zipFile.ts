import JSZip from "jszip";
import { DATA_PATH } from "../../../../../core/auth/constants/constant";
import traverse from "../../../utils/traversePath";
import path from "path";
import ora from "ora";
import { t } from "../../../../../core/api";

/**
 * Zips the backend files located in the specified path.
 * The backend files are expected to be in the "unzipped/backend" directory.
 * The zipped content is generated with high compression level.
 * If the zipping process fails, an error is thrown with a message.
 *
 * @returns A promise that resolves to the zipped backend content as a Buffer.
 * @throws An error if the zipping process fails.
 */
export default async function zipFile() {
  const spinner = ora(t("messages.zippingFile")).start();

  try {
    const backendPath = path.resolve(DATA_PATH, "unzipped", "backend");
    const backendZip = JSZip();

    traverse(backendPath, backendPath, backendZip);

    const backendZipContent = await backendZip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9,
      },
    });

    spinner.succeed(t("messages.zipSuccess"));
    return backendZipContent;
  } catch (e) {
    spinner.fail(t("messages.zipError"));
    throw new Error((e as Error).message);
  }
}
