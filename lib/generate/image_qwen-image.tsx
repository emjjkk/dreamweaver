import { upload } from '@/lib/upload'
import { InferenceClient } from "@huggingface/inference";

export async function generate(prompt: string, user_id: string) {
    // Debug environment variables
    console.log('[DEBUG] HF_TOKEN exists:', !!process.env.HF_TOKEN)
    console.log('[DEBUG] HF_TOKEN length:', process.env.HF_TOKEN?.length)
    
    if (!process.env.HF_TOKEN) {
        throw new Error('HF_TOKEN environment variable is not set')
    }

    if (!process.env.HF_TOKEN.startsWith('hf_')) {
        throw new Error('HF_TOKEN must start with "hf_"')
    }

    const client = new InferenceClient(process.env.HF_TOKEN);

    try {
        console.log('[status] Starting image generation with prompt:', prompt)
        
        // The Hugging Face API returns a Blob directly
        const imageBlob = await client.textToImage({
            model: "stabilityai/stable-diffusion-xl-base-1.0",
            inputs: prompt,
            parameters: { 
                num_inference_steps: 20,
                guidance_scale: 7.5 
            },
        });
        
        console.log('[status] Image generated! Type:', typeof imageBlob)
        console.log('[status] Image blob size:', imageBlob.size)
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