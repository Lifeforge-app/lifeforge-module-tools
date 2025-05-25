import fs from "fs";
import path from "path";

/**
 * Retrieves the routes from the specified frontend path.
 *
 * @param frontendPath - The path to the frontend folder.
 * @returns An array containing the routes title and items.
 * @throws An error if the routes file is not found or cannot be read.
 */
export default function getRoutes(frontendPath: string): [
  string,
  {
    title: string;
    items: any[];
  }[]
] {
  try {
    const routesPath = path.resolve(
      frontendPath,
      "src/core/routes",
      "routes.json"
    );

    if (!fs.existsSync(routesPath)) {
      throw new Error(
        `Routes file not found at ${routesPath}. Please ensure the path is correct.`
      );
    }

    const routesContent = fs.readFileSync(routesPath, "utf-8");

    return [
      routesPath,
      JSON.parse(routesContent) as {
        title: string;
        items: any[];
      }[],
    ];
  } catch (error) {
    throw new Error(
      `Error reading routes from ${frontendPath}: ${(error as Error).message}`
    );
  }
}
