import { table } from "table";
import type { Manifest } from "../../../core/typescript/manifest.type";
import chalk from "chalk";
import { t } from "../../../core/api";
import prompts from "prompts";

/**
 * Prompts the user to confirm the manifest details before proceeding with module installation.
 * Displays the manifest information in a table format and asks for confirmation.
 * Throws an error if the user does not confirm.
 *
 * @param manifest - The manifest object containing module information.
 * @returns Resolves if the user confirms, otherwise throws an error.
 * @throws An error if the user cancels the operation.
 */
export default async function confirmManifest(
  manifest: Manifest
): Promise<void> {
  console.clear();
  console.log(
    table(
      [
        [
          chalk.bold.white(t("messages.key")),
          chalk.bold.white(t("messages.value")),
        ],
        ["Name", manifest.name],
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
    throw new Error(t("messages.operationCancelled"));
  }
}
