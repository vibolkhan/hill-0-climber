#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseArgs(argv) {
  const args = { env: ".env.local", columns: "" };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--env") args.env = argv[++i];
    else if (arg === "--table") args.table = argv[++i];
    else if (arg === "--columns") args.columns = argv[++i];
  }

  if (!args.table) {
    throw new Error("Missing --table");
  }

  return args;
}

function readEnv(filePath) {
  const fullPath = resolve(filePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Env file not found: ${fullPath}`);
  }

  const env = {};
  const content = readFileSync(fullPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = value;
  }

  return env;
}

async function probe({ url, key, table, select }) {
  const endpoint = new URL(`/rest/v1/${table}`, url);
  endpoint.searchParams.set("select", select);
  endpoint.searchParams.set("limit", "0");

  let response;
  try {
    response = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
  } catch (error) {
    return {
      ok: false,
      status: null,
      select,
      body: {
        message: error.message,
        code: error.cause?.code,
      },
    };
  }

  let body = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    select,
    body,
  };
}

const args = parseArgs(process.argv.slice(2));
const env = readEnv(args.env);
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY");
}

const columns = args.columns
  .split(",")
  .map((column) => column.trim())
  .filter(Boolean);

const tableProbe = await probe({ url, key, table: args.table, select: "*" });
const columnProbe = columns.length
  ? await probe({ url, key, table: args.table, select: columns.join(",") })
  : null;

console.log(JSON.stringify({ table: args.table, columns, tableProbe, columnProbe }, null, 2));
