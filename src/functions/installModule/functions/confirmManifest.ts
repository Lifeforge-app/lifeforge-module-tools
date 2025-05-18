import path from "path";
import fs from "fs";
import { DATA_PATH } from "../../../core/auth/constants/constant";
import prompts from "prompts";
import { error } from "../../../core/cli";
import { t } from "../../../core/api";
import { table } from "table";
import chalk from "chalk";
import type { Manifest } from "../typescript/manifest.type";

/**
 * Let user confirms the manifest file for the module installation.
 * Reads the manifest file, displays its content, and prompts the user for confirmation.
 *
 * @returns The parsed manifest object if confirmed, otherwise undefined.
 * @throws An error if the manifest file is not found.
 */
export default async function confirmManifest(): Promise<Manifest | void> {
  const manifestPath = path.resolve(DATA_PATH, "unzipped", "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("Manifest file not found");
  }

  const manifestContent = fs.readFileSync(manifestPath, "utf-8");
  const manifest = JSON.parse(manifestContent);

  console.clear();
  console.log(
    table(
      [
        [
          chalk.bold.white(t("messages.key")),
          chalk.bold.white(t("messages.value")),
        ],
        ["Name", manifest.name],
        ["Version", manifest.version],
        ["Description", manifest.description],
        ["Author", manifest.author],
        ["Icon", manifest.icon],
      ],
      {}
    )
  );

  const { confirm } = await prompts({
    type: "confirm",
    name: "confirm",
    message: t("prompts.confirmManifest"),
    initial: true,
  });

  if (!confirm) {
    error(t("messages.operationCancelled"));
    return;
  }

  return manifest;
}
