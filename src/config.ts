import os from "os";
import path from "path";
import fs from "fs";

type Config = {
    dbUrl: string;
    currentUserName: string;
}

function getConfigFilePath(): string {
    return path.join(os.homedir(), ".gatorconfig.json")
}

function writeConfig(cfg: Config): void {
    const configFilePath = getConfigFilePath();
    const rawConfig = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName,
    };

    const data = JSON.stringify(rawConfig, null, 2);

    fs.writeFileSync(configFilePath, data, { encoding: "utf-8" });
}

function validateConfig(rawConfig: any) {
    if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
        throw new Error("db_url is required in config file");
    }
    const config: Config = {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name ?? "",
    };

    return config;
}


export function setUser(username: string) {
    const config = readConfig();
    config.currentUserName = username;
    writeConfig(config);
}

export function readConfig() {
    const fullPath = getConfigFilePath();

    const data = fs.readFileSync(fullPath, "utf-8");
    const rawConfig = JSON.parse(data);

    return validateConfig(rawConfig);
}
