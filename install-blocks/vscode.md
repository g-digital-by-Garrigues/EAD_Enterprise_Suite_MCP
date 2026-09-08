```json
{
  "servers": {
    "ead-enterprise-suite": {
      "args": [
        "-y",
        "@g-digital/mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_API_BASE_URL": "https://api-eadcustody.eadtrust.gocertius.io",
        "MCP_AUTH_USER_KEY": "<PASTE_MCP_AUTH_USER_KEY_HERE>"
      }
    }
  }
}
```

> Need credentials? See: https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/
