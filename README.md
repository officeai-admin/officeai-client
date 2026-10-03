# AI Assistant — ChatGPT-style chat UI

A React + TypeScript chatbot UI backed by Express and the Vercel AI SDK.
The main chat path uses `useChat` on the client and `streamText` on the server.
Conversation state is managed by Zustand and persisted to `localStorage` for now.
No database is required.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand
- Express
- Vercel AI SDK 4.x
- `@ai-sdk/react` for the chatbot UI
- `@ai-sdk/openai`
- OpenAI `gpt-4o-mini`
- Zod

## Run it

```bash
npm install
cp .env.example .env
# add OPENAI_API_KEY and FIRECRAWL_API_KEY where required
npm run dev
```

Then open the Vite URL printed by the client.

Production client build:

```bash
npm run build
npm run preview
```

## End-to-end chat architecture

```text
ChatInput
   ↓
ChatLayout / useChat()
   ↓
POST /api/chat
   ↓
Express
   ↓
streamText()
   ↓
OpenAI
   ↓
AI SDK tools (weather / calculator)
   ↓
pipeDataStreamToResponse()
   ↓
useChat()
   ↓
Zustand
   ↓
localStorage
```

The AI SDK data stream is used instead of manually reading `ReadableStream` chunks.
This lets the client understand the AI SDK stream protocol, including tool-call
related stream parts, while the application can continue to render its existing
message model.

## Project structure

```text
src/
├── components/
│   ├── chat/              # Chat UI and message actions
│   ├── input/             # Chat input + attachment metadata UI
│   ├── sidebar/           # Conversation navigation
│   ├── theme/             # Theme handling
│   ├── tools/             # Alt text, PDF and research tools
│   └── common/            # Shared UI
├── hooks/
├── store/chatStore.ts     # Zustand application state + localStorage sync
├── services/
│   ├── titleService.ts
│   ├── summaryService.ts
│   └── researchService.ts
├── types/chat.ts
├── utils/
└── data/

server/
├── index.ts               # Express API + main AI SDK chat endpoint
├── ai/                    # Structured output / vision / PDF / research logic
└── tools/                 # AI SDK tools
```

## Main chat endpoint

`POST /api/chat` receives the UI messages produced by `useChat`.
The server adds the system prompt and calls:

```ts
streamText({
  model: openai("gpt-4o-mini"),
  system: getSystemPrompt(),
  messages,
  tools: {
    getWeather: getWeatherTool,
    calculate: calculateTool,
  },
  maxSteps: 5,
});
```

Because this project uses Express rather than a framework route handler, the
AI SDK v4 result is piped to the Node response with:

```ts
result.pipeDataStreamToResponse(res);
```

## Chat features migrated to AI SDK UI

- New messages: `useChat().append()`
- Streaming state: `useChat().status`
- Stop generation: `useChat().stop()`
- Regenerate: `useChat().reload()`
- Edit a previous user message: `setMessages()` followed by `reload()`
- Error state: `useChat().error`
- Initial local conversations: `initialMessages`

Zustand remains responsible for the application's conversation metadata,
attachments, feedback, sidebar state and persistence. AI SDK owns the active
request/stream lifecycle.

## localStorage persistence

There is intentionally no database at this stage.

`src/utils/storage.ts` is the single localStorage access point. The Zustand
store mirrors the AI SDK message state into the existing `Conversation` model
and persists completed/error states to localStorage.

When a database is introduced later, this boundary can be replaced without
changing the AI model/tool architecture.

## Model providers

The project currently uses OpenAI:

```ts
import { openai } from "@ai-sdk/openai";

model: openai("gpt-4o-mini");
```

To switch providers later, install the corresponding AI SDK provider package
and replace the provider/model configuration.

## Other AI features

The project also contains independent AI SDK Core features:

- Conversation titles via `generateObject`
- Conversation summaries via `streamObject`
- Image alt text via `generateText` with image input
- PDF structured extraction via `generateObject`
- Research agent via `streamText` + `webSearch` + `maxSteps`

These remain separate from the main `useChat` flow intentionally.

## Attachments

The main paperclip UI currently stores attachment metadata in local conversation
state and displays it. It does not upload the file bytes to `/api/chat`.
Actual image/PDF processing continues through the dedicated tool endpoints.

## Important version note

This project remains on the existing AI SDK 4.x dependency range. Do not copy
AI SDK 5/6 transport APIs directly into this project without a deliberate SDK
upgrade and migration.
