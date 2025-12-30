import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Add randomness to get different topics
    const randomSeed = Math.random().toString(36).substring(7)
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a creative debate topic generator. Generate fun, interesting debate topics in EXACTLY this format: "Word1 vs Word2". Both sides MUST be complete words, at least 3 characters each. Examples: "Pizza vs Burgers", "Cats vs Dogs", "Summer vs Winter", "Marvel vs DC", "iPhone vs Android". CRITICAL: Return ONLY the topic in "X vs Y" format with complete words on both sides. No extra text, no explanations.'
        },
        {
          role: 'user',
          content: `Generate ONE random fun debate topic in "X vs Y" format. Make it unique and creative! Random seed: ${randomSeed}`
        }
      ],
      temperature: 1.3,
      max_tokens: 30,
    })

    let topicText = completion.choices[0]?.message?.content?.trim() || 'Pizza vs Burgers'
    
    console.log('Raw AI response:', topicText)
    
    // Clean up the response - remove quotes, extra text, etc.
    topicText = topicText.replace(/["']/g, '').trim()
    
    // Extract the topic in "X vs Y" format (case insensitive)
    const match = topicText.match(/(\w[\w\s]{2,}?)\s+vs\.?\s+(\w[\w\s]{2,})/i)
    
    if (match) {
      const side1 = match[1].trim()
      const side2 = match[2].trim()
      
      console.log('Parsed sides:', side1, 'vs', side2)
      
      // Make sure both sides are at least 3 characters
      if (side1.length >= 3 && side2.length >= 3) {
        return NextResponse.json({ 
          topic: `${side1} vs ${side2}`,
          sides: [side1, side2]
        })
      }
    }
    
    console.log('Failed to parse, using fallback')
    // Fallback
    return NextResponse.json({ 
      topic: 'Pizza vs Burgers',
      sides: ['Pizza', 'Burgers']
    })
  } catch (error: any) {
    console.error('Topic generation error:', error)
    // Return fallback topic
    return NextResponse.json({ 
      topic: 'Coffee vs Tea',
      sides: ['Coffee', 'Tea']
    })
  }
}
