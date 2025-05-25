import axios from "axios";
import ora from "ora";
import prompts from "prompts";
import { t } from "../api";

/**
 * Prompts the user to select an icon from Iconify's icon sets.
 * Fetches available icon sets and icons, allowing the user to navigate and select.
 *
 * @returns A promise that resolves to the selected icon in the format "collection:icon".
 * @throws An error if the operation is cancelled or if fetching icons fails.
 */
export default async function selectIcon(): Promise<string> {
  const spinner = ora(t("messages.fetchingIconSetsFromIconify")).start();

  const iconCollections = (
    await axios.get<
      Record<
        string,
        {
          name: string;
          total: number;
          categories?: Record<string, string[]>;
          uncategorized?: string[];
        }
      >
    >("https://api.iconify.design/collections")
  ).data;

  spinner.stop();

  if (!iconCollections) {
    throw new Error(t("messages.failedToFetchIconSets"));
  }

  const iconCollectionsList = Object.keys(iconCollections);

  while (true) {
    let cancelled = false;

    const moduleIconCollection = await prompts(
      {
        type: "autocomplete",
        name: "iconCollection",
        message: t("prompts.selectIconCollection"),
        choices: iconCollectionsList.map((iconCollection) => ({
          title: `${iconCollection}: ${
            iconCollections[iconCollection]?.name
          } (${iconCollections[iconCollection]?.total.toLocaleString()} icons)`,
          value: iconCollection,
        })),
        initial: false,
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

    const spinner2 = ora(t("fetchingIconsFromIconify")).start();

    const icons = (
      await axios(
        `https://api.iconify.design/collection?prefix=${moduleIconCollection.iconCollection}`
      )
    ).data;

    spinner2.stop();

    if (!icons) {
      throw new Error(t("messages.failedToFetchIcons"));
    }

    const iconsList = [
      ...(icons.uncategorized ?? []),
      ...Object.values(icons.categories ?? {}).flat(),
    ];

    let cancelled2 = false;
    const moduleIcon = await prompts(
      {
        type: "autocomplete",
        name: "icon",
        message: t("prompts.selectIcon"),
        choices: [
          {
            title: `../ (${t("prompts.backToIconSets")})`,
            value: "GO_BACK",
          },
          ...iconsList.map((icon: string) => ({
            title: icon,
            value: `${moduleIconCollection.iconCollection}:${icon}`,
          })),
        ],
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
          cancelled2 = true;
        },
      }
    );

    if (cancelled2) {
      throw new Error(t("messages.operationCancelled"));
    }

    if (moduleIcon.icon === "GO_BACK") {
      continue;
    }

    return moduleIcon.icon;
  }
}
