import fs from "fs";

const FILE_NAME = "CHANGELOG.md";

export const updateChangeLog = (newVersion: string) => {
  if (!fs.existsSync(FILE_NAME)) return;

  const content = fs.readFileSync(FILE_NAME, "utf8");

  fs.writeFileSync(
    FILE_NAME,
    content.replace(/^##\s+Unreleased$/m, `## v${newVersion}`),
    "utf8"
  );
};
