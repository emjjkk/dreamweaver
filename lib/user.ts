import { createClient } from '@/lib/supabase/server'

const supabase = createClient()

export async function checkUser(discordId: string , type:string) {
  try {
    let { data, error } = await supabase
      .from('users')
      .select('discord_id, credit_balance')
      .eq('discord_id', discordId)
      .limit(1)
      .single() // will return one object or null

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Supabase error:', error)
      return null
    }

    if (!data) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          discord_id: discordId,
          credit_balance: 20, // default starting balance
        })
        .select('discord_id, credit_balance')
        .single()

      if (insertError) {
        console.error('Failed to create user:', insertError)
        return null
      }
      
      return newUser.credit_balance
    }

    return data.credit_balance
  } catch (err) {
    console.error('Unexpected error:', err)
    return null
  }
}

