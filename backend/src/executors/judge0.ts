import axios, { AxiosInstance } from "axios";

const DEFAULT_TIMEOUT = 5000;

type Judge0Language = { id: number; name: string };

export class Judge0Client {
  private client: AxiosInstance;
  private languagesCache: Judge0Language[] | null = null;

  constructor(baseURL: string, apiKey?: string, apiHost?: string) {
    const headers: Record<string, string> = {};
    if (apiKey && apiHost) {
      // RapidAPI-hosted Judge0
      headers["X-RapidAPI-Key"] = apiKey;
      headers["X-RapidAPI-Host"] = apiHost;
    } else if (apiKey) {
      // Self-hosted Judge0 with auth
      headers["X-Auth-Token"] = apiKey;
    }
    this.client = axios.create({
      baseURL: baseURL.replace(/\/+$/, ""),
      timeout: DEFAULT_TIMEOUT,
      headers,
    });
  }

  private async fetchLanguages() {
    if (this.languagesCache) return this.languagesCache;
    const res = await this.client.get("/languages");
    this.languagesCache = (res.data || []) as Judge0Language[];
    return this.languagesCache;
  }

  // Resolve a friendly key to judge0 language id by name heuristics
  public async resolveLanguageId(key: string): Promise<number | null> {
    const langs = await this.fetchLanguages();
    const k = (key || "").toLowerCase();

    const find = (pred: (name: string) => boolean) => {
      const item = langs.find((l) => pred(l.name.toLowerCase()));
      return item ? item.id : null;
    };

    // heuristics for the small set used by the frontend
    if (k === "python") return find((n) => n.includes("python") && n.includes("3")) || find((n) => n.includes("python"));
    if (k === "javascript") return find((n) => n.includes("javascript") || n.includes("nodejs") || n.includes("node.js") || n.includes("node"));
    if (k === "c++" || k === "cpp") return find((n) => n.includes("c++") || n.includes("cpp"));
    if (k === "c") return find((n) => n === "c" || n.includes("gcc") || n.includes("c (gcc)"));
    if (k === "java") return find((n) => n.includes("java") && !n.includes("javascript"));

    // fallback: try substring match
    return find((n) => n.includes(k));
  }

  // Submit code and poll for result (returns decoded stdout/stderr)
  public async runSubmission(
    languageId: number,
    source: string,
    stdin: string | undefined,
    timeoutMs = DEFAULT_TIMEOUT,
  ) {
    const postBody: any = {
      language_id: languageId,
      source_code: source,
      stdin: stdin || "",
      stdout: true,
      stderr: true,
      compile_output: true,
      base64_encoded: false,
    };

    const submissionRes = await this.client.post(`/submissions?base64_encoded=false&wait=false`, postBody);
    const token = submissionRes.data?.token;
    if (!token) throw new Error("Judge0 did not return a token");

    const start = Date.now();
    const deadline = start + timeoutMs;
    const pollInterval = 300;

    while (Date.now() < deadline) {
      const r = await this.client.get(`/submissions/${token}?base64_encoded=false`);
      const statusId = r.data?.status?.id || 0;
      // status.id >= 3 means finished (3 = accepted / processed)
      if (statusId >= 3) {
        return {
          stdout: r.data.stdout ?? null,
          stderr: r.data.stderr ?? null,
          compile_output: r.data.compile_output ?? null,
          message: r.data.message ?? null,
          time: r.data.time ?? null,
          memory: r.data.memory ?? null,
          status: r.data.status?.description ?? "finished",
        };
      }

      await new Promise((res) => setTimeout(res, pollInterval));
    }

    // timed out — attempt to fetch latest state
    const last = await this.client.get(`/submissions/${token}?base64_encoded=false`);
    return {
      stdout: last.data.stdout ?? null,
      stderr: last.data.stderr ?? null,
      compile_output: last.data.compile_output ?? null,
      message: last.data.message ?? null,
      time: last.data.time ?? null,
      memory: last.data.memory ?? null,
      status: "timeout",
    };
  }
}

export function createJudge0ClientFromEnv() {
  const url = process.env.JUDGE0_URL;
  const key = process.env.JUDGE0_KEY;
  const host = process.env.JUDGE0_HOST;
  if (!url) return null;
  return new Judge0Client(url, key, host);
}
