import { readConfig, setUser } from "./config";

function main() {
    setUser("Kasjan");
    const config = readConfig();
    console.log(config);
}

main();
