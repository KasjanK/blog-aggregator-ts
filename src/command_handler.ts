import { readConfig, setUser } from "./config";
import { createUser, getAllUsers, getUserByName, reset } from "./lib/db/queries/users";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("please provide a username")
    }

    const username = args[0];
    const user = await getUserByName(username);
    if (!user) {
        throw new Error("user doesnt exist");
    }

    setUser(user.name);
    console.log(`Username "${username}" has been set!`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("please provide a username to register");
    }

    const username = args[0];
    const user = await createUser(username);
    if (!user) {
        throw new Error("user already exists")
    }

    setUser(user.name);
    console.log(`User "${user.name}" has been registered!`);
}

export async function handlerReset(cmdName: string, ...args: string[]) {
    await reset();
    console.log("table users reset successfully");
    process.exit(0);
}

export async function handlerListUsers(cmdName: string, ...args: string[]) {
    const users = await getAllUsers();
    if (users.length === 0) {
        console.log("no users available");
    }
    for (const user of users) {
        if (readConfig().currentUserName === user.name) {
            console.log(`* ${user.name} (current)`);
            continue
        }
        console.log(`* ${user.name}`);
    }
}

export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error(`Unknown command: ${cmdName}`);
    }
    await handler(cmdName, ...args);
}
