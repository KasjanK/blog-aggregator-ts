import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

export async function fetchFeed(feedURL: string) {
    const response = await fetch(feedURL, {
        method: "GET",
        headers: {
            "User-Agent": "gator",
            accept: "application/rss+xml",
        },
    })

    const feedData = await response.text();
    const parser = new XMLParser({ processEntities: false })
    let result = parser.parse(feedData);

    const channel = result.rss?.channel;
    if (!channel) {
        throw new Error("The channel field does not exist")
    }

    if (
        !channel ||
        !channel.title ||
        !channel.link ||
        !channel.description ||
        !channel.item
    ) {
        throw new Error("failed to parse channel");
    }

    const items: any[] = Array.isArray(channel.item)
        ? channel.item
        : [channel.item];

    const rssItems: RSSItem[] = [];

    for (const item of items) {
        if (!item.description || !item.pubDate || !item.link || !item.title) {
            continue;
        }
        rssItems.push({
            title: item.title,
            link: item.link,
            description: item.description,
            pubDate: item.pubDate,
        });
    }

    const feed: RSSFeed = {
        channel: {
            title: channel.title,
            link: channel.link,
            description: channel.description,
            item: rssItems,
        }
    }
    return feed;
}
