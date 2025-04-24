"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LandingPage() {
    const router = useRouter();
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden">
      <div className="absolute top-8 left-8 z-20">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 animate-gradient">
          Replacify
        </h2>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-fuchsia-900/20 to-purple-900/30 animate-gradient-slow z-0"></div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDBNIDAgMjAgTCA0MCAyMCBNIDIwIDAgTCAyMCA0MCBNIDAgMzAgTCA0MCAzMCBNIDMwIDAgTCAzMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40 z-0 animate-pulse-slow"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12 animate-fade-in">
        <h1 className="text-4xl font-sans sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-500 animate-gradient hover:scale-105 transition-transform duration-500 px-4">
          instantly tells you how replaceable you are
        </h1>

        <p className="text-lg font-sans sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed animate-slide-up px-4">
          just upload your resume + skills and get brutally honest ai feedback
          on how soon a machine might take your job
        </p>

        <div className="mt-12 animate-bounce-slow">
          <Button className="relative font-mono bg-gradient-to-r from-cyan-500 via-fuchsia-600 to-violet-600 text-white px-10 py-7 text-xl sm:text-2xl rounded-lg font-bold hover:from-cyan-600 hover:via-fuchsia-700 hover:to-violet-700 transform hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(192,38,211,0.5)] hover:shadow-[0_0_50px_rgba(192,38,211,0.8)] group overflow-hidden"
          onClick={() => router.push("/check")}
          >
            <span className="relative z-10">check your score</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 animate-gradient"></div>
          </Button>
        </div>
      </div>
    </div>
  );
}
