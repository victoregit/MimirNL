# MCP host configuration

Official MCP v2 SDK subprocess communication is tested. Codex and Google Antigravity host acceptance is **not tested**. No host configuration was edited. The examples below follow official documentation verified 2026-10-24; replace runtime, build and database paths for your machine. Build first with `npm ci && npm run build`. Use the same explicit DB path in CLI and host configuration.

## Codex

The [official OpenAI MCP documentation](https://developers.openai.com/codex/mcp) documents stdio `command` and `args` under `mcp_servers` in the Codex configuration. Example to add yourself:

```toml
[mcp_servers.mimir]
command = "/absolute/path/to/node"
args = ["/mnt/d/Projects/MimirNL/dist/cli/index.js", "--db", "/home/YOUR_USER/.local/share/mimir-nl/memory.sqlite", "mcp", "stdio"]
```

For native Windows use `command = 'C:\Program Files\nodejs\node.exe'`, a native build path such as `D:\Projects\MimirNL\dist\cli\index.js`, and a private native Windows DB path. TOML literal single-quoted strings preserve backslashes. Do not mix Linux paths and native Windows executables.

## Google Antigravity

The [official Antigravity MCP documentation](https://www.antigravity.google/docs/mcp) documents `mcpServers`, stdio command/args and management through its MCP settings. Add a custom server through the UI or the appropriate `mcp_config.json` for your installed surface. The CLI documentation currently lists `~/.gemini/config/mcp_config.json` and workspace `.agents/mcp_config.json`; IDE/App settings may differ.

```json
{
  "mcpServers": {
    "mimir": {
      "command": "/absolute/path/to/node",
      "args": [
        "/mnt/d/Projects/MimirNL/dist/cli/index.js",
        "--db",
        "/home/YOUR_USER/.local/share/mimir-nl/memory.sqlite",
        "mcp",
        "stdio"
      ]
    }
  }
}
```

On Windows use native paths and double each backslash in JSON. Start with a disposable Git fixture. Register it only after explicitly approving ingestion; pass its returned project UUID for every operation. Require host confirmation for approval/sharing/deletion. All stdout is reserved for JSON-RPC; runtime warnings and startup failures go to stderr. There is no HTTP endpoint or API key.
