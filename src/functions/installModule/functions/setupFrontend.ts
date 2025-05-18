import path from "path";
import fs from "fs";
import { wait } from "../../../core/cli";
import { error } from "console";
import prompts from "prompts";
import { t } from "../../../core/api";

const findMatchingBracket = (line: string, startIndex: number) => {
  let openBracket = 0;
  for (let i = startIndex; i < line.length; i++) {
    if (line[i] === "[") {
      openBracket++;
    } else if (line[i] === "]") {
      openBracket--;
      if (openBracket === 0) {
        return i;
      }
    }
  }
  return -1;
};

export default async function setupFrontend(frontendPath: string) {
  const routesFile = path.resolve(frontendPath, "src/core", "Routes.tsx");

  if (!fs.existsSync(routesFile)) {
    throw new Error(
      `Routes file not found at ${routesFile}. Please ensure the file exists.`
    );
  }

  const routesContent = fs.readFileSync(routesFile, "utf-8");
  const eachLines = routesContent.split("\n").map((line) => line.trim());
  const categories = eachLines
    .filter((line) => line.startsWith("title:"))
    .map((line) => {
      const match = line.match(/title:\s*['"](.*?)['"]/);
      return match ? match[1] : null;
    })
    .filter(Boolean)
    .sort() as string[];

  let cancelled = false;

  const { targetCategory } = await prompts(
    {
      type: "select",
      name: "targetCategory",
      message: t("prompts.selectCategory"),
      choices: categories.map((category) => ({
        title: category,
        value: category,
      })),
    },
    {
      onCancel: () => {
        cancelled = true;
      },
    }
  );

  if (cancelled) {
    error("Operation cancelled");
    await wait(1000);
    return;
  }

  const targetCategoryIndex = new RegExp(
    `{\\s+title:\\s*?['"]` + targetCategory + `['"]`
  ).exec(routesContent)?.index;

  if (targetCategoryIndex === undefined) {
    error("Target category not found");
    await wait(1000);
    return;
  }

  const startBracketIndex = routesContent.indexOf("[", targetCategoryIndex);

  const endBraceIndex = findMatchingBracket(routesContent, startBracketIndex);

  if (endBraceIndex === -1) {
    error("Matching bracket not found");
    await wait(1000);
    return;
  }

  const moduleList = routesContent
    .slice(startBracketIndex, endBraceIndex + 1)
    .trim();

  await wait(10000);
}
