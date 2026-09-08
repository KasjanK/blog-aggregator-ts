# blog-aggregator

A command line tool for aggregating RSS feeds and viewing the posts.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) running locally or accessible remotely

## Installation
1. Clone the repository:

```bash
   git clone https://github.com/KasjanK/blog-aggregator-ts
```

2. Install dependencies:
```
   npm install
```

## Config
Create a `.gatorconfig.json` file in your home directory:

```json
{
  "db_url": "postgres://username:@localhost:5432/database?sslmode=disable"
}
```

Replace the url with your database connection string.

## Usage
Create a new user:

```bash
gator register <name>
```

Add a feed:

```bash
gator addfeed <url>
```

Start the aggregator:

```bash
gator agg 30s
```

View the posts:

```bash
gator browse [limit]
```

Other commands:

- `gator login <name>` - Log in as a user that already exists
- `gator users` - List all users
- `gator feeds` - List all feeds
- `gator follow <url>` - Follow a feed that already exists in the database
- `gator unfollow <url>` - Unfollow a feed that already exists in the database

