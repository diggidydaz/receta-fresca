// Diagnostic: lists the model IDs this deployment's API key can use. No secrets are returned.
import Anthropic from "@anthropic-ai/sdk";

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "no API key configured" });
  try {
    const client = new Anthropic({ apiKey, timeout: 10000, maxRetries: 0 });
    const page = await client.models.list({ limit: 100 });
    return Response.json({ models: page.data.map((m) => m.id) });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message.slice(0, 200) : "unknown" });
  }
}
