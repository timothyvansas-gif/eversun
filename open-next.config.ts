// No ISR/revalidation on this site (single static page + one dynamic API
// route), so the default in-memory cache is enough — no R2 bucket needed.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
