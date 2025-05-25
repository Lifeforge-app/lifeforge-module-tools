import { getCredentials, logout } from "./core/auth";
import { fetchTranslation, t } from "./core/api";
import { error, printHeader, printMenu, wait } from "./core/cli";
import prompts from "prompts";
import { COMMANDS } from "./core/constant/commands";
import installModule from "./functions/installModule";
import { exitProcess } from "./core/cli/utils";
import packageModule from "./functions/packageModule";
import promptAndStoreFrontendFolder from "./core/utils/promptAndStoreFrontendFolder";
import { getProps } from "./core/data/propsManager";
import { printFrontendFolder } from "./core/cli/printInfo";

// Fetch the credentials and language settings
const credentials = await getCredentials();
await fetchTranslation(credentials.apiHost, credentials.userData.language);
await wait(1000);

// Prompt the user to select the frontend folder if not already set
const frontendFolder = await getProps<string>("frontendPath");
if (!frontendFolder) {
  try {
    await promptAndStoreFrontendFolder();
  } catch (e) {
    error((e as Error).message);
    exitProcess(1);
  }
}

// Main loop for the CLI
while (true) {
  console.clear();

  // Display the information
  printHeader();
  printFrontendFolder(frontendFolder!);
  printMenu();

  // Prompt the user to select a command
  let cancelled = false;
  const { command } = await prompts(
    {
      type: "autocomplete",
      name: "command",
      message: t("prompts.command"),
      choices: [
        ...Object.values(COMMANDS)
          .flat()
          .map((command) => ({
            title: command,
            value: command,
          })),
      ],
    },
    {
      onCancel: async () => {
        error(t("messages.operationCancelled"));
        cancelled = true;
      },
    }
  );

  // Check if the operation was cancelled or if the command is valid
  // If cancelled or invalid, wait for a while and continue the loop
  if (cancelled) {
    await wait(1000);
    continue;
  }
  if (!Object.values(COMMANDS).flat().includes(command)) {
    error(t("messages.invalidCommand"));
    await wait(1000);
    continue;
  }

  // Dispatch the command to the appropriate function
  switch (command) {
    case "install-module":
      await installModule(credentials.apiHost, credentials.sessionToken);
      break;
    case "package-module":
      await packageModule(
        credentials.apiHost,
        credentials.sessionToken,
        credentials.userData.name
      );
      break;
    case "exit":
      error(t("messages.exit"));
      await exitProcess(0);
      break;
    case "logout":
      await logout();
      break;
    default:
      error(t("messages.notImplemented"));
      await wait(1000);
  }
}
