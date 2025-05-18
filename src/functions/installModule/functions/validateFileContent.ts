import type JSZip from "jszip";
import ora from "ora";
import { t } from "../../../core/api";

export default async function validateFileContent(
  zipContent: JSZip
): Promise<boolean> {
  const spinner = ora(t("messages.validatingZip")).start();

  const allowedAndRequiredFiles = ["README.md", "LICENSE", "manifest.json"];
  const allowedAndRequiredFolders = ["frontend/", "backend/", "assets/"];

  const zipFiles = Object.keys(zipContent.files);
  const topLevelFiles = zipFiles.filter((file) => !file.includes("/"));
  const topLevelFolders = zipFiles.filter(
    (file) =>
      file.endsWith("/") &&
      file.split("").filter((char) => char === "/").length === 1
  );

  for (const file of topLevelFiles) {
    if (!allowedAndRequiredFiles.includes(file)) {
      spinner.fail(
        `Invalid file: ${file}. Expected one of: ${allowedAndRequiredFiles.join(
          ", "
        )}`
      );
      return false;
    }
  }

  for (const file of allowedAndRequiredFiles) {
    if (!topLevelFiles.includes(file)) {
      spinner.fail(
        `Missing required file: ${file}. Expected one of: ${allowedAndRequiredFiles.join(
          ", "
        )}`
      );
      return false;
    }
  }

  for (const folder of topLevelFolders) {
    if (!allowedAndRequiredFolders.includes(folder)) {
      spinner.fail(
        `Invalid folder: ${folder}. Expected one of: ${allowedAndRequiredFolders.join(
          ", "
        )}`
      );
      return false;
    }
  }

  for (const folder of allowedAndRequiredFolders) {
    if (!topLevelFolders.includes(folder)) {
      spinner.fail(
        `Missing required folder: ${folder}. Expected one of: ${allowedAndRequiredFolders.join(
          ", "
        )}`
      );
      return false;
    }
  }

  try {
    const manifestFile = zipContent.file("manifest.json")!;
    const manifestContent = await manifestFile.async("string");
    const manifest = JSON.parse(manifestContent);
    const requiredFields = ["name", "icon", "version", "description", "author"];

    for (const field of requiredFields) {
      if (!manifest[field]) {
        spinner.fail(
          `Missing required field in manifest.json: ${field}. Expected one of: ${requiredFields.join(
            ", "
          )}`
        );
        return false;
      }
    }

    for (const field in manifest) {
      if (!requiredFields.includes(field)) {
        spinner.fail(
          `Invalid field in manifest.json: ${field}. Expected one of: ${requiredFields.join(
            ", "
          )}`
        );
        return false;
      }
    }
  } catch {
    spinner.fail("Invalid manifest.json file");
    return false;
  }

  spinner.succeed(t("messages.zipValidated"));
  return true;
}
