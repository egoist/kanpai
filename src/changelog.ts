import fs from "fs";
import { Lexer, marked } from "marked";

const FILE_NAME = "CHANGELOG.md";

const getHeadingText = (token: marked.Tokens.Heading) => {
  // @ts-expect-error
  return token.tokens.map((t) => t.text || t.raw).join("");
};

export const updateChangeLog = (newVersion: string) => {
  if (!fs.existsSync(FILE_NAME)) return;

  const content = fs.readFileSync(FILE_NAME, "utf8");

  fs.writeFileSync(
    FILE_NAME,
    content.replace(
      /^##\s+Unreleased$/m,
      `## Unreleased\n\n\n## ${newVersion}`
    ),
    "utf8"
  );
};

export const readChangeLogFile = () => {
  if (!fs.existsSync(FILE_NAME)) return;
  return fs.readFileSync(FILE_NAME, "utf8");
};

export const getChangeLogByVersion = (content: string, version: string) => {
  const tokens = Lexer.lex(content);
  let changelog = "";
  let collectingChangelog = false;
  for (const token of tokens) {
    if (token.type === "heading" && token.depth === 1) {
      continue;
    }
    if (token.type === "heading" && token.depth === 2) {
      if (collectingChangelog) {
        break;
      } else {
        const text = getHeadingText(token);
        if (version && version === text) {
          collectingChangelog = true;
        }
      }
    } else if (collectingChangelog) {
      changelog += token.raw;
    }
  }
  return changelog;
};
