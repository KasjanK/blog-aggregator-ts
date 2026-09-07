import { readConfig, setUser } from "./config";
import { createFeed, createFeedFollow, getFeedByURL, getFeedFollowsForUser, listAllFeeds } from "./lib/db/queries/feeds";
import { createUser, getAllUsers, getUserByID, getUserByName, reset } from "./lib/db/queries/users";
import { feeds, users } from "./lib/db/schema";
import { fetchFeed } from "./rss";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;

export type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void> | void;

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

export async function handlerAgg(cmdName: string, ...args: string[]) {
    const feed = await fetchFeed("https://www.wagslane.dev/index.xml")
    const feedStr = JSON.stringify(feed, null, 2);
    console.log(feedStr)
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

export async function handlerAddfeed(cmdName: string, user: User, ...args: string[]) {
    if (args.length < 2) {
        throw new Error("you need to provide a feed name and url")
    }

    const feedName = args[0];
    const feedUrl = args[1];

    const feed = await createFeed(feedUrl, feedName, user.id);
    if (!feed) {
        throw new Error(`Failed to create feed`);
    }

    const feedFollow = await createFeedFollow(feed.id, user.id)
    printFeedFollow(user.name, feedFollow.feedName);

    printFeed(user, feed);
}

export async function handlerListFeeds(cmdName: string, ...args: string[]) {
    const feedList = await listAllFeeds()
    for (const feed of feedList) {
        const user = await getUserByID(feed.userId);

        console.log("--------------------------------------");
        printFeed(user, feed);
    }
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]) { 
    if (args.length !== 1) {
        throw new Error("you need to provide a url");
    }

    const url = args[0];
    const feed = await getFeedByURL(url);
    if (!feed) {
        throw new Error(`feed not found: ${url}`);
    }

    const feedFollow = await createFeedFollow(feed.id, user.id)
    printFeedFollow(feedFollow.userName, feedFollow.feedName)
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]) {
    const feedFollows = await getFeedFollowsForUser(user.id)
    if (feedFollows.length === 0) {
        console.log("no feed follows found for this user")
    }

    for (const follow of feedFollows) {
        console.log(`* ${follow.feedName}`);
    }
}

export async function printFeed(user: User, feed: Feed) {
    console.log(`* ID:            ${feed.id}`);
    console.log(`* Created:       ${feed.createdAt}`);
    console.log(`* Updated:       ${feed.updatedAt}`);
    console.log(`* name:          ${feed.name}`);
    console.log(`* URL:           ${feed.url}`);
    console.log(`* User:          ${user.name}`);
}

export function printFeedFollow(username: string, feedname: string) {
  console.log(`* User:          ${username}`);
  console.log(`* Feed:          ${feedname}`);
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
