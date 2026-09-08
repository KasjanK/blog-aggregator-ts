import { db } from "..";
import { feedFollows, feeds, users } from "../schema";
import { and, eq, sql } from "drizzle-orm";

export async function createFeed(url: string, name: string, userId: string) {
    const [result] = await db.insert(feeds).values({ name: name, url: url, userId: userId }).returning();
    console.log(result);
    return result;
}

export async function listAllFeeds() {
    const result = await db.select().from(feeds);
    return result;
}

export async function getFeedByURL(url: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}

export async function getFeedFollowsForUser(userId: string) {
    const result = await db
        .select({
            id: feedFollows.id,
            createdAt: feedFollows.createdAt,
            updatedAt: feedFollows.updatedAt,
            feedId: feedFollows.feedId,
            feedName: feeds.name,
            userId: feedFollows.userId,
            userName: users.name,
        })
        .from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .where(eq(feedFollows.userId, userId))
    return result;
}

export async function createFeedFollow(feedId: string, userId: string) {
    const [newFeedFollow] = await db.insert(feedFollows).values({ feedId, userId }).returning();

    const [result] = await db
        .select({
            id: feedFollows.id,
            createdAt: feedFollows.createdAt,
            updatedAt: feedFollows.updatedAt,
            feedId: feedFollows.feedId,
            feedName: feeds.name,
            userId: feedFollows.userId,
            userName: users.name,
        })
        .from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .where(eq(feedFollows.id, newFeedFollow.id))
    return result;
}

export async function deleteFeedFollow(userId: string, feedId: string) {
    await db.delete(feedFollows)
        .where(
            and(
                eq(feedFollows.userId, userId),
                eq(feedFollows.feedId, feedId)
            )
        )
}

export async function markFeedFetched(feedId: string) {
    const [result] = await db
        .update(feeds)
        .set({ lastFetchedAt: sql`NOW()`, updatedAt: sql`NOW()` })
        .where(eq(feeds.id, feedId));
    return result;
}

export async function getNextFeedToFetch() {
    const [result] = await db
        .select()
        .from(feeds)
        .orderBy(sql`${feeds.lastFetchedAt} asc nulls first`)
        .limit(1);
    return result;
}
