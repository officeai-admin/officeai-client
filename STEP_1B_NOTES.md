# Vercel AI SDK end-to-end chat migration

The main chatbot is now fully migrated to the Vercel AI SDK v4 UI flow while keeping Zustand and localStorage as the application state/persistence layer.

## Runtime flow

```text
ChatInput
  -> ChatLayout/useChat
  -> POST /api/chat
  -> Express
  -> streamText()
  -> OpenAI gpt-4o-mini
  -> optional getWeather/calculate tool execution
  -> pipeDataStreamToResponse()
  -> useChat()
  -> Zustand sync
  -> localStorage
  -> React UI
```

## Migrated behaviors

- New messages use `useChat.append()`.
- Streaming state comes from `useChat.status`.
- Errors come from `useChat.error`.
- Stop/cancel uses `useChat.stop()`.
- Regenerate uses `useChat.reload()`.
- Editing a user message truncates the AI SDK conversation and regenerates from the edited message.
- Existing localStorage conversations are loaded as `initialMessages`.
- AI SDK message IDs are preserved when syncing back into the application's message model.
- Existing attachment metadata, feedback, titles, sidebar and conversation UI remain in the application layer.
- Weather and calculator tools remain server-side AI SDK tools.

## Persistence decision

There is intentionally no database. Zustand remains the runtime application state and localStorage remains the persistence layer.

## Important limitation of current attachment UI

The paperclip UI currently stores attachment metadata in the conversation and displays it, but does not send the file bytes to `/api/chat`. The existing dedicated image/PDF tools continue to handle actual file content through their own endpoints. This is intentionally unchanged in this migration.

## AI SDK version

This project remains on the existing AI SDK 4.x dependency range. The migration uses the v4 `useChat`, `append`, `setMessages`, `reload`, `stop`, and data-stream APIs rather than the newer AI SDK 5/6 transport architecture.
