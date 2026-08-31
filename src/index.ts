import { CommandsRegistry, handlerAddfeed, handlerAgg, handlerListFeeds, handlerListUsers, handlerLogin, handlerRegister, handlerReset, registerCommand, runCommand } from "./command_handler";

async function main() {
    const commandRegistry: CommandsRegistry = {}
    registerCommand(commandRegistry, "login", handlerLogin)
    registerCommand(commandRegistry, "register", handlerRegister)
    registerCommand(commandRegistry, "reset", handlerReset)
    registerCommand(commandRegistry, "users", handlerListUsers)
    registerCommand(commandRegistry, "agg", handlerAgg)
    registerCommand(commandRegistry, "addfeed", handlerAddfeed)
    registerCommand(commandRegistry, "feeds", handlerListFeeds)

    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("you need to provide at least an argument");
        process.exit(1);
    }

    const cmdName = args[0];
    const cmdArgs = args.slice(1);

    try {
        await runCommand(commandRegistry, cmdName, ...cmdArgs)
    } catch (e) {
        if (e instanceof Error) {
            console.error(`Error running command ${cmdName}: ${e.message}`);
        } else {
            console.error(`Error running command ${cmdName}: ${e}`);
        }
        process.exit(1);
    }
    process.exit(0);
}

main();
