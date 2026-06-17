import {
  appendFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

import { getLogger } from "../../util/logger.js";
import type { WorkspaceMigration } from "./types.js";

const log = getLogger(
  "workspace-migration-106-release-notes-firecrawl-web-fetch",
);

const MIGRATION_ID = "106-release-notes-firecrawl-web-fetch";
const MARKER = `<!-- release-note-id:${MIGRATION_ID} -->`;

const RELEASE_NOTE = `${MARKER}
## Firecrawl web fetch

\`web_fetch\` can now read pages through Firecrawl, returning clean markdown —
including for JavaScript-rendered sites the built-in fetcher can't see. It
reuses your Firecrawl API key (set it with \`assistant keys set firecrawl
<key>\`), then run \`assistant config set services.web-fetch.provider firecrawl\`
to enable it.
`;

export const releaseNotesFirecrawlWebFetchMigration: WorkspaceMigration = {
  id: MIGRATION_ID,
  description: "Append release notes for Firecrawl web fetch to UPDATES.md",

  run(workspaceDir: string): void {
    const updatesPath = join(workspaceDir, "UPDATES.md");

    try {
      if (existsSync(updatesPath)) {
        const existing = readFileSync(updatesPath, "utf-8");
        if (existing.includes(MARKER)) {
          return;
        }
        const needsLeadingNewline = !existing.endsWith("\n\n");
        const prefix = existing.endsWith("\n") ? "\n" : "\n\n";
        appendFileSync(
          updatesPath,
          needsLeadingNewline ? `${prefix}${RELEASE_NOTE}` : RELEASE_NOTE,
          "utf-8",
        );
      } else {
        writeFileSync(updatesPath, RELEASE_NOTE, "utf-8");
      }
      log.info(
        { path: updatesPath },
        "Appended Firecrawl web fetch release note",
      );
    } catch (err) {
      log.warn(
        { err, path: updatesPath },
        "Failed to append Firecrawl web fetch release note to UPDATES.md",
      );
    }
  },

  down(_workspaceDir: string): void {
    // Forward-only: UPDATES.md is a user-facing bulletin the assistant
    // processes and deletes on its own.
  },
};
