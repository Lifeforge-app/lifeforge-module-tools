import { getCredentials, logout } from "./core/auth";
import { fetchTranslation, t } from "./core/api";
import { error, printHeader, printMenu, wait } from "./core/cli";
import prompts from "prompts";
import { COMMANDS } from "./core/constant/commands";
import installModule from "./functions/installModule";
import { exitProcess } from "./core/cli/utils";

const credentials = await getCredentials();
await fetchTranslation(credentials.apiHost, credentials.userData.language);
await wait(1000);

while (true) {
  console.clear();
  printHeader();
  printMenu();

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

  if (cancelled) {
    await wait(1000);
    continue;
  }

  if (!Object.values(COMMANDS).flat().includes(command)) {
    error(t("messages.invalidCommand"));
    await wait(1000);
    continue;
  }

  switch (command) {
    case "install-module":
      await installModule();
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
      await exitProcess(1);
  }
}
