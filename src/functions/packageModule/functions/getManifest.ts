import type { Manifest } from "../../../core/typescript/manifest.type";
import fs from "fs";
import path from "path";
import selectIcon from "../../../core/utils/selectIcon";
import { prompt } from "prompts";

/**
 * Generates a manifest for a module based on the frontend configuration and user input.
 * It reads the module name from the frontend config file, prompts the user for a description,
 * and allows the user to select an icon for the module.
 *
 * @param modulePath - The path to the module directory.
 * @param userName - The name of the user creating the module.
 * @returns A promise that resolves to the generated manifest object.
 * @throws If the frontend config file is not found or if the module name cannot be extracted.
 */
export default async function getManifest(
  modulePath: string,
  userName: string
): Promise<Manifest> {
  console.clear();

  const icon = await selectIcon();

  const { description } = await prompt({
    type: "text",
    name: "description",
    message: "Enter a description for the module:",
    initial: `Module created by ${userName}`,
  });

  const manifest: Manifest = {
    name: modulePath.split(path.sep).pop() || "Unnamed Module",
    description: description || `Module created by ${userName}`,
    author: userName,
    icon,
  };

  return manifest;
}
