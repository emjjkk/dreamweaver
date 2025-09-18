import { generate as generateImage } from '@/lib/generate/image_qwen-image'
import { generate as generateVideo } from '@/lib/generate/video_wan2-2'
import { supabase } from '@/lib/supabase/bot'
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



  if (name === 'info') {
    return new Response(
      JSON.stringify({
        type: 4,
        data: {
          embeds: [
            {
              title: "Dreamweaver Bot Information",
              description: `**Dreamweaver** is an AI-powered Discord bot that brings your imagination to life through advanced AI generation capabilities.

Website: https://dreamweaverdiscord.vercel.app
Official Discord: https://discord.gg/xTQ4WRNqyJ

### What It Does
- Generate stunning images from text prompts
- Create videos from descriptions *(coming soon)*
- Support multiple artistic styles and customizations

### AI Models & Technology
- **Image Generation**: Qwen-Image AI Model
- **Framework**: Next.js TypeScript
- **Database**: Supabase
- **API**: Discord.js v14
- **Runtime**: Node.js
- **Language**: TypeScript
- **Hosting**: Vercel Edge
- **Storage**: Cloud-based asset management

### Commands
- \`/dream\` - Generate images from text prompts
- \`/ping\` - Check bot status
- \`/info\` - View this information

### Usage
Simply use \`/dream [your prompt]\` to generate amazing AI artwork!

### Credits
- **Bot Developers**: @e.mjjkk, @burnyaaa
- **Qwen-Image Model https://huggingface.co/Qwen/Qwen-Image** : Chenfei Wu, Jiahao Li, Jingren Zhou, Junyang Lin, Kaiyuan Gao, Kun Yan, Sheng-ming Yin, Shuai Bai, Xiao Xu, Yilei Chen, Yuxiang Chen, Zecheng Tang, Zekai Zhang, Zhengyi Wang, An Yang, Bowen Yu, Chen Cheng, Dayiheng Liu, Deqing Li, Hang Zhang, Hao Meng, Hu Wei, Jingyuan Ni, Kai Chen, Kuan Cao, Liang Peng, Lin Qu, Minggang Wu, Peng Wang, Shuting Yu, Tingkun Wen, Wensen Feng, Xiaoxiao Xu, Yi Wang, Yichang Zhang, Yongqiang Zhu, Yujia Wu, Yuxuan Cai, Zenan Liu

`,
              color: 0xffffff, // Discord blurple color
              footer: {
                text: "Dreamweaver Bot • Powered by Qwen Image",
              },
              timestamp: new Date().toISOString()
            }
          ],
          components: [
            {
              type: 1, // ACTION_ROW
              components: [
                {
                  type: 2, // BUTTON
                  style: 5, // LINK style
                  label: "📚 Repository",
                  url: "https://github.com/yourusername/dreamweaver", // Replace with your docs/repo
                },
                {
                  type: 2, // BUTTON
                  style: 5, // LINK style
                  label: "🐛 Report Issues",
                  url: "https://github.com/yourusername/dreamweaver/issues", // Replace with your issues page
                }
              ]
            }
          ]
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }


  if (name === 'dream') {
    const prompt = getStringOption(interaction.data.options, 'prompt')
    const style = getStringOption(interaction.data.options, 'style')
    
    console.log('[status] Command received...', { prompt, style, userId })

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

        console.log('[status] Calling generateImage function with style:', style)
        const result = await generateImage(prompt, userId, style)
        console.log('[status] Image generated successfully:', result)
        console.log('[DEBUG] APP_ID:', APP_ID)
        console.log('[DEBUG] interactionToken length:', interactionToken.length)

        // Try using the /messages/@original endpoint for deferred responses
        const webhookUrl = `https://discord.com/api/v10/webhooks/${APP_ID}/${interactionToken}/messages/@original`
        console.log('[DEBUG] Webhook URL:', webhookUrl)

        // Create embed title with style info
        const embedTitle = style 
          ? `Here's your ${style.replace('_', ' ')} style image: ${prompt}`
          : `Here's your image: ${prompt}`

        const webhookResponse = await fetch(webhookUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: `<@${userId}> Your image is ready!`,
            embeds: [
              {
                title: embedTitle,
                image: { url: result },
                color: 0xffffff,
                footer: style ? { text: `Style: ${style.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}` } : undefined,
              },
            ],
            components: [
              {
                type: 1, // ACTION_ROW
                components: [
                  {
                    type: 2, // BUTTON
                    style: 5, // LINK style
                    label: '📥 Download Image',
                    url: result,
                  },
                ],
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

  {/* 
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
            content: `<@${userId}> Your video is ready!`,
            embeds: [
              {
                title: `Here's your video: ${prompt}`,
                description: `Click the link to view your generated video. ${result}`,
                color: 0xff0000,
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
  */}

  return new Response('Unknown command', { status: 400 })
}