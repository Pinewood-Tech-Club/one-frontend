"use client";

import { redirect } from 'next/navigation';

export function Home() {
  return (
    <div>
        <div className="w-screen h-screen bg-green-800 text-white">
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-5xl font-bold text-center hover:scale-105 transition-transform ease-in-out cursor-default">COMING SOON</p>
                <p><a href="mailto:techclub@pinewood.edu" className="block text-white underline px-3 py-2 rounded-lg hover:text-blue-100 hover:bg-green-700 hover:scale-105 transition-transform ease-in-out cursor-pointer" style={{
                    transition: "color 0.2s ease, background-color 0.2s ease, scale 0.2s ease",
                }}>techclub@pinewood.edu</a></p>
            </div>
        </div>
    </div>
  );
}

export default function HomePage() {
  redirect('/');
}

