"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Maximize2, Volume2, VolumeX, Play, Pause, SkipForward, Settings } from "lucide-react";
import { useStore } from "@/lib/store/useStore";

interface VideoPlayerProps {
    movieSlug: string;
    movieName: string;
    movieThumb: string;
    episode: string;
    episodeName: string;
    embedUrl: string;
    m3u8Url: string;
}

export default function VideoPlayer({
    movieSlug,
    movieName,
    movieThumb,
    episode,
    episodeName,
    embedUrl,
    m3u8Url,
}: VideoPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { updateProgress, getProgress, addToHistory } = useStore();
    const [isLoading, setIsLoading] = useState(true);
    const [useEmbed, setUseEmbed] = useState(true);

    // Get saved progress
    const savedProgress = getProgress(movieSlug);

    // Add to history when page loads
    useEffect(() => {
        addToHistory({
            slug: movieSlug,
            name: movieName,
            thumb: movieThumb,
            episode: episode,
            episodeName: episodeName,
        });
    }, [movieSlug, movieName, movieThumb, episode, episodeName, addToHistory]);

    // Save progress periodically (for embed, we can't get exact time, so save episode info)
    useEffect(() => {
        const saveInterval = setInterval(() => {
            updateProgress(movieSlug, episode, episodeName, 0, 0);
        }, 10000); // Save every 10 seconds

        return () => clearInterval(saveInterval);
    }, [movieSlug, episode, episodeName, updateProgress]);

    // Handle iframe load
    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    return (
        <div className="relative">
            {/* Video container with 16:9 aspect ratio */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background-secondary">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-foreground-secondary">Đang tải...</p>
                        </div>
                    </div>
                )}

                {/* Embed iframe */}
                {useEmbed && embedUrl && (
                    <iframe
                        ref={iframeRef}
                        src={embedUrl}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture"
                        onLoad={handleIframeLoad}
                    />
                )}

                {/* Fallback message if no embed */}
                {!embedUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-foreground-secondary">Không có nguồn phát</p>
                    </div>
                )}
            </div>

            {/* Player info bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 p-4 bg-background-secondary rounded-lg">
                <div>
                    <h2 className="font-semibold">{movieName}</h2>
                    <p className="text-sm text-foreground-secondary">{episodeName}</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Source toggle - if m3u8 is available */}
                    {m3u8Url && (
                        <div className="flex items-center gap-2 text-sm">
                            {/* <span className="text-foreground-muted">Nguồn:</span> */}
                            {/* <button
                                onClick={() => setUseEmbed(true)}
                                className={`px-3 py-1 rounded-lg transition-colors ${useEmbed ? "bg-primary text-white" : "bg-white/10 hover:bg-white/20"
                                    }`}
                            >
                                Embed
                            </button>
                            <button
                                onClick={() => setUseEmbed(false)}
                                className={`px-3 py-1 rounded-lg transition-colors ${!useEmbed ? "bg-primary text-white" : "bg-white/10 hover:bg-white/20"
                                    }`}
                            >
                                M3U8
                            </button> */}
                        </div>
                    )}
                </div>
            </div>

            {/* Resume notification */}
            {savedProgress && savedProgress.episode !== episode && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-accent/20 border border-accent/30 rounded-lg"
                >
                    <p className="text-sm">
                        Bạn đang xem dở <strong>{savedProgress.episodeName || `Tập ${savedProgress.episode}`}</strong>.{" "}
                        <a
                            href={`/xem-phim/${movieSlug}/${savedProgress.episode}`}
                            className="text-accent hover:underline font-medium"
                        >
                            Tiếp tục xem
                        </a>
                    </p>
                </motion.div>
            )}
        </div>
    );
}
