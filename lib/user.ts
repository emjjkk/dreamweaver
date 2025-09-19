import { supabase } from '@/lib/supabase/bot'

export async function checkUser(discordId: string, deduct: number) {
  try {
    // 1. Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('discord_id', discordId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[checkUser] Fetch error:', fetchError)
      return false
    }

    // 2. If user doesn't exist, create one
    if (!user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            discord_id: discordId,
            credit_balance: 15,
            subscription: false,
          },
        ])

      if (insertError) {
        console.error('[checkUser] Insert error:', insertError)
        return false
      }

      return true
    }

    // 3. If user exists, check credits
    if (user.credit_balance >= deduct) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ credit_balance: user.credit_balance - deduct })
        .eq('discord_id', discordId)

      if (updateError) {
        console.error('[checkUser] Update error:', updateError)
        return false
      }

      return true
    } else {
      return false
    }
  } catch (err) {
    console.error('[checkUser] Unexpected error:', err)
    return false
  }
}
