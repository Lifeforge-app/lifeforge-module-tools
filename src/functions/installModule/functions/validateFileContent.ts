import type JSZip from "jszip";
import ora from "ora";
import { t } from "../../../core/api";

/**
 * Validates the content of a JSZip object to ensure it contains the required files and folders.
 * It checks for the presence of specific files and folders at the top level of the zip content,
 * check if there is any invalid file or folder,
 * as well as validating the contents of the manifest.json file.
 *
 * @param zipContent - The JSZip object containing the zip content to be validated.
 * @returns A promise that resolves to true if the validation is successful, false otherwise.
 */
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

    // Check if the name contains only alphanumeric characters and is PascalCase
    if (
      !manifest.name.match(/^[a-zA-Z0-9]+$/) ||
      !/^[A-Z][a-zA-Z0-9]*$/.test(manifest.name)
    ) {
      spinner.fail(
        `Invalid name in manifest.json: ${manifest.name}. Only alphanumeric characters are allowed and it must be in PascalCase.`
      );
      return false;
    }
  } catch {
    spinner.fail("Invalid manifest.json file");
    return false;
  }

  spinner.succeed(t("messages.zipValidated"));
  return true;
}
