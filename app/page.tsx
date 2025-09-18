'use client'
import { useEffect, useState } from 'react'
import { FaDiscord, FaGithub } from 'react-icons/fa6'

export default function Index() {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_APPLICATION_ID
  const permissions = 8 // Admin
  let inviteUrl = ''
  if (clientId && permissions) inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`

  return (
    <>
      <div className="w-screen flex items-center text-white">
        <div className="w-1/2 h-screen bg-black p-12 relative">
          <div className="flex items-center gap-2 mb-5">
            <img src="/download.jfif" alt="Dreamweaver" className='rounded-full w-8 h-auto' />
            <h1 className="text-xl">Dreamweaver</h1>
            <button className="px-2 py-1 text-sm bg-blue-500 rounded-md">Beta</button>
          </div>
          <h1 className="text-5xl/[1.2] mb-8">Near-perfect AI-generated images and artwork. Instantly. Open-Source. On <span className='text-blue-500'>Discord</span>.</h1>
          <div className="flex items-center gap-2">
            <a href={inviteUrl}><button className="px-4 py-2 text-md flex items-center gap-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:cursor-pointer transition-2"><FaDiscord/> Use on Discord</button></a>
            <a href="https://github.com/emjjkk/dreamweaver"><button className="px-4 py-2 text-md flex items-center gap-2 bg-white text-black rounded-md hover:bg-slate-200 hover:cursor-pointer transition-2"><FaGithub/> Contribute on Github</button></a>
          </div>
          <div className="absolute bottom-12 left-12 text-md">Built with 🔥 by @emjjkk</div>
        </div>
        <div className="w-1/2 h-screen grid grid-cols-2 grid-rows-2">
          <div className="bg-cover bg-center bg-[url('/4.webp')]"></div>
          <div className="bg-cover bg-center bg-[url('/2.webp')]"></div>
          <div className="bg-cover bg-center bg-[url('/1.webp')]"></div>
          <div className="bg-cover bg-center bg-[url('/3.webp')]"></div>
        </div>
      </div>

    </>
  )
}
