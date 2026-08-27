import { CommandsRegistry, handlerLogin, registerCommand, runCommand } from "./command_handler";
import { readConfig, setUser } from "./config";

function main() {
    const commandRegistry: CommandsRegistry = {}
    registerCommand(commandRegistry, "login", handlerLogin)

    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("you need to provide at least an argument");
        process.exit(1);
    }

    const cmdName = args[0];
    const cmdArgs = args.slice(1);

    try {
        runCommand(commandRegistry, cmdName, ...cmdArgs)
    } catch (e) {
        if (e instanceof Error) {
            console.error(`Error running command ${cmdName}: ${e.message}`);
        } else {
            console.error(`Error running command ${cmdName}: ${e}`);
        }
        process.exit(1);
    }
}

main();
