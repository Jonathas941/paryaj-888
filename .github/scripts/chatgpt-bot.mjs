// ChatGPT bot for the PARYAJ 888 repository.
// Triggered by .github/workflows/chatgpt-bot.yml on new issues and pull requests.
// Requires the OPENAI_API_KEY repository secret (GitHub → Settings → Secrets → Actions).
// GITHUB_TOKEN is provided automatically by GitHub Actions.

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EVENT_NAME = process.env.EVENT_NAME;
const REPO = process.env.REPO; // "owner/repo"
const ISSUE_NUMBER = process.env.ISSUE_NUMBER;
const PR_NUMBER = process.env.PR_NUMBER;
const ACTOR = process.env.ACTOR;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const API = "https://api.github.com";
const ghHeaders = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28"
};

const isPR = EVENT_NAME === "pull_request";
const number = Number(isPR ? PR_NUMBER : ISSUE_NUMBER);

async function gh(path, opts = {}) {
  const res = await fetch(`${API}/repos/${REPO}/${path}`, { headers: ghHeaders, ...opts });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res;
}

async function getItem() {
  const res = await gh(`issues/${number}`);
  return res.json();
}

async function getPRDiff() {
  const res = await fetch(`${API}/repos/${REPO}/pulls/${number}`, {
    headers: { ...ghHeaders, Accept: "application/vnd.github.v3.diff" }
  });
  if (!res.ok) throw new Error(`diff fetch ${res.status}`);
  return res.text();
}

async function postComment(body) {
  await gh(`issues/${number}/comments`, { method: "POST", body: JSON.stringify({ body }) });
}

async function chat(messages) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: 800, temperature: 0.4 })
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

async function main() {
  if (!OPENAI_API_KEY) {
    await postComment("⚠️ ChatGPT bot is not configured. Add the `OPENAI_API_KEY` repository secret (Settings → Secrets and variables → Actions) to enable AI responses.");
    return;
  }

  const item = await getItem();
  const title = item.title || "";
  const body = item.body || "(no description provided)";

  let prompt;
  if (isPR) {
    let diff = "";
    try { diff = await getPRDiff(); } catch { diff = "(could not load diff)"; }
    const trimmed = diff.length > 12000 ? diff.slice(0, 12000) + "\n\n…(diff truncated)" : diff;
    prompt = [
      "You are an expert code reviewer for the PARYAJ 888 sportsbook & casino repository.",
      "Stack: React + Vite + Tailwind CSS + Base44 BaaS (entities, backend functions, workflows).",
      `A new pull request was opened by @${ACTOR}.`,
      "",
      `Title: ${title}`,
      "",
      "Description:",
      body,
      "",
      "Diff:",
      trimmed,
      "",
      "Write a concise, friendly code review: summarize the change, flag bugs or risks, and suggest improvements. Use bullet points."
    ].join("\n");
  } else {
    prompt = [
      "You are a helpful assistant for the PARYAJ 888 sportsbook & casino repository.",
      "Stack: React + Vite + Tailwind CSS + Base44 BaaS (entities, backend functions, workflows).",
      `A new issue was opened by @${ACTOR}.`,
      "",
      `Title: ${title}`,
      "",
      "Body:",
      body,
      "",
      "Provide a helpful, concise response. For a bug report, suggest likely causes and debugging steps. For a question, answer it. Ask for clarification only if essential."
    ].join("\n");
  }

  const reply = await chat([
    { role: "system", content: "You are a concise, friendly senior engineer assistant embedded in a GitHub repository. Keep responses under 250 words, use markdown, and be actionable." },
    { role: "user", content: prompt }
  ]);

  await postComment(`🤖 **ChatGPT Bot**\n\n${reply}\n\n_Automated response — please review with care._`);
}

main().catch(async (e) => {
  try { await postComment(`⚠️ ChatGPT bot encountered an error: ${e.message}`); } catch {}
  console.error(e);
  process.exit(1);
});