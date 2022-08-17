import fs from "fs";
import { Lexer, marked } from "marked";

const FILE_NAME = "CHANGELOG.md";

const getHeadingText = (token: marked.Tokens.Heading) => {
  // @ts-expect-error some tokens don't have a text property?
  return token.tokens.map((t) => t.text || t.raw).join("");
};

export const updateChangeLog = (newVersion: string, defaultChangelog = "") => {
  if (!fs.existsSync(FILE_NAME)) {
    fs.writeFileSync(FILE_NAME, "## Unreleased\n");
  }

  const content = fs.readFileSync(FILE_NAME, "utf8");
  const changelog = getSectionBelowHeadingInMarkdown(
    content,
    "Unreleased"
  )

  const haveChangelog = Boolean(changelog.trim() && !changelog.includes('No unreleased changes.'))

  const newContent = haveChangelog
    ? content.replace(
      /^##\s+Unreleased$/m,
      `## Unreleased\n\nNo unreleased changes.\n\n## ${newVersion}`
    )
    : content.replace(
      /^##\s+Unreleased$\n(\S|\s)+?(?=^##)/m,
      `## Unreleased\n\nNo unreleased changes.\n\n## ${newVersion}\n\n${defaultChangelog}\n\n`
    )

  fs.writeFileSync(
    FILE_NAME,
    newContent,
    "utf8"
  );
};

export const readChangeLogFile = () => {
  if (!fs.existsSync(FILE_NAME)) return;
  return fs.readFileSync(FILE_NAME, "utf8");
};

export const getSectionBelowHeadingInMarkdown = (
  content: string,
  heading: string
) => {
  const tokens = Lexer.lex(content);
  let section = "";
  let collecting = false;
  for (const token of tokens) {
    if (token.type === "heading" && token.depth === 1) {
      continue;
    }
    if (token.type === "heading" && token.depth === 2) {
      if (collecting) {
        break;
      } else {
        const text = getHeadingText(token);
        if (heading && heading === text) {
          collecting = true;
        }
      }
    } else if (collecting) {
      section += token.raw;
    }
  }
  return section;
};
