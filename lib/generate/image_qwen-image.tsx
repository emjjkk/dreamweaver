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
    // Debug environment variables
    console.log('[DEBUG] HF_TOKEN exists:', !!process.env.HF_TOKEN_2)
    console.log('[DEBUG] HF_TOKEN length:', process.env.HF_TOKEN_2?.length)
    
    if (!process.env.HF_TOKEN) {
        throw new Error('HF_TOKEN environment variable is not set')
    }

    if (!process.env.HF_TOKEN.startsWith('hf_')) {
        throw new Error('HF_TOKEN must start with "hf_"')
    }

    const client = new InferenceClient(process.env.HF_TOKEN);

    try {
        // Build enhanced prompt with style
        let enhancedPrompt = `Ultra HD, 4K, cinematic composition. ${prompt}`;
        
        // Add style-specific enhancements if style is provided
        if (style && stylePrompts[style as keyof typeof stylePrompts]) {
            const styleEnhancement = stylePrompts[style as keyof typeof stylePrompts];
            enhancedPrompt = `${enhancedPrompt}. ${styleEnhancement}`;
        }
        
        console.log('[status] Starting image generation with enhanced prompt:', enhancedPrompt)
        console.log('[status] Style applied:', style || 'none')
        
        // The Hugging Face API returns a Blob directly
        const imageBlob = await client.textToImage({
            model: "Qwen/Qwen-Image",
            inputs: enhancedPrompt,
            parameters: { 
                num_inference_steps: 20,
            },
        });
        
        console.log('[status] Image generated! Type:', typeof imageBlob)
        console.log('[status] Uploading...')
        
        // imageBlob is already a Blob, no need to convert
        const response = await upload(user_id, imageBlob, "image");
        
        console.log('[status] Upload response:', response)
        return response
    } catch (error) {
        console.error('[ERROR] Detailed error:', error)
        throw error
    }
}