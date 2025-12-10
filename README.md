# ReactoBot

A conversational AI chatbot built with React, TypeScript, and OpenAI's GPT-4 API. ReactoBot is configured to respond as "Void" from the Iron Man films, providing an interactive assistant experience in Swedish.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.8-purple)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.2-purple)

## Features

- **Real-time Streaming Responses**: Messages stream progressively using OpenAI's streaming API
- **Void-style Personality**: Bot configured to respond in the style of Tony Stark's AI assistant
- **Responsive UI**: Built with Bootstrap 5 for mobile and desktop
- **Dynamic Avatars**: User and bot avatars generated via Dicebear API
- **Live Timestamps**: Relative time display that updates in real-time
- **Chat History**: Full conversation history with reset functionality

## Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- OpenAI API key

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ChatGpt
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Create a `.env` file in the project root:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

   Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### Development

Start the development server with hot module replacement:

```bash
yarn dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application for production:

```bash
yarn run build
```

The optimized build will be output to the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
yarn preview
```

### Linting

Run ESLint to check code quality:

```bash
yarn lint
```


## Project Structure

```
ChatGpt/
├── src/
│   ├── components/
│   │   ├── ChatGpt.tsx          # Main chat component with OpenAI integration
│   │   └── ResponseMessage.tsx  # Individual message display component
│   ├── models/
│   │   └── ResponseMessageProps.ts  # TypeScript interfaces
│   ├── styles/
│   │   ├── _bootswatch.scss     # Bootstrap theme customization
│   │   ├── _variables.scss      # SCSS variables
│   │   └── index.scss           # Main stylesheet
│   ├── assets/                  # Images and static assets
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Application entry point
├── .env                         # Environment variables (not in repo)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Technology Stack

### Core
- **React 18.2** - UI library
- **TypeScript 5.2** - Type-safe JavaScript
- **Vite 5.0** - Fast build tool and dev server

### Styling
- **Bootstrap 5.3** - CSS framework
- **Sass** - CSS preprocessor

### APIs
- **OpenAI API** - GPT-4 language model
- **Dicebear API** - Avatar generation

## Configuration

### OpenAI Settings

The bot configuration can be customized in `src/components/ChatGpt.tsx`:

```typescript
const stream = await openai.chat.completions.create({
  messages: [
    {
      role: 'assistant',
      content: 'Your custom Void prompt here...'
    },
    { role: 'user', content: inputMessage || '' }
  ],
  model: 'gpt-4',
  stream: true
});
```

### Bot Personality

To change the bot's personality, modify the Void prompt in the `getOpenAIResponse` function.

## Architecture

### Streaming Flow

1. User submits a message → added to `responseMessages` array
2. OpenAI stream starts → `responseMessage` accumulates chunks in real-time
3. Stream completes → `responseMessage` is saved to history and reset

### State Management

- `responseMessages`: Array of all completed messages (chat history)
- `responseMessage`: Current message being streamed from OpenAI
- `inputMessage`: User's current input text

### TypeScript Patterns

The project uses strict TypeScript mode. All optional properties in `ResponseMessageProps` must be handled with proper null checking:

```typescript
// Correct pattern
if (responseMessage?.message && responseMessage.message.length > 0) {
  // Handle message
}

// Streaming updates with fallbacks
message: (prevMessage.message || '') + (chunk.choices[0]?.delta?.content || '')
```

## Known Issues

- Bootstrap peer dependency warning: `@popperjs/core@^2.11.8` is not installed (Bootstrap JavaScript components requiring Popper.js will not work)
- Client-side OpenAI API calls use `dangerouslyAllowBrowser: true` - not recommended for production

## Security Considerations

⚠️ **Important**: This application makes OpenAI API calls directly from the browser, which exposes your API key. For production use, implement a backend proxy to handle API requests securely.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI powered by [Bootstrap](https://getbootstrap.com/)
- AI capabilities by [OpenAI](https://openai.com/)
- Avatars by [Dicebear](https://dicebear.com/)
