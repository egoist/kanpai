import JoyCon from "joycon";

type Config = {
  test?: string;
  commitMessage?: string;
};

export function getConfig(cwd: string): {
  config: Config;
  path?: string;
} {
  const joycon = new JoyCon({
    files: ["package.json", "kanpai.json"],
    cwd,
    packageKey: "kanpai",
  });

  const { data, path } = joycon.loadSync();

  return {
    config: {
      ...data,
    },
    path,
  };
}
