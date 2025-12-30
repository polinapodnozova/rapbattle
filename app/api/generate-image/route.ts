import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { topic, userSide } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { error: 'Missing topic' },
        { status: 400 }
      )
    }

    // Generate an epic rap battle themed image
    const prompt = `Epic rap battle scene featuring ${topic}. Vibrant hip-hop aesthetic with graffiti style, bold colors (purple, pink, gold), microphones, spotlights, urban street art vibe. Abstract and stylized, energetic atmosphere. No text or words in the image.`

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    })

    const imageUrl = response.data[0]?.url

    if (!imageUrl) {
      throw new Error('No image URL returned')
    }

    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image', details: error.message },
      { status: 500 }
    )
  }
}
