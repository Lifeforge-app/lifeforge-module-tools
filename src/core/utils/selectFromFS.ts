import fs from "fs";
import path from "path";
import prompts from "prompts";
import { t } from "../api";
import chalk from "chalk";
import { error, wait } from "../cli";

/**
 * Function to select a path (zip file or folder) from the filesystem.
 * It allows the user to navigate through directories and select a file or folder.
 *
 * @param message - The message to display to the user.
 * @param type - The type of selection: "zip" for zip files or "folder" for folders.
 * @returns The selected path as a string
 * @throws An error if the operation is cancelled
 */
export default async function selectFromFS(
  message: string,
  type: "zip" | "folder"
): Promise<string> {
  console.clear();
  let currentDir = process.cwd();

  while (true) {
    console.log(chalk.bold.white(message));
    console.log(
      `${t("messages.currentDirectory")}: ${chalk.magenta(currentDir)}\n`
    );
    const dirContents = fs
      .readdirSync(currentDir)
      .filter((e) => fs.existsSync(path.resolve(currentDir, e)))
      .sort((a, b) => {
        const aIsDir = fs.statSync(path.resolve(currentDir, a)).isDirectory();
        const bIsDir = fs.statSync(path.resolve(currentDir, b)).isDirectory();

        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
      });

    const zipFilesAndFolders = dirContents
      .map((file) => {
        const filePath = path.resolve(currentDir, file);

        if (fs.statSync(filePath).isDirectory()) {
          return `${file}/`;
        } else if (file.endsWith(".zip")) {
          return type === "zip" ? file : null;
        }
        return null;
      })
      .filter(Boolean) as string[];

    const options = [
      ...(currentDir !== "/" ? ["../"] : []),
      ...(type === "folder" ? [`./ (${t("prompts.selectThisFolder")})`] : []),
      ...zipFilesAndFolders,
    ];

    let cancelled = false;

    const { selectedOption } = await prompts(
      {
        type: "autocomplete",
        name: "selectedOption",
        message: t(
          type === "zip"
            ? "prompts.fileSelectorNavigationZip"
            : "prompts.fileSelectorNavigationFolder"
        ),
        choices: options.map((option) => ({
          title: option,
          value: option,
        })),
        initial: false,
        suggest: async (input, choices) => {
          const filteredChoices = choices.filter((choice) =>
            choice.title.toLowerCase().includes(input.toLowerCase())
          );
          return filteredChoices;
        },
      },
      {
        onCancel: () => {
          cancelled = true;
        },
      }
    );

    if (cancelled) {
      throw new Error(t("messages.operationCancelled"));
    }

    if (!selectedOption) {
      error(t("messages.invalidOption"));
      await wait(1000);
      console.clear();
      continue;
    }

    if (selectedOption === "../") {
      currentDir = path.resolve(currentDir, "..");
    } else if (selectedOption === `./ (${t("prompts.selectThisFolder")})`) {
      return currentDir;
    } else {
      const selectedPath = path.resolve(currentDir, selectedOption);
      if (fs.statSync(selectedPath).isDirectory()) {
        currentDir = selectedPath;
      } else {
        return selectedPath;
      }
    }

    console.clear();
  }
}
