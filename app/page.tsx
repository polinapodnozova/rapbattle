'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './page.module.css'

type GameState = 'intro' | 'recording' | 'processing' | 'ai-response' | 'results'
type Difficulty = 'easy' | 'medium' | 'hard'

interface Battle {
  userLyrics: string
  aiLyrics: string
  userScore: number
  aiScore: number
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('intro')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [topic, setTopic] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [battle, setBattle] = useState<Battle | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlayingAI, setIsPlayingAI] = useState(false)
  const [inputMode, setInputMode] = useState<'voice' | 'type'>('voice')
  const [typedLyrics, setTypedLyrics] = useState('')
  const [userSide, setUserSide] = useState('')
  const [roundNumber, setRoundNumber] = useState(1)
  const [battleHistory, setBattleHistory] = useState<Array<{userLyrics: string, aiLyrics: string, userScore: number, aiScore: number}>>([])
  const [battleImage, setBattleImage] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const topics = [
    { topic: 'Pizza vs Burgers', sides: ['Pizza', 'Burgers'] },
    { topic: 'Cats vs Dogs', sides: ['Cats', 'Dogs'] },
    { topic: 'Winter vs Summer', sides: ['Winter', 'Summer'] },
    { topic: 'Coffee vs Tea', sides: ['Coffee', 'Tea'] },
    { topic: 'Movies vs Books', sides: ['Movies', 'Books'] },
    { topic: 'Day vs Night', sides: ['Day', 'Night'] },
    { topic: 'Beach vs Mountains', sides: ['Beach', 'Mountains'] },
    { topic: 'City Life vs Country Life', sides: ['City Life', 'Country Life'] },
    { topic: 'Early Bird vs Night Owl', sides: ['Early Bird', 'Night Owl'] },
    { topic: 'Android vs iPhone', sides: ['Android', 'iPhone'] },
    { topic: 'Chocolate vs Vanilla', sides: ['Chocolate', 'Vanilla'] },
    { topic: 'Video Games vs Sports', sides: ['Video Games', 'Sports'] },
    { topic: 'Aliens Exist vs No Aliens', sides: ['Aliens Exist', 'No Aliens'] },
    { topic: 'Pancakes vs Waffles', sides: ['Pancakes', 'Waffles'] },
    { topic: 'Superheroes vs Villains', sides: ['Superheroes', 'Villains'] },
    { topic: 'AI Taking Jobs vs AI Creating Jobs', sides: ['AI Helps Us', 'AI Threatens Us'] },
    { topic: 'Online Shopping vs In-Store Shopping', sides: ['Online Shopping', 'In-Store Shopping'] },
    { topic: 'Pineapple on Pizza', sides: ['Yes Pineapple', 'No Pineapple'] }
  ]

  const startGame = async () => {
    const randomTopicData = topics[Math.floor(Math.random() * topics.length)]
    const randomSide = randomTopicData.sides[Math.floor(Math.random() * 2)]
    setTopic(randomTopicData.topic)
    setUserSide(randomSide)
    setRoundNumber(1)
    setBattleHistory([])
    setBattle(null)
    setAudioUrl(null)
    setTypedLyrics('')
    
    // Generate battle image
    setIsGeneratingImage(true)
    setGameState('recording')
    
    try {
      console.log('Generating image for topic:', randomTopicData.topic)
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: randomTopicData.topic, userSide: randomSide }),
      })
      
      if (imageResponse.ok) {
        const { imageUrl } = await imageResponse.json()
        console.log('Image generated:', imageUrl)
        setBattleImage(imageUrl)
      } else {
        console.error('Image generation failed:', await imageResponse.text())
      }
    } catch (error) {
      console.error('Failed to generate image:', error)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const nextRound = () => {
    setRoundNumber(prev => prev + 1)
    setGameState('recording')
    setBattle(null)
    setAudioUrl(null)
    setTypedLyrics('')
  }

  const resetGame = () => {
    setRoundNumber(1)
    setGameState('intro')
    setBattleImage(null)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            stopRecording()
            return 30
          }
          return prev + 1
        })
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please ensure you have granted permission.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setGameState('processing')
    
    try {
      // Convert audio to text using Whisper
      const formData = new FormData()
      formData.append('audio', audioBlob)
      
      const transcriptResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })
      
      const { text: userLyrics } = await transcriptResponse.json()
      
      await processBattle(userLyrics)
      
    } catch (error) {
      console.error('Error processing battle:', error)
      alert('Error processing your rap. Please try again.')
      setGameState('recording')
    }
  }

  const processTypedLyrics = async () => {
    if (!typedLyrics.trim()) {
      alert('Please type your rap first!')
      return
    }
    await processBattle(typedLyrics)
  }

  const processBattle = async (userLyrics: string) => {
    setGameState('processing')
    
    try {
      // Get AI response
      const battleResponse = await fetch('/api/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userLyrics, topic, roundNumber, userSide, battleHistory, difficulty }),
      })
      
      const battleData = await battleResponse.json()
      
      // Add to history
      setBattleHistory(prev => [...prev, battleData])
      
      setGameState('ai-response')
      setBattle(battleData)
      
      // Try to generate AI speech (optional - skip if no credits)
      try {
        const ttsResponse = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: battleData.aiLyrics }),
        })
        
        if (ttsResponse.ok) {
          const audioBlob2 = await ttsResponse.blob()
          const url = URL.createObjectURL(audioBlob2)
          setAudioUrl(url)
          
          // Auto-play AI response
          setTimeout(() => {
            playAIResponse(url)
          }, 500)
        } else {
          console.log('TTS unavailable - showing text only')
          // Auto-advance after 5 seconds if no audio
          setTimeout(() => {
            setGameState('results')
          }, 5000)
        }
      } catch (e) {
        console.log('TTS error - showing text only')
        // Auto-advance after 5 seconds if no audio
        setTimeout(() => {
          setGameState('results')
        }, 5000)
      }
      
    } catch (error) {
      console.error('Error processing battle:', error)
      alert('Error processing your rap. Please try again.')
      setGameState('recording')
    }
  }

  const playAIResponse = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    
    const audio = new Audio(url)
    audioRef.current = audio
    setIsPlayingAI(true)
    
    audio.onended = () => {
      setIsPlayingAI(false)
      setGameState('results')
    }
    
    audio.onerror = (e) => {
      console.error('Audio playback error:', e)
      setIsPlayingAI(false)
    }
    
    audio.play().catch(err => {
      console.error('Autoplay prevented:', err)
      setIsPlayingAI(false)
      alert('Click the "PLAY AI RAP" button to hear the AI response!')
    })
  }

  const replayAI = () => {
    if (audioUrl) {
      playAIResponse(audioUrl)
    }
  }

  const skipToResults = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlayingAI(false)
    }
    setGameState('results')
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>🎤 AI RAP BATTLE 🎤</h1>
        
        {roundNumber > 1 && (
          <div className={styles.roundCounter}>
            Round {roundNumber} 🔥
          </div>
        )}
        
        {gameState === 'intro' && (
          <div className={styles.intro}>
            <p className={styles.subtitle}>
              Think you can out-rap an AI? Let's find out!
            </p>
            <p className={styles.instructions}>
              You'll get a topic, rap your verse (voice or text), and the AI will respond.
              <br />
              May the best MC win! 🔥
            </p>
            
            <div className={styles.difficultySelector}>
              <h3>Choose Your Difficulty:</h3>
              <div className={styles.difficultyButtons}>
                <button 
                  className={`${styles.difficultyButton} ${difficulty === 'easy' ? styles.selected : ''}`}
                  onClick={() => setDifficulty('easy')}
                >
                  <div className={styles.difficultyEmoji}>😊</div>
                  <div className={styles.difficultyName}>EASY</div>
                  <div className={styles.difficultyDesc}>AI stays weak</div>
                </button>
                <button 
                  className={`${styles.difficultyButton} ${difficulty === 'medium' ? styles.selected : ''}`}
                  onClick={() => setDifficulty('medium')}
                >
                  <div className={styles.difficultyEmoji}>😎</div>
                  <div className={styles.difficultyName}>MEDIUM</div>
                  <div className={styles.difficultyDesc}>AI gets better</div>
                </button>
                <button 
                  className={`${styles.difficultyButton} ${difficulty === 'hard' ? styles.selected : ''}`}
                  onClick={() => setDifficulty('hard')}
                >
                  <div className={styles.difficultyEmoji}>🔥</div>
                  <div className={styles.difficultyName}>HARD</div>
                  <div className={styles.difficultyDesc}>AI is tough!</div>
                </button>
              </div>
            </div>
            
            <button className={styles.primaryButton} onClick={startGame}>
              START BATTLE
            </button>
          </div>
        )}

        {gameState === 'recording' && (
          <div className={styles.recording}>
            {battleImage && (
              <div className={styles.battleImageContainer}>
                <img 
                  src={battleImage} 
                  alt="Battle scene" 
                  className={styles.battleImage}
                />
                <div className={styles.imageOverlay}></div>
              </div>
            )}
            
            {isGeneratingImage && (
              <div className={styles.imageLoading}>
                <div className={styles.spinner}></div>
                <p>Generating epic battle scene...</p>
              </div>
            )}
            
            <div className={styles.topicCard}>
              <h2>Your Topic:</h2>
              <h3 className={styles.topic}>{topic}</h3>
              <div className={styles.sideAssignment}>
                🎯 <strong>You're defending: {userSide}</strong>
              </div>
            </div>

            <div className={styles.inputModeToggle}>
              <button 
                className={inputMode === 'voice' ? styles.toggleActive : styles.toggleInactive}
                onClick={() => setInputMode('voice')}
              >
                🎤 Voice
              </button>
              <button 
                className={inputMode === 'type' ? styles.toggleActive : styles.toggleInactive}
                onClick={() => setInputMode('type')}
              >
                ⌨️ Type
              </button>
            </div>

            {inputMode === 'voice' ? (
              <>
                <div className={styles.recordingControls}>
                  {!isRecording ? (
                    <button 
                      className={styles.recordButton}
                      onClick={startRecording}
                    >
                      <span className={styles.micIcon}>🎤</span>
                      START RAPPING
                    </button>
                  ) : (
                    <div className={styles.recordingActive}>
                      <div className={styles.recordingIndicator}>
                        <div className={styles.pulseRing}></div>
                        <span className={styles.recordingDot}></span>
                        RECORDING...
                      </div>
                      <div className={styles.timer}>{recordingTime}s / 30s</div>
                      <button 
                        className={styles.stopButton}
                        onClick={stopRecording}
                      >
                        STOP
                      </button>
                    </div>
                  )}
                </div>
                
                <p className={styles.hint}>
                  💡 You have up to 30 seconds. Make it count!
                </p>
              </>
            ) : (
              <div className={styles.typeControls}>
                <textarea
                  className={styles.lyricsInput}
                  value={typedLyrics}
                  onChange={(e) => setTypedLyrics(e.target.value)}
                  placeholder="Type your rap verse here... 
🔥 Drop some bars about the topic!
Make it rhyme, make it shine!"
                  rows={8}
                  maxLength={1000}
                />
                <div className={styles.charCount}>
                  {typedLyrics.length} / 1000 characters
                </div>
                <button 
                  className={styles.submitButton}
                  onClick={processTypedLyrics}
                  disabled={!typedLyrics.trim()}
                >
                  SUBMIT RAP
                </button>
                <p className={styles.hint}>
                  ✍️ Write your best verse and hit submit!
                </p>
              </div>
            )}
          </div>
        )}

        {gameState === 'processing' && (
          <div className={styles.processing}>
            <div className={styles.loader}></div>
            <h2>AI is preparing its response...</h2>
            <p>Analyzing your bars... 🔥</p>
          </div>
        )}

        {gameState === 'ai-response' && battle && (
          <div className={styles.aiResponse}>
            <h2 className={styles.responseTitle}>AI's Turn! 🤖</h2>
            <div className={styles.lyricsBox}>
              <p className={styles.lyrics}>{battle.aiLyrics}</p>
            </div>
            {isPlayingAI ? (
              <div className={styles.audioVisualizer}>
                <div className={styles.soundWave}></div>
                <div className={styles.soundWave}></div>
                <div className={styles.soundWave}></div>
                <div className={styles.soundWave}></div>
              </div>
            ) : (
              <button 
                className={styles.primaryButton}
                onClick={replayAI}
                style={{ marginBottom: '1rem' }}
              >
                🔊 PLAY AI RAP
              </button>
            )}
            <button 
              className={styles.secondaryButton}
              onClick={skipToResults}
            >
              SKIP TO RESULTS
            </button>
          </div>
        )}

        {gameState === 'results' && battle && (
          <div className={styles.results}>
            <h2 className={styles.resultsTitle}>BATTLE RESULTS</h2>
            
            <div className={styles.scoresContainer}>
              <div className={styles.scoreCard}>
                <h3>YOU</h3>
                <div className={styles.score}>{battle.userScore}</div>
                <div className={styles.lyricsPreview}>
                  "{battle.userLyrics?.slice(0, 100) || battle.userLyrics}..."
                </div>
              </div>
              
              <div className={styles.vs}>VS</div>
              
              <div className={styles.scoreCard}>
                <h3>AI</h3>
                <div className={styles.score}>{battle.aiScore}</div>
                <div className={styles.lyricsPreview}>
                  "{battle.aiLyrics?.slice(0, 100) || battle.aiLyrics}..."
                </div>
              </div>
            </div>
            
            <div className={styles.winner}>
              {battle.userScore > battle.aiScore ? (
                <>
                  <h2 className={styles.winnerText}>🏆 YOU WIN THIS ROUND! 🏆</h2>
                  <p className={styles.winnerSubtext}>But the AI is getting stronger...</p>
                </>
              ) : battle.userScore < battle.aiScore ? (
                <>
                  <h2 className={styles.loserText}>AI WINS THIS ROUND! 🤖</h2>
                  <p className={styles.loserSubtext}>Better step up your game!</p>
                </>
              ) : (
                <h2 className={styles.tieText}>IT'S A TIE! 🤝</h2>
              )}
            </div>
            
            <div className={styles.buttonGroup}>
              <button 
                className={styles.primaryButton}
                onClick={nextRound}
              >
                🔥 NEXT ROUND (Same Topic)
              </button>
              <button 
                className={styles.secondaryButton}
                onClick={resetGame}
              >
                🔄 NEW GAME
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
