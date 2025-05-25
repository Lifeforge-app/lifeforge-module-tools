import ora from "ora";
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
  routesContent: { title: string; items: any[] }[]
) {
  const configRouteSpinner = ora(t("messages.configuringRoutes")).start();

  try {
    const targetItem = routesContent.find((e) => e.title === targetCategory);
    if (!targetItem) {
      throw new Error(`Target category not found in ${routesFile}`);
    }

    if (targetItem.items.includes(`@apps/${moduleName}`)) {
      configRouteSpinner.warn(t("messages.moduleAlreadyExistsInCategory"));
      return;
    }

    targetItem.items.push(`@apps/${moduleName}`);
    fs.writeFileSync(
      routesFile,
      JSON.stringify(routesContent, null, 2),
      "utf-8"
    );

    configRouteSpinner.succeed(t("messages.configRoutesSuccess"));
  } catch (error) {
    configRouteSpinner.fail(t("messages.configRoutesFailed"));
    throw new Error(`Failed to configure routes in ${routesFile}: ${error}`);
  }
}
