import { CommandHandler, UserCommandHandler } from "./command_handler";
import { readConfig } from "./config";
import { getUserByName } from "./lib/db/queries/users";

export function middleWareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName: string, ...args: string[]): Promise<void> => {
        const config = readConfig();
        const userName = config.currentUserName;
        if (!userName) {
            throw new Error("user not logged in");
        }

        const user = await getUserByName(userName);
        if (!user) {
            throw new Error(`user ${userName} not found`);
        }

        await handler(cmdName, user, ...args);
    };
}
