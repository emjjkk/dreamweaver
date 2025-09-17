import { generate as generateImage } from '@/lib/generate/image_qwen-image'
import { generate as generateVideo } from '@/lib/generate/video_wan2-2'
import type {
  APIChatInputApplicationCommandInteraction,
  APIApplicationCommandInteractionDataStringOption
} from 'discord-api-types/v10'

function getStringOption(
  options?: APIChatInputApplicationCommandInteraction['data']['options'],
  name?: string
): string | undefined {
  if (!options) return undefined

  const opt = options.find(
    (o): o is APIApplicationCommandInteractionDataStringOption => o.type === 3 && (!name || o.name === name)
  )
  return opt?.value
}

const BOT_TOKEN = process.env.NEXT_PUBLIC_DISCORD_TOKEN
const APP_ID = process.env.NEXT_PUBLIC_DISCORD_APPLICATION_ID

export async function handleCommand(interaction: APIChatInputApplicationCommandInteraction) {
  const { name } = interaction.data
  const { id: interactionId, token: interactionToken, member } = interaction
  const userId = interaction.member?.user?.id || interaction.user?.id

  if (name === 'ping') {
    return new Response(
      JSON.stringify({
        type: 4,
        data: {
          content: '✅ Dreamweaver is online',
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (name === 'dream_image') {
    const prompt = getStringOption(interaction.data.options, 'prompt')
    console.log('[status] Command received...', { prompt, userId })
    
    // Return deferred response immediately
    const deferResponse = new Response(
      JSON.stringify({ type: 5 }), // DEFERRED_RESPONSE
      { headers: { 'Content-Type': 'application/json' } }
    )

    // Handle the async operation without blocking the response
    Promise.resolve().then(async () => {
      try {
        console.log('[status] Starting image generation...')
        
        if (!prompt) {
          throw new Error('No prompt provided')
        }
        
        console.log('[status] Calling generateImage function...')
        const result = await generateImage(prompt, userId)
        console.log('[status] Image generated successfully:', result)
        console.log('[DEBUG] APP_ID:', APP_ID)
        console.log('[DEBUG] interactionToken length:', interactionToken.length)
        
        // Try using the /messages/@original endpoint for deferred responses
        const webhookUrl = `https://discord.com/api/v10/webhooks/${APP_ID}/${interactionToken}/messages/@original`
        console.log('[DEBUG] Webhook URL:', webhookUrl)

        const webhookResponse = await fetch(webhookUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: `<@${userId}> Your image is ready!`,
            embeds: [
              {
                title: `Here's your image: ${prompt}`,
                image: { url: result },
                color: 0x00ff00,
              },
            ],
          }),
        })
        
        console.log('[status] Discord webhook response status:', webhookResponse.status)
        
        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text()
          console.error('[ERROR] Discord webhook failed:', errorText)
          throw new Error(`Discord webhook failed: ${webhookResponse.status} - ${errorText}`)
        }
        
        console.log('[status] Discord message sent successfully')
      } catch (err) {
        console.error('[ERROR] Image generation failed:', err)
        await fetch(`https://discord.com/api/v10/webhooks/${APP_ID}/${interactionToken}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `<@${userId}> ❌ Failed to generate image. Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          }),
        })
      }
    })

    return deferResponse
  }

  if (name === 'dream_video') {
    const prompt = getStringOption(interaction.data.options, 'prompt')
    console.log('[status] Video command received...', { prompt, userId })

    const deferResponse = new Response(
      JSON.stringify({ type: 5 }), // DEFERRED_RESPONSE
      { headers: { 'Content-Type': 'application/json' } }
    )

    Promise.resolve().then(async () => {
      try {
        console.log('[status] Starting video generation...')
        
        if (!prompt) {
          throw new Error('No prompt provided')
        }

        const result = await generateVideo(prompt, userId)
        console.log('[status] Video generated successfully:', result)
        console.log('[DEBUG] APP_ID:', APP_ID)
        console.log('[DEBUG] interactionToken length:', interactionToken.length)
        
        // Try using the /messages/@original endpoint for deferred responses
        const webhookUrl = `https://discord.com/api/v10/webhooks/${APP_ID}/${interactionToken}/messages/@original`
        console.log('[DEBUG] Webhook URL:', webhookUrl)

        const webhookResponse = await fetch(webhookUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: `<@${userId}> Your Video is ready! ${result}`,
            embeds: [
              {
                title: `Here's your video: ${prompt}`,
                description: 'Click the link above to view your generated video.',
                color: 0x00ff00,
              },
            ],
          }),
        })
        
        console.log('[status] Discord webhook response status:', webhookResponse.status)
        
        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text()
          console.error('[ERROR] Discord webhook failed:', errorText)
          throw new Error(`Discord webhook failed: ${webhookResponse.status} - ${errorText}`)
        }
        
        console.log('[status] Discord message sent successfully')
      } catch (err) {
        console.error('[ERROR] Video generation failed:', err)
        await fetch(`https://discord.com/api/v10/webhooks/${APP_ID}/${interactionToken}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `<@${userId}> ❌ Failed to generate video. Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          }),
        })
      }
    })

    return deferResponse
  }

  return new Response('Unknown command', { status: 400 })
}