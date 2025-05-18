import ora from "ora";
import findMatchingBrackets from "../../../utils/findMatchingBrackets";
import fs from "fs";
import { t } from "../../../../../core/api";

/**
 * Configures the routes file by adding the module to the specified category.
 * The module is imported dynamically and added to the existing list of modules.
 *
 * @param routesFile - The path to the routes file to be modified.
 * @param moduleName - The name of the module to be added.
 * @param targetCategory - The category in which the module should be added.
 * @param routesContent - The content of the routes file.
 * @throws An error if the target category is not found or if there are issues with file operations.
 */
export default async function configRoutesFile(
  routesFile: string,
  moduleName: string,
  targetCategory: string,
  routesContent: string
) {
  const targetCategoryIndex = new RegExp(
    `{\\s+title:\\s*?['"]` + targetCategory + `['"]`
  ).exec(routesContent)?.index;

  if (targetCategoryIndex === undefined) {
    throw new Error(
      `Target category "${targetCategory}" not found in routes file. Please ensure the category exists.`
    );
  }

  const startBracketIndex = routesContent.indexOf("[", targetCategoryIndex);
  const endBraceIndex = findMatchingBrackets(routesContent, startBracketIndex);

  if (endBraceIndex === -1) {
    throw new Error("No matching bracket found in routes file.");
  }

  const configRouteSpinner = ora(t("messages.configuringRoutes")).start();

  try {
    const moduleList = routesContent
      .slice(startBracketIndex, endBraceIndex + 1)
      .trim();

    const newModuleList =
      moduleList.slice(0, -1).replace(/,$/, "") +
      `, \n      (await import("@apps/${moduleName}/config")).default\n]`;

    const updatedRoutesContent = routesContent.replace(
      moduleList,
      newModuleList
    );
    fs.writeFileSync(routesFile, updatedRoutesContent, "utf-8");

    configRouteSpinner.succeed(t("messages.configRoutesSuccess"));
  } catch (error) {
    configRouteSpinner.fail(t("messages.configRoutesFailed"));
    throw new Error(`Failed to configure routes in ${routesFile}: ${error}`);
  }
}
