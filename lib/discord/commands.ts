import { generate as generateImage } from '@/lib/generate/image_qwen-image'
import { generate as generateVideo } from '@/lib/generate/video_wan2-2'
import { checkUser } from '@/lib/user'

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

const activeOperations = new Set<Promise<void>>();

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
- **Inference Providers**: fal.ai, Replicate
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
- **Bot Developers**: @e.mjjkk, @burnyaaaa
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
                  url: "https://github.com/emjjkk/dreamweaver", // Replace with your docs/repo
                },
                {
                  type: 2, // BUTTON
                  style: 5, // LINK style
                  label: "🐛 Report Issues",
                  url: "https://github.com/emjjkk/dreamweaver/issues", // Replace with your issues page
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

    console.log('[HANDLER] Dream command received')

    if (!prompt) {
      return new Response(
        JSON.stringify({
          type: 4,
          data: {
            content: '❌ Please provide a prompt for image generation.',
            flags: 64,
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('[HANDLER] Sending deferred response immediately')

    // Send deferred response
    const deferredResponse = fetch(
      `https://discord.com/api/v10/interactions/${interactionId}/${interactionToken}/callback`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 5 }), // DEFERRED_RESPONSE
      }
    )

    try {
      await deferredResponse
      console.log('[HANDLER] Deferred response sent, now checking credits...')

      // 🔑 Check user credits (deduct 5)
      const hasCredits = await checkUser(userId!, 5)

      if (!hasCredits) {
        console.log('[HANDLER] User is out of credits, sending response...')
        const webhookUrl = `https://discord.com/api/v10/webhooks/${APP_ID}/${interactionToken}/messages/@original`

        await fetch(webhookUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [
              {
                title: 'Out of Credits 😰',
                description: 'You ran out of credits :shaking_face:',
                color: 0xff0000,
              },
            ],
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 5, // Link button
                    label: '💳 Buy Credits',
                    url: 'https://dreamweaverdiscord.vercel.app/buy-credits',
                  },
                ],
              },
            ],
          }),
        })

        return new Response('User out of credits', { status: 200 })
      }

      // ✅ User has credits, generate image
      console.log('[HANDLER] Generating image...')
      const result = await generateImage(prompt, userId!, style)

      if (!result) {
        throw new Error('Image generation returned null')
      }

      console.log('[HANDLER] Image generated, sending to Discord')

      const embedTitle = style
        ? `Here's your ${style.replace('_', ' ')} style image`
        : `Here's your image`

      const webhookUrl = `https://discord.com/api/v10/webhooks/${APP_ID}/${interactionToken}/messages/@original`

      const webhookResponse = await fetch(webhookUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `<@${userId}> Your image is ready!`,
          embeds: [
            {
              title: `${embedTitle}: ${prompt.substring(0, 100)}`,
              image: { url: result },
              color: 0x00ff00,
              footer: style
                ? {
                  text: `Style: ${style
                    .replace('_', ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}`,
                }
                : { text: 'Generated by Dreamweaver' },
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 5,
                  label: 'Download Image',
                  url: result,
                },
              ],
            },
          ],
        }),
      })

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text()
        console.error(
          '[HANDLER] Webhook failed:',
          webhookResponse.status,
          errorText
        )
        throw new Error(`Webhook failed: ${webhookResponse.status}`)
      }

      console.log('[HANDLER] SUCCESS! Image sent to Discord')
      return new Response('OK', { status: 200 })
    } catch (error) {
      console.error('[HANDLER] Error occurred:', error)

      // Send error message to Discord
      try {
        const errorWebhookUrl = `https://discord.com/api/v10/webhooks/${APP_ID}/${interactionToken}/messages/@original`
        await fetch(errorWebhookUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `<@${userId}> ❌ Failed to generate image. Error: ${error instanceof Error ? error.message : 'Unknown error'
              }`,
          }),
        })
      } catch (webhookError) {
        console.error('[HANDLER] Failed to send error message:', webhookError)
      }

      return new Response('Error handled', { status: 200 })
    }
  }

  return new Response('Unknown command', { status: 400 })
}
