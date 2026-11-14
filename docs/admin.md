# Admin (content editor)

The admin at `/admin` edits information pages and diary posts. It isn't linked from the store.

## Set the admin password

1. In a terminal in the project folder, run `npm run admin:hash-password`.
2. Type the password. Typing is hidden. Use at least 12 characters.
3. Copy the `ADMIN_PASSWORD_HASH=...` line it prints into `.env.local`.
4. Restart the dev server.

Until `ADMIN_PASSWORD_HASH` is set, sign-in is off and the admin stays closed.

`SESSION_SECRET` signs the session cookie. It needs 32 or more characters. To make one, run `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` and put the output in `.env.local` as `SESSION_SECRET=`.

## Drafts and live copies

- Every page and post has a draft and a live copy. Save draft changes only the draft. Publish copies the draft live. Unpublish removes the live copy and keeps the draft.
- A live page keeps its web address. Unpublish it first to change the address.
- Preview opens the last saved draft in a new tab, with a banner and an Exit preview button. Visitors never see drafts.

## Seed content

`npm run seed:cms` adds the placeholder pages and posts from `docs/seed` as live content. Entries that already exist are skipped, so it's safe to run again. Replace the placeholder text before launch.

## Known limits

- The sign-in lockout (five wrong passwords, then 15 minutes) counts in memory, so each server instance keeps its own count. Move it to shared storage before launch.
- There is one shared password, so the admin keeps no record of who made a change.
- Reviews and the inbox aren't connected yet.
- The homepage editor (Content) sets the hero video, the hero text, the collections heading and the two tiles. Video uploads need the `read_files` and `write_files` Admin API scopes. Other images can't be uploaded yet.
- `proxy.ts` sends a visitor with no session cookie to the sign-in page before any admin page runs. It checks only that the cookie exists. Each page and action still verifies the session itself.
