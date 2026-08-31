import { db } from "..";
import { feeds } from "../schema";

export async function createFeed(url: string, name: string, userId: string) {
    const [result] = await db.insert(feeds).values({ name: name, url: url, userId: userId}).returning();
    console.log(result);
    return result;
}

export async function listAllFeeds() {
    const result = await db.select().from(feeds);
    return result;
}
