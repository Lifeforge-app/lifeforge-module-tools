import chalk from "chalk";
import { table } from "table";
import { t } from "../../../core/api";
import prompts from "prompts";

/**
 * Confirms the module paths with the user before proceeding with packaging.
 *
 * @param frontendModulePath - An object containing the frontend module path and assets path.
 * @param backendModulePath - The backend module path.
 * @param targetSavePath - The target save path for the packaged module.
 * @returns A promise that resolves when the user confirms the paths.
 * @throws An error if the user does not confirm the paths.
 */
export default async function confirmModulePaths(
  frontendModulePath: { modulePath: string; assetsPath: string | null },
  backendModulePath: string,
  targetSavePath: string
): Promise<void> {
  console.clear();

  console.log(chalk.bold.white(t("messages.checkModulePaths")));
  console.log(
    table([
      [
        chalk.bold.white(t("messages.key")),
        chalk.bold.white(t("messages.value")),
      ],
      ["Frontend Module Path", frontendModulePath.modulePath],
      ["Frontend Assets Path", frontendModulePath.assetsPath || "None"],
      ["Backend Module Path", backendModulePath],
      ["Target Save Path", targetSavePath],
    ])
  );

  const { confirm } = await prompts({
    type: "confirm",
    name: "confirm",
    message: t("prompts.confirmModulePaths"),
    initial: true,
  });

  if (!confirm) {
    throw new Error(t("messages.operationCancelled"));
  }
}
