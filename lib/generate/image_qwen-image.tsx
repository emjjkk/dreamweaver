import { upload } from '@/lib/upload'
import { InferenceClient } from "@huggingface/inference";

// Style-specific prompt enhancements
const stylePrompts = {
    hyperrealistic: "Photorealistic, ultra-detailed, professional photography, sharp focus, perfect lighting, high resolution, lifelike textures, realistic materials, natural colors, depth of field, DSLR quality",
    pop_art: "Pop art style, bold vibrant colors, high contrast, Ben-Day dots, comic book aesthetic, Andy Warhol inspired, screen printing effect, graphic design, retro 1960s style, saturated colors",
    digital_art: "Digital artwork, smooth gradients, clean lines, modern CGI, digital painting techniques, vector-style elements, contemporary digital aesthetic, polished finish, concept art quality",    
    anime: "Anime style, manga artwork, cel-shaded, vibrant anime colors, expressive eyes, Japanese animation style, clean lineart, studio quality animation, detailed character design, kawaii aesthetic",
    pixel_art: "8-bit pixel art, retro gaming style, pixelated, limited color palette, nostalgic video game aesthetic, sharp pixels, no anti-aliasing, classic arcade game style, chunky pixels",    
    paper_craft: "Paper craft style, layered paper cutouts, handmade texture, origami elements, cardboard aesthetic, craft paper materials, dimensional layers, tactile handcraft feel, DIY aesthetic",  
    watercolor: "Watercolor painting, soft flowing colors, transparent washes, organic paint bleeds, artistic brush strokes, paper texture visible, delicate color transitions, traditional painting medium",    
    pencil_drawing: "Pencil sketch, graphite drawing, hand-drawn lines, sketchy textures, crosshatching, artistic shading, traditional drawing techniques, paper texture, monochromatic tones",  
    renaissance: "Renaissance painting style, classical art techniques, oil painting texture, chiaroscuro lighting, masterful composition, historical art period, rich earth tones, detailed realism, classical beauty"
};

export async function generate(prompt: string, user_id: string, style?: string) {
    // Fix the environment variable inconsistency
    const hfToken = process.env.HF_TOKEN || process.env.HF_TOKEN_2;
    
    console.log('[IMG] Step 1: Environment variables check')
    console.log('[IMG] HF_TOKEN exists:', !!process.env.HF_TOKEN)
    console.log('[IMG] HF_TOKEN_2 exists:', !!process.env.HF_TOKEN_2)
    console.log('[IMG] Using token:', hfToken ? 'found' : 'MISSING')
    console.log('[IMG] Token length:', hfToken?.length)
    console.log('[IMG] Token starts with hf_:', hfToken?.startsWith('hf_'))
    
    if (!hfToken) {
        console.error('[IMG] ERROR: No HF token found')
        throw new Error('Neither HF_TOKEN nor HF_TOKEN_2 environment variable is set')
    }

    if (!hfToken.startsWith('hf_')) {
        console.error('[IMG] ERROR: Invalid HF token format')
        throw new Error('HF_TOKEN must start with "hf_"')
    }

    console.log('[IMG] Step 2: Creating Hugging Face client')
    const client = new InferenceClient(hfToken);

    try {
        // Build enhanced prompt with style
        let enhancedPrompt = `Ultra HD, 4K, cinematic composition. ${prompt}`;
        
        // Add style-specific enhancements if style is provided
        if (style && stylePrompts[style as keyof typeof stylePrompts]) {
            const styleEnhancement = stylePrompts[style as keyof typeof stylePrompts];
            enhancedPrompt = `${enhancedPrompt}. ${styleEnhancement}`;
        }
        
        console.log('[IMG] Step 3: Enhanced prompt created (length:', enhancedPrompt.length, ')')
        console.log('[IMG] Step 4: Style applied:', style || 'none')
        
        console.log('[IMG] Step 5: About to call Hugging Face API...')
        console.log('[IMG] API call parameters:', {
            model: "Qwen/Qwen-Image",
            provider: "fal-ai",
            promptLength: enhancedPrompt.length,
            inference_steps: 8
        })
        
        // Add timeout to the HF API call
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                console.error('[IMG] TIMEOUT: Hugging Face API call timed out after 60 seconds')
                reject(new Error('Hugging Face API call timed out after 60 seconds'))
            }, 60000)
        })
        
        const apiPromise = client.textToImage({
            model: "Qwen/Qwen-Image",
            provider: "fal-ai",
            inputs: enhancedPrompt,
            parameters: { 
                num_inference_steps: 8,
            },
        })
        
        console.log('[IMG] Step 6: Waiting for API response (with 60s timeout)...')
        const imageBlob = await Promise.race([apiPromise, timeoutPromise])
        
        console.log('[IMG] Step 7: API response received!')
        console.log('[IMG] Response type:', typeof imageBlob)
        
        if (!imageBlob) {
            console.error('[IMG] ERROR: API returned null/undefined')
            throw new Error('Hugging Face API returned null or undefined')
        }
        
        
        console.log('[IMG] Step 8: Starting upload process...')
        
        const uploadResult = await upload(user_id, imageBlob, "image");
        
        console.log('[IMG] Step 9: Upload completed')
        console.log('[IMG] Upload result type:', typeof uploadResult)
        console.log('[IMG] Upload result preview:', typeof uploadResult === 'string' ? uploadResult.substring(0, 100) + '...' : uploadResult)
        
        if (!uploadResult) {
            console.error('[IMG] ERROR: Upload returned null/undefined')
            throw new Error('Upload function returned null or undefined')
        }
        
        if (typeof uploadResult !== 'string') {
            console.error('[IMG] ERROR: Upload returned non-string:', typeof uploadResult)
            throw new Error(`Expected string URL from upload, got ${typeof uploadResult}`)
        }
        
        console.log('[IMG] Step 10: SUCCESS! Final URL generated')
        return uploadResult
        
    } catch (error) {
        console.error('[IMG] CRITICAL ERROR occurred:')
        console.error('[IMG] Error type:', typeof error)
        console.error('[IMG] Error instanceof Error:', error instanceof Error)
        console.error('[IMG] Error message:', error instanceof Error ? error.message : String(error))
        console.error('[IMG] Error stack:', error instanceof Error ? error.stack : 'No stack trace available')
        
        // Additional error details for debugging
        if (error && typeof error === 'object') {
            console.error('[IMG] Error object keys:', Object.keys(error))
            console.error('[IMG] Error object:', JSON.stringify(error, null, 2))
        }
        
        throw error
    }
}