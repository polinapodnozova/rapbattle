import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { userLyrics, topic, roundNumber = 1, userSide = '', battleHistory = [], difficulty = 'medium' } = await request.json()

    if (!userLyrics || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Adjust difficulty based on player choice
    let adjustedRound = roundNumber
    if (difficulty === 'easy') {
      // Easy: Starts at 1-2, improves very slowly (0.5 per round)
      adjustedRound = 1 + Math.floor(roundNumber * 0.5)
    } else if (difficulty === 'medium') {
      // Medium: Starts at 3-4, improves normally (1 per round)
      adjustedRound = 3 + (roundNumber - 1)
    } else if (difficulty === 'hard') {
      // Hard: Starts at 8-9, improves fast (1.5 per round)
      adjustedRound = 8 + Math.floor((roundNumber - 1) * 1.5)
    }

    // Determine AI difficulty based on adjusted round number
    const aiLevel = Math.min(adjustedRound, 15) // Cap at level 15
    
    let systemPrompt = ''
    let temperature = 0.9
    
    if (aiLevel <= 5) {
      systemPrompt = `You are HORRIBLE at rap - like a 5 year old trying. Responding to "${userSide}" on "${topic}". Write ONLY 2 lines. DO NOT RHYME AT ALL. Just say two random things that have nothing to do with each other. Make spelling mistakes and typos (like "u" instead of "you", "ur" instead of "your", "gud" instead of "good"). Like: "i lik pizza its gud / bugers r ok 2". Make it painfully bad.`
      temperature = 1.4
    } else if (aiLevel <= 8) {
      systemPrompt = `You're TERRIBLE at rapping. Responding to "${userSide}" on "${topic}". Write 2-3 lines. Try to rhyme but FAIL COMPLETELY - use words that DON'T rhyme at all (like "cat/dog" or "sun/car" - completely different sounds). Include typos and bad spelling. Say really dumb stuff.`
      temperature = 1.3
    } else if (aiLevel <= 10) {
      systemPrompt = `You're still really bad. Responding to "${userSide}" on "${topic}". Write 3 lines. Words almost rhyme but not really (like "cat/cap" or "moon/spoon" but say them wrong). Include 1-2 typos. Say obvious things.`
      temperature = 1.2
    } else if (aiLevel <= 12) {
      systemPrompt = `You're bad but slightly improving. Responding to "${userSide}" on "${topic}". Write 3-4 lines. Use the most basic rhymes (cat/hat, day/say). Maybe include a small typo. Say simple obvious things. Still not good.`
      temperature = 1.1
    } else if (aiLevel === 13) {
      systemPrompt = `You're a beginner rapper. Responding to "${userSide}" on "${topic}". Write 4-5 lines. Use basic rhymes that actually work. Flow is choppy. No typos now. Getting better but still amateur.`
      temperature = 1.0
    } else if (aiLevel === 14) {
      systemPrompt = `You're improving and becoming decent. Responding to "${userSide}" on "${topic}". Write 5-8 lines. Use okay rhymes with some wordplay attempts. Flow is better. Becoming a challenge.`
      temperature = 0.95
    } else {
      systemPrompt = `You're a good battle rapper now. Responding to "${userSide}" on "${topic}". Write 8-12 bars. Use clever wordplay, metaphors, and solid rhymes. You're tough to beat.`
      temperature = 0.9
    }

    // Build context from history
    let contextMessage = `Topic: ${topic}\nYour opponent is defending: ${userSide}\n\n`
    
    if (battleHistory.length > 0) {
      contextMessage += `Previous rounds:\n`
      battleHistory.slice(-2).forEach((round: any, idx: number) => {
        contextMessage += `\nRound ${battleHistory.length - 1 + idx}:\nThem: "${round.userLyrics}"\nYou: "${round.aiLyrics}"\n`
      })
      contextMessage += `\n---\n\n`
    }
    
    contextMessage += `Current round ${roundNumber}:\nThey just said:\n"${userLyrics}"\n\nNow you respond! Reference what they said if you can. Keep the conversation going.`

    // Generate AI rap response
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: contextMessage
        }
      ],
      temperature: temperature,
      max_tokens: 300,
    })

    const aiLyrics = completion.choices[0]?.message?.content || "Yo, I'm speechless, you got me this time!"

    // Clean up the lyrics to ensure proper line breaks
    const cleanedLyrics = aiLyrics
      .replace(/\s*\/\s*/g, '\n')  // Replace slashes with line breaks
      .replace(/\n{3,}/g, '\n\n')  // Remove excessive line breaks
      .trim()

    // Score the battle
    const userScore = scoreRap(userLyrics, true) // Give user advantage
    const aiScore = scoreRap(cleanedLyrics, false)

    return NextResponse.json({
      userLyrics,
      aiLyrics: cleanedLyrics,
      userScore,
      aiScore,
    })
  } catch (error: any) {
    console.error('Battle error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate battle response' },
      { status: 500 }
    )
  }
}

function scoreRap(lyrics: string, isUser: boolean = false): number {
  let score = 50 // Base score

  // User gets a home court advantage!
  if (isUser) {
    score += 8
  }

  // Severe penalty for lazy short responses
  const wordCount = lyrics.split(/\s+/).filter(w => w.length > 0).length
  if (wordCount < 5) {
    score -= 30 // Major penalty for under 5 words
  } else if (wordCount < 10) {
    score -= 15 // Penalty for under 10 words
  } else if (wordCount >= 20 && wordCount <= 200) {
    score += 10 // Bonus for good length
  }

  // Rhyming bonus (simple check for common rhyme patterns)
  const lines = lyrics.split(/[.!?\n]+/).filter(l => l.trim())
  if (lines.length >= 4) {
    score += 15
  }

  // Variety of words bonus
  const uniqueWords = new Set(lyrics.toLowerCase().match(/\b\w+\b/g) || [])
  if (uniqueWords.size > 20) {
    score += 10
  } else if (uniqueWords.size < 3) {
    score -= 10 // Penalty for no variety
  }

  // Enthusiasm bonus (exclamation marks, energy)
  const exclamations = (lyrics.match(/!/g) || []).length
  score += Math.min(exclamations * 2, 10)

  // Random variation to make it interesting
  // User gets wider range, AI gets slightly narrower range
  if (isUser) {
    score += Math.floor(Math.random() * 20) // 0-19 points
  } else {
    score += Math.floor(Math.random() * 12) // 0-11 points
  }

  return Math.min(Math.max(score, 20), 100)
}
