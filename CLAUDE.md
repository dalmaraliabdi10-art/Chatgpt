# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ReactoBot is a React + TypeScript chat application that integrates with OpenAI's GPT-4 API. The bot is configured to respond as "Void" from Iron Man films, providing a conversational AI assistant experience in Swedish.

## Development Commands

```bash
# Install dependencies
yarn install

# Start development server with HMR
yarn dev

# Build for production (TypeScript compilation + Vite build)
yarn run build

# Lint TypeScript and TSX files
yarn lint

# Preview production build
yarn preview
```

## Architecture

### Application Structure

- **Single Page Application**: The app renders a single ChatGpt component that manages the entire chat interface
- **Streaming Responses**: Uses OpenAI's streaming API to display responses progressively as they arrive
- **State Management**: Plain React hooks (useState) manage all application state - no external state libraries

### Key Components

**ChatGpt** ([src/components/ChatGpt.tsx](src/components/ChatGpt.tsx))
- Main component handling OpenAI integration and chat logic
- Manages three key states:
  - `responseMessages`: Array of completed messages (history)
  - `responseMessage`: Current streaming message being built
  - `inputMessage`: User's input text
- Streaming flow:
  1. User submits message → added to `responseMessages`
  2. OpenAI stream starts → `responseMessage` accumulates chunks
  3. Stream completes → `responseMessage` saved to `responseMessages` and reset
- Uses `dangerouslyAllowBrowser: true` for client-side OpenAI calls (not recommended for production)

**ResponseMessage** ([src/components/ResponseMessage.tsx](src/components/ResponseMessage.tsx))
- Displays individual messages with avatars from dicebear.com API
- Shows "time ago" timestamps that update every second
- Different avatar styles for user vs chatgpt

### TypeScript Configuration

- **Strict Mode Enabled**: All optional properties must be explicitly handled with null checks
- The `ResponseMessageProps` interface has optional properties (`message?`, `user?`, `timestamp?`) to allow empty object initialization during streaming
- Always use optional chaining (`?.`) and nullish coalescing (`||`) when accessing these properties

### Styling

- Bootstrap 5.3.2 for UI components (note: missing peer dependency `@popperjs/core@^2.11.8`)
- Custom SCSS in `src/styles/` with Bootswatch theme customizations
- Main styles imported in [src/main.tsx](src/main.tsx)

## Environment Setup

Create a `.env` file with:
```
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

The API key is accessed via `import.meta.env.VITE_OPENAI_API_KEY` in the code.

## TypeScript Patterns

When modifying chat-related code:

1. **Always handle undefined values**: Properties on `ResponseMessageProps` are optional
   ```typescript
   // Good
   if (responseMessage?.message && responseMessage.message.length > 0)

   // Bad
   if (responseMessage.message.length > 0)
   ```

2. **Streaming updates**: When updating `responseMessage` during streaming, provide fallbacks:
   ```typescript
   message: (prevMessage.message || '') + (chunk.choices[0]?.delta?.content || '')
   ```

3. **State initialization**: Empty objects are valid for `ResponseMessageProps`:
   ```typescript
   setResponseMessage({}) // Valid
   ```

## Bot Configuration

The OpenAI assistant prompt is hardcoded in Swedish in [ChatGpt.tsx:42](src/components/ChatGpt.tsx#L42). It configures the bot as "ReactoBot" mimicking Void from Iron Man. To change the bot's personality, modify this prompt.
