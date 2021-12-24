import { execa } from "execa";

const PRODUCTION_BRANCHES = ["master", "main", "prod", "production"];

export function ensureGit(options: { anyBranch?: boolean; cwd?: string } = {}) {
  options = options || {};
  const anyBranch = options.anyBranch;
  const cwd = options.cwd || process.cwd();

  const actions = [
    // Check local working tree
    execa("git", ["status", "--porcelain"], { cwd }).then((result) => {
      if (result.stdout !== "") {
        throw new Error("Unclean working tree. Commit or stash changes first.");
      }
    }),
    // Check remote history
    execa("git", ["rev-list", "--count", "--left-only", "@{u}...HEAD"], {
      cwd,
    }).then((result) => {
      if (result.exitCode !== 0) {
        throw new Error("Remote history differs. Please pull changes.");
      }
    }),
  ];

  if (!anyBranch) {
    actions.push(
      // check current branch
      execa("git", ["symbolic-ref", "--short", "HEAD"], { cwd }).then(
        (result) => {
          const branch = result.stdout.trim();
          if (!PRODUCTION_BRANCHES.includes(branch)) {
            throw new Error(
              `Not on ${PRODUCTION_BRANCHES.join(
                ", "
              )} branches, use --any-branch flag to publish from any branch.`
            );
          }
        }
      )
    );
  }

  return Promise.all(actions);
}
