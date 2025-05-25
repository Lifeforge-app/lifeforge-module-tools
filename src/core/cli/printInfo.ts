import boxen from "boxen";
import chalk from "chalk";
import { t } from "../api";
import { COMMANDS } from "../constant/commands";
import _ from "lodash";

/**
 * Prints the header of the CLI application.
 * It includes a stylized logo and a description of the application.
 */
export const printHeader = () => {
  console.log(`
${`
██╗     ██╗███████╗███████╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗   
██║     ██║██╔════╝██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝   
██║     ██║█████╗  █████╗  █████╗  ██║   ██║██████╔╝██║  ███╗█████╗     
██║     ██║██╔══╝  ██╔══╝  ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝     
███████╗██║██║     ███████╗██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗██╗
╚══════╝╚═╝╚═╝     ╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝`
  .split("\n")
  .map((line) =>
    line
      .split("")
      .map((char) =>
        char.charCodeAt(0).toString(16).startsWith("255")
          ? chalk.green(char)
          : chalk.white(char)
      )
      .join("")
  )
  .join("\n")}
`);

  console.log(
    `${boxen(
      `${chalk.bold(
        `${chalk.green("Lifeforge.")} ${t("title")}`
      )}\n${chalk.grey(t("description"))}`,
      {
        padding: 1,
        dimBorder: true,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        width: 72,
        textAlignment: "center",
        borderStyle: "bold",
      }
    )}`
  );
};

/**
 * Prints the frontend folder path in a stylized box.
 * @param frontendFolder - The path to the frontend folder.
 */
export const printFrontendFolder = (frontendFolder: string) => {
  console.log(
    boxen(
      `${t("menu.frontendFolderPath")}:\n${chalk.magenta(frontendFolder)}`,
      {
        padding: 1,
        dimBorder: true,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        width: 72,
        textAlignment: "left",
        borderStyle: "round",
      }
    )
  );
};

/**
 * Prints the menu of the CLI application.
 * It includes the available commands and their descriptions.
 */
export const printMenu = () => {
  const longestCommandLength = Math.max(
    ...Object.values(COMMANDS)
      .flat()
      .map((command) => command.length)
  );
  console.log(
    boxen(
      `${chalk.bold.underline.yellow(`${t("menu.title")}`)}\n\n${Object.entries(
        COMMANDS
      )
        .map(([category, commands]) => {
          return `${chalk.bold.underline.white(
            t(`menu.commandCategories.${category}`)
          )}\n${commands
            .map(
              (command) =>
                `${chalk[command === "exit" ? "red" : "green"](
                  command.padEnd(longestCommandLength + 2)
                )}:  ${t(`menu.commandDescription.${_.camelCase(command)}`)}`
            )
            .join("\n")}`;
        })
        .join("\n\n")}`,
      {
        padding: 1,
        dimBorder: true,
        margin: {
          top: 0,
          right: 0,
          bottom: 1,
          left: 0,
        },
        width: 72,
        textAlignment: "left",
        borderStyle: "round",
      }
    )
  );
};
