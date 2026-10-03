import {createMCPClient, type MCPClient} from '@ai-sdk/mcp'

// Sanity Context MCP in knowledge_base mode. Read-only by design: writes go through the Sanity client.
// Each course can name its own endpoint (one Knowledge Base per course); otherwise the default applies.
export async function contextMcp(courseEndpoint?: string | null): Promise<MCPClient> {
  const url = courseEndpoint || process.env.SANITY_CONTEXT_MCP_URL
  const token = process.env.SANITY_ORGANIZATION_TOKEN
  if (!url || !token) throw new Error('SANITY_CONTEXT_MCP_URL and SANITY_ORGANIZATION_TOKEN must be set')
  return createMCPClient({
    transport: {type: 'http', url, headers: {Authorization: `Bearer ${token}`}},
    clientName: 'scholia',
  })
}
