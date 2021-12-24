import path from "path";
import envPaths from "env-paths";
import fs from "fs";

const configDir = envPaths("kanpai").config;
const configFile = path.join(configDir, "config.json");

const readConfig = () => {
  if (!fs.existsSync(configFile)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(configFile, "utf8"));
};

const createConfig = () => {
  let configCache: Record<string, any> | undefined;

  try {
    fs.mkdirSync(configDir, { recursive: true });
  } catch (_) {}

  return {
    get all() {
      configCache = configCache || readConfig();
      return configCache!;
    },
    get(key: string): any {
      configCache = configCache || readConfig();
      return configCache![key];
    },
    set(key: string, value: string | number | boolean) {
      configCache = configCache || readConfig();
      configCache![key] = value;
      fs.writeFileSync(configFile, JSON.stringify(configCache), "utf8");
    },
    del(key: string) {
      configCache = configCache || readConfig();
      delete configCache![key];
      fs.writeFileSync(configFile, JSON.stringify(configCache), "utf8");
    },
  };
};

export const config = createConfig();
