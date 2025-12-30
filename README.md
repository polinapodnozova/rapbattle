# 🎤 AI Rap Battle Game

An addictive rap battle game where you rap against an AI opponent using your voice! The game uses OpenAI's Whisper for speech recognition, GPT-4 for generating creative rap responses, and TTS for AI voice output.

## 🎮 Features

- **Voice Input**: Rap into your microphone (up to 30 seconds)
- **Speech-to-Text**: Powered by OpenAI Whisper API
- **AI Opponent**: GPT-4 generates creative, contextual rap responses
- **Text-to-Speech**: AI performs its rap back to you
- **Scoring System**: Automatic scoring based on lyrics quality
- **Random Topics**: Get different battle topics each round
- **Beautiful UI**: Animated, responsive design with visual effects

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Microphone access in your browser

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**

Copy the example file and add your OpenAI API key:
```bash
copy .env.local.example .env.local
```

Edit `.env.local` and add your API key:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Play

1. Click "START BATTLE" to begin
2. You'll receive a random topic (e.g., "Pizza vs Burgers")
3. Click the microphone button and rap your verse (up to 30 seconds)
4. Click "STOP" when you're done
5. The AI will analyze your rap and respond with its own verse
6. See the scores and find out who won!
7. Battle again with a new topic

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: CSS Modules with animations
- **APIs**:
  - OpenAI Whisper (Speech-to-Text)
  - OpenAI GPT-4 (Rap generation)
  - OpenAI TTS (Text-to-Speech)

## 📁 Project Structure

```
rapbattle/
├── app/
│   ├── api/
│   │   ├── transcribe/    # Whisper STT endpoint
│   │   ├── battle/        # GPT-4 rap generation
│   │   └── tts/           # Text-to-speech
│   ├── page.tsx           # Main game component
│   ├── page.module.css    # Game styles
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── package.json
├── tsconfig.json
└── next.config.js
```

## 💡 Features Explained

### Voice Recording
- Uses browser's `MediaRecorder` API
- Records in WebM format
- 30-second maximum recording time
- Visual recording indicator with timer

### Speech-to-Text
- OpenAI Whisper API handles audio transcription
- Supports various audio formats
- Accurate even with background noise

### AI Battle Logic
- GPT-4 analyzes your lyrics and the topic
- Generates contextual, creative responses
- Maintains competitive but playful tone

### Scoring System
- Word count (optimal: 20-200 words)
- Line count (more structure = higher score)
- Vocabulary variety
- Energy/enthusiasm indicators
- Random variation for unpredictability

### Text-to-Speech
- Uses "Onyx" voice (deep, rap-appropriate)
- Plays automatically after AI response
- Skip option available

## 🎨 Customization Ideas

- Add more voices for different AI personalities
- Implement difficulty levels
- Add beat/background music
- Save and share battles
- Multiplayer mode
- More sophisticated scoring with rhyme scheme detection
- Leaderboard system

## 💰 API Costs

Approximate costs per battle:
- Whisper (30s audio): ~$0.01
- GPT-4 (rap generation): ~$0.02-0.05
- TTS (AI response): ~$0.02

Total: **~$0.05 per battle**

## 🐛 Troubleshooting

**Microphone not working?**
- Ensure you've granted microphone permissions
- Try HTTPS (required for mic access on most browsers)
- Check browser compatibility (Chrome, Firefox, Edge recommended)

**API errors?**
- Verify your OpenAI API key is correct in `.env.local`
- Check your OpenAI account has credits
- Ensure you're using a paid OpenAI account (Whisper, GPT-4, TTS require it)

**Slow responses?**
- GPT-4 can take 5-10 seconds to generate responses
- Consider using GPT-3.5-turbo for faster (but less creative) responses

## 📝 License

MIT - Feel free to use and modify!

## 🎤 Have Fun!

Drop some bars and show that AI who's boss! 🔥
