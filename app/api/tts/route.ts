import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    // If no ElevenLabs key, return empty response (skip TTS)
    if (!process.env.ELEVENLABS_API_KEY) {
      console.log('No ElevenLabs API key, skipping TTS')
      return new NextResponse(null, { status: 204 })
    }

    // Use ElevenLabs free tier for TTS with turbo v2.5 model
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!response.ok) {
      console.error('ElevenLabs error:', response.status, await response.text())
      // Don't fail the whole request, just skip TTS
      return new NextResponse(null, { status: 204 })
    }

    const audioBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(audioBuffer)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('TTS error:', error)
    // Don't fail the request, just skip TTS
    return new NextResponse(null, { status: 204 })
  }
}
