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
      <div className="w-screen flex flex-col md:flex-row items-center text-white">
        {/* Left content panel */}
        <div className="w-full md:w-1/2 min-h-screen md:h-screen bg-black p-6 md:p-12 relative md:block flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-5 justify-center md:justify-start">
            <img src="/download.jfif" alt="Dreamweaver" className='rounded-full w-8 h-auto' />
            <h1 className="text-xl">Dreamweaver</h1>
            <button className="px-2 py-1 text-sm bg-blue-500 rounded-md">Beta</button>
          </div>
          <h1 className="text-3xl md:text-5xl md:leading-[1.2] mb-8 text-center md:text-left">
            Near-perfect AI-generated images and artwork. Instantly. Open-Source. On <span className='text-blue-500'>Discord</span>.
          </h1>
          <div className="flex flex-col sm:flex-row items-center gap-2 justify-center md:justify-start">
            <a href={inviteUrl} className="w-full sm:w-auto"><button className="w-full sm:w-auto px-4 py-2 text-md flex items-center justify-center gap-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:cursor-pointer transition-2"><FaDiscord/> Use on Discord</button></a>
            <a href="https://github.com/emjjkk/dreamweaver" className="w-full sm:w-auto"><button className="w-full sm:w-auto px-4 py-2 text-md flex items-center justify-center gap-2 bg-white text-black rounded-md hover:bg-slate-200 hover:cursor-pointer transition-2"><FaGithub/> Contribute on Github</button></a>
          </div>
          <div className="mt-8 md:mt-0 md:absolute bottom-6 md:bottom-12 left-0 right-0 text-center md:text-left md:left-12">Built with 🔥 by @emjjkk</div>
        </div>
        
        {/* Right image grid - hidden on mobile, shown on medium screens and up */}
        <div className="hidden md:grid md:w-1/2 h-screen grid-cols-2 grid-rows-2">
          <div className="bg-cover bg-center bg-[url('/4.webp')]"></div>
          <div className="bg-cover bg-center bg-[url('/2.webp')]"></div>
          <div className="bg-cover bg-center bg-[url('/1.webp')]"></div>
          <div className="bg-cover bg-center bg-[url('/3.webp')]"></div>
        </div>
        
        {/* Mobile image carousel */}
        <div className="md:hidden w-full h-64 bg-black">
          <div className="flex overflow-x-auto snap-x snap-mandatory h-full">
            <div className="flex-shrink-0 w-full h-full snap-start bg-cover bg-center bg-[url('/4.webp')]"></div>
            <div className="flex-shrink-0 w-full h-full snap-start bg-cover bg-center bg-[url('/2.webp')]"></div>
            <div className="flex-shrink-0 w-full h-full snap-start bg-cover bg-center bg-[url('/1.webp')]"></div>
            <div className="flex-shrink-0 w-full h-full snap-start bg-cover bg-center bg-[url('/3.webp')]"></div>
          </div>
        </div>
      </div>
    </>
  )
}
