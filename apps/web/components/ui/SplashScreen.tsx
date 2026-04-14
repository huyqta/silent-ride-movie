"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export default function SplashScreen() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background animate-in fade-in duration-500">
            <div className="relative flex flex-col items-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-primary to-primary/50 p-6 rounded-3xl shadow-2xl shadow-primary/20">
                        <Sparkles className="w-16 h-16 text-primary-foreground animate-bounce" />
                    </div>
                </div>
                
                <h1 className="text-4xl font-black tracking-tighter text-foreground mb-2">
                    SILENT RIDE
                </h1>
                <div className="flex items-center space-x-2">
                    <div className="h-1 w-12 bg-primary rounded-full animate-pulse" />
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs">
                        Cinematic Excellence
                    </p>
                    <div className="h-1 w-12 bg-primary rounded-full animate-pulse" />
                </div>
            </div>
            
            <div className="absolute bottom-12 flex flex-col items-center space-y-4">
                <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
                <p className="text-muted-foreground/60 text-[10px] font-medium uppercase tracking-widest">
                    Initializing Experience
                </p>
            </div>
        </div>
    );
}
