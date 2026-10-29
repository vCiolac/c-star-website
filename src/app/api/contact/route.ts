import { handleContactGet, handleContactPost } from "@/lib/contact/handler";
import { sendWithSmtp } from "@/lib/contact/mailer";
import { createRateLimiter } from "@/lib/contact/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Limite em memória por instância (melhor esforço; ver docs/contact.md).
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export function GET() {
  return handleContactGet({ env: process.env });
}

export function POST(req: Request) {
  return handleContactPost(req, { env: process.env, send: sendWithSmtp, limiter });
}
