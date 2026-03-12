---
name: microsoft-graph
description: How to fetch Excel timetable data from FH OneDrive via Microsoft Graph API
---

# Microsoft Graph API — Stundenplan

## Setup
- Azure App Registration required (already configured via .env)
- Use OAuth 2.0 client credentials flow
- Library: @microsoft/microsoft-graph-client

## Required Env Variables
```
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_TENANT_ID=
ONEDRIVE_FILE_PATH=
```

## Auth Flow
```typescript
import { ClientSecretCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from
  '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'

const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID!,
  process.env.AZURE_CLIENT_ID!,
  process.env.AZURE_CLIENT_SECRET!
)

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['https://graph.microsoft.com/.default']
})

const client = Client.initWithMiddleware({ authProvider })
```

## Fetching Excel Data
```typescript
// Get worksheet data
const response = await client
  .api(`/drives/{drive-id}/items/{item-id}/workbook/worksheets/{sheet}/usedRange`)
  .get()

const values = response.values // 2D array
```

## Data Mapping
Excel columns expected:
- A: Tag (Montag, Dienstag...)
- B: Uhrzeit (08:00 - 09:30)
- C: Fach
- D: Raum
- E: Dozent

Map to TypeScript interface:
```typescript
interface TimetableEntry {
  day: string
  time: string
  subject: string
  room: string
  lecturer: string
}
```

## Rules
- Always fetch server-side only (API Route or Server Component)
- Never expose Azure credentials client-side
- Cache timetable data (revalidate every 24h with Next.js fetch cache)
- Handle empty cells gracefully (null checks)
- Always wrap in try/catch, Graph API can be flaky