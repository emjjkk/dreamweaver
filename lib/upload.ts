// utils/uploadBlob.ts
import { supabase } from '@/lib/supabase/bot';

export async function upload(userId: string, blob: Blob, type: 'image' | 'video' = 'image'): Promise<string> {
  try {
    console.log('[UPLOAD] Starting upload for user:', userId)
    console.log('[UPLOAD] Blob size:', blob.size, 'Type:', blob.type)
    
    // Generate unique file name
    const ext = type === 'image' ? 'png' : 'mp4';
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `${userId}/${fileName}`;
    
    console.log('[UPLOAD] File path:', filePath)

    // Convert blob to ArrayBuffer for Supabase
    const arrayBuffer = await blob.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);
    
    console.log('[UPLOAD] Converted to ArrayBuffer, size:', fileData.length)

    const supabaseClient = await supabase;
    
    const { data, error } = await supabaseClient.storage
      .from('generations')
      .upload(filePath, fileData, {
        cacheControl: '3600',
        upsert: true,
        contentType: blob.type || (type === 'image' ? 'image/png' : 'video/mp4'),
      });

    if (error) {
      console.error('[UPLOAD] Upload error:', error)
      throw error;
    }
    
    console.log('[UPLOAD] Upload successful:', data)

    // Get public URL - Fixed: getPublicUrl returns { data: { publicUrl } }
    const { data: urlData } = supabaseClient.storage
      .from('generations')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    
    console.log('[UPLOAD] Generated public URL:', publicUrl)
    
    if (!publicUrl) {
      throw new Error('Failed to generate public URL')
    }

    return publicUrl;
    
  } catch (error) {
    console.error('[UPLOAD] Error during upload:', error)
    throw error;
  }
}