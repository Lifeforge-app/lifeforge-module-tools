import JSZip from "jszip";
import fs from "fs";
import path from "path";
import { DATA_PATH } from "../../../core/auth/constants/constant";
import ora from "ora";
import { t } from "../../../core/api";

/**
 * Unzips the provided JSZip content into a specified directory.
 * If the directory already exists, it will be removed before unzipping.
 * Each file in the zip content is written to the output directory, maintaining the original structure.
 *
 * @param zipContent - The JSZip object containing the zip content to be unzipped.
 * @returns A promise that resolves when the unzipping is complete.
 * @throws An error if the unzipping process fails.
 */
export default async function unzipFile(zipContent: JSZip): Promise<void> {
  const spinner = ora(t("messages.unzippingFile")).start();

  const outputDir = path.resolve(DATA_PATH, "unzipped");
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });
  const filePromises = Object.keys(zipContent.files).map(async (filename) => {
    const fileData = await zipContent.file(filename)?.async("nodebuffer");
    if (fileData) {
      const outputPath = path.join(outputDir, filename);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, fileData);
    }
  });
  await Promise.all(filePromises);
  spinner.succeed(t("messages.unzipSuccess"));
}
