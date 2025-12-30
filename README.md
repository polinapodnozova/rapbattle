# 🎤 AI Rap Battle Game

An addictive rap battle game where you rap against an AI opponent using your voice! The game uses Groq's Whisper for speech recognition, Llama 3.1 70B for generating creative rap responses, and ElevenLabs for AI voice output.

## 🎮 Features

- **Voice Input**: Rap into your microphone (up to 30 seconds)
- **Speech-to-Text**: Powered by Groq's Whisper API
- **AI Opponent**: Llama 3.1 70B generates creative, contextual rap responses
- **Text-to-Speech**: ElevenLabs AI performs its rap back to you
- **Scoring System**: Automatic scoring based on lyrics quality
- **Random Topics**: Get different battle topics each round
- **Beautiful UI**: Animated, responsive design with visual effects

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Groq API key ([Get one here](https://console.groq.com/keys)) - **FREE!**
- ElevenLabs API key ([Get one here](https://elevenlabs.io)) - Optional, for voice output
- Microphone access in your browser

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**

Copy the example file and add your API keys:
```bash
copy .env.local.example .env.local
```

Edit `.env.local` and add your keys:
```
GROQ_API_KEY=gsk_your-groq-key-here
ELEVENLABS_API_KEY=your-elevenlabs-key-here
```

**Note**: ElevenLabs is optional. Leave it empty if you don't want voice output.

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
  - Groq Whisper (Speech-to-Text) - FREE!
  - Groq Llama 3.1 70B (Rap generation) - FREE!
  - ElevenLabs TTS (Text-to-Speech) - Free tier available

## 📁 Project Structure

```
rapbattle/
├── app/
│   ├── api/
│   │   ├── transcribe/    # Groq Whisper STT endpoint
│   │   ├── battle/        # Llama 3.1 70B rap generation
│   │   └── tts/           # ElevenLabs TTS
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
- Groq's Whisper API handles audio transcription
- Supports various audio formats
- Accurate even with background noise
- Lightning fast inference

### AI Battle Logic
- Llama 3.1 70B analyzes your lyrics and the topic
- Generates contextual, creative responses
- Maintains competitive but playful tone
- Super fast response times with Groq

### Scoring System
- Word count (optimal: 20-200 words)
- Line count (more structure = higher score)
- Vocabulary variety
- Energy/enthusiasm indicators
- Random variation for unpredictability

### Text-to-Speech
- Uses ElevenLabs for natural-sounding voice
- Plays automatically after AI response
- Skip option available
- Optional (can be disabled)

## 🎨 Customization Ideas

- Add more voices for different AI personalities
- Implement difficulty levels
- Add beat/background music
- Save and share battles
- Multiplayer mode
- More sophisticated scoring with rhyme scheme detection
- Leaderboard system

## 💰 API Costs

**Groq is FREE!** 🎉

Groq free tier includes:
- 14,400 requests per day
- Whisper transcription - FREE
- Llama 3.1 70B - FREE

ElevenLabs:
- 10,000 characters/month free
- ~$0.00 for moderate use

Total: **FREE for demos and light usage!**

## 🐛 Troubleshooting

**Microphone not working?**
- Ensure you've granted microphone permissions
- Try HTTPS (required for mic access on most browsers)
- Check browser compatibility (Chrome, Firefox, Edge recommended)

**API errors?**
- Verify your Groq API key is correct in `.env.local`
- Check your Groq account is active at [console.groq.com](https://console.groq.com)
- ElevenLabs key is optional - app works without voice

**Slow responses?**
- Groq is super fast! Most responses in 1-2 seconds
- If slow, check your internet connection

## 📝 License

MIT - Feel free to use and modify!

## 🎤 Have Fun!

Drop some bars and show that AI who's boss! 🔥
