import { upload } from '@/lib/upload'
import { InferenceClient } from "@huggingface/inference";

export async function generate(prompt: string, user_id: string) {
    // Debug environment variables (same as image generation)
    console.log('[DEBUG] Video - HF_TOKEN exists:', !!process.env.HF_TOKEN)
    console.log('[DEBUG] Video - HF_TOKEN length:', process.env.HF_TOKEN?.length)
    
    if (!process.env.HF_TOKEN) {
        throw new Error('HF_TOKEN environment variable is not set')
    }

    if (!process.env.HF_TOKEN.startsWith('hf_')) {
        throw new Error('HF_TOKEN must start with "hf_"')
    }

    const client = new InferenceClient(process.env.HF_TOKEN);

    try {
        console.log('[status] Starting video generation with prompt:', prompt)
        
        // The Hugging Face API returns a Blob directly (same as images)
        const videoBlob = await client.textToVideo({
            provider: "auto",
            model: "Wan-AI/Wan2.2-T2V-A14B",
            inputs: prompt,
        });
        
        console.log('[status] Video generated! Type:', typeof videoBlob)
        console.log('[status] Video blob size:', videoBlob.size)
        console.log('[status] Uploading video...')
        
        // videoBlob is already a Blob, no need to convert (same as images)
        const response = await upload(user_id, videoBlob, "video");
        
        console.log('[status] Video upload response:', response)
        console.log('[status] Video upload response type:', typeof response)
        
        if (!response) {
            throw new Error('Video upload function returned undefined')
        }
        
        if (typeof response !== 'string' || !response.startsWith('http')) {
            throw new Error(`Video upload function returned invalid URL: ${response}`)
        }
        
        return response
    } catch (error) {
        console.error('[ERROR] Detailed video error:', error)
        throw error
    }
}