This folder is where `shadcn/ui` and Prompt Kit components land when you
install them with the CLI — it's intentionally empty in this scaffold since
those installs require network access.

Run:

    npx shadcn@latest init
    npx shadcn@latest add "https://prompt-kit.com/c/prompt-input.json" \
      "https://prompt-kit.com/c/message.json" \
      "https://prompt-kit.com/c/chat-container.json" \
      "https://prompt-kit.com/c/markdown.json" \
      "https://prompt-kit.com/c/code-block.json" \
      "https://prompt-kit.com/c/scroll-button.json" \
      "https://prompt-kit.com/c/file-upload.json" \
      "https://prompt-kit.com/c/prompt-suggestion.json" \
      "https://prompt-kit.com/c/loader.json"

Each command drops a `.tsx` file in here. Then, one at a time, swap the
matching hand-rolled component for the installed one:

| Hand-rolled (works today)          | Replace with                              |
|-------------------------------------|--------------------------------------------|
| components/input/ChatInput.tsx      | ui/prompt-input.tsx                        |
| components/chat/ChatMessage.tsx     | ui/message.tsx                             |
| components/chat/ChatMessages.tsx    | ui/chat-container.tsx + ui/scroll-button.tsx |
| components/chat/Markdown.tsx        | ui/markdown.tsx                            |
| components/chat/CodeBlock.tsx       | ui/code-block.tsx                          |
| components/input/FileAttachments.tsx| ui/file-upload.tsx                         |
| WelcomeScreen suggestion buttons    | ui/prompt-suggestion.tsx                   |
| components/chat/TypingIndicator.tsx | ui/loader.tsx                              |

The app runs fully today without any of this — these are drop-in upgrades,
not requirements.
