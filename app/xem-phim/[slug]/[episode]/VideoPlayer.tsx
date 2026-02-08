"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Volume2, VolumeX, Play, Pause, RotateCcw, RotateCw, Settings } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import dynamic from "next/dynamic";
import Player from "video.js/dist/types/player";

// Dynamically import VideoJS to avoid SSR issues
const VideoJS = dynamic(() => import("@/components/movie/VideoJS"), { ssr: false });

interface VideoPlayerProps {
    movieSlug: string;
    movieName: string;
    movieThumb: string;
    episode: string;
    episodeName: string;
    embedUrl: string;
    m3u8Url: string;
    prevEpisodeSlug?: string;
    nextEpisodeSlug?: string;
}

export default function VideoPlayer({
    movieSlug,
    movieName,
    movieThumb,
    episode,
    episodeName,
    embedUrl,
    m3u8Url,
    prevEpisodeSlug,
    nextEpisodeSlug,
}: VideoPlayerProps) {
    const router = useRouter();
    const playerRef = useRef<Player | null>(null);
    const { updateProgress, getProgress, addToHistory } = useStore();
    const [isLoading, setIsLoading] = useState(true);
    const [useEmbed, setUseEmbed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Get saved progress
    const savedProgress = getProgress(movieSlug);

    // Initial preference: use M3U8 if available
    useEffect(() => {
        if (m3u8Url) {
            setUseEmbed(false);
        } else {
            setUseEmbed(true);
        }
    }, [m3u8Url]);

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

    // Save progress periodically
    useEffect(() => {
        const saveInterval = setInterval(() => {
            if (playerRef.current) {
                const currentTime = playerRef.current.currentTime() || 0;
                const duration = playerRef.current.duration() || 0;
                if (duration > 0) {
                    updateProgress(movieSlug, episode, episodeName, currentTime, duration);
                }
            }
        }, 10000); // Save every 10 seconds

        return () => clearInterval(saveInterval);
    }, [movieSlug, episode, episodeName, updateProgress]);

    // Handlers for custom controls
    const togglePlay = useCallback(() => {
        if (playerRef.current) {
            if (playerRef.current.paused()) {
                playerRef.current.play();
            } else {
                playerRef.current.pause();
            }
        }
    }, []);

    const skipTime = useCallback((amount: number) => {
        if (playerRef.current) {
            const player = playerRef.current;
            const currentTime = player.currentTime() || 0;
            const duration = player.duration() || 0;
            let newTime = currentTime + amount;

            // Boundary checks
            if (newTime < 0) newTime = 0;
            if (newTime > duration) newTime = duration;

            player.currentTime(newTime);

            // Force play if it was playing or intended to be playing
            // Seek operations on HLS sometimes stall or transition to a paused-like state
            if (!player.paused()) {
                // Small delay sometimes helps with HLS seek stability
                setTimeout(() => {
                    player.play()?.catch(() => { });
                }, 50);
            }
        }
    }, [playerRef]);

    const toggleMute = useCallback(() => {
        if (playerRef.current) {
            const currentMuted = playerRef.current.muted();
            playerRef.current.muted(!currentMuted);
            setIsMuted(!currentMuted);
        }
    }, []);

    const handlePlayerReady = (player: Player) => {
        playerRef.current = player;
        setIsLoading(false);

        // Resume from saved progress
        if (savedProgress && savedProgress.episode === episode) {
            player.currentTime(savedProgress.currentTime);
        }

        // Setup event listeners
        player.on('play', () => setIsPlaying(true));
        player.on('pause', () => setIsPlaying(false));
        player.on('volumechange', () => setIsMuted(!!player.muted()));
        player.on('waiting', () => setIsLoading(true));
        player.on('playing', () => setIsLoading(false));
        player.on('seeked', () => setIsLoading(false));

        // Error handling to prevent "stop" without reason
        player.on('error', () => {
            const error = player.error();
            console.error('VideoJS Error:', error);
            // Attempt to recover if it's a non-fatal error or just reload
            if (error?.code === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED or similar
                // Potential retry logic
            }
        });

        // --- MOBILE DOUBLE TAP TO SKIP LOGIC ---
        // We inject this directly into the Video.js DOM so it works in full-screen
        const vjsEl = player.el();
        let lastTap = 0;

        const handleTap = (e: MouseEvent | TouchEvent) => {
            const now = Date.now();
            const DOUBLE_TAP_DELAY = 300;

            if (now - lastTap < DOUBLE_TAP_DELAY) {
                // Double tap detected
                const rect = vjsEl.getBoundingClientRect();
                let x = 0;

                if ('changedTouches' in e && e.changedTouches.length > 0) {
                    x = e.changedTouches[0].clientX;
                } else if ('touches' in e && e.touches.length > 0) {
                    x = e.touches[0].clientX;
                } else if ('clientX' in e) {
                    x = (e as MouseEvent).clientX;
                }

                const relativeX = x - rect.left;

                if (relativeX < rect.width / 2) {
                    skipTime(-10);
                    showSkipFeedback('left');
                } else {
                    skipTime(10);
                    showSkipFeedback('right');
                }
            }
            lastTap = now;
        };

        const showSkipFeedback = (side: 'left' | 'right') => {
            const feedback = document.createElement('div');
            feedback.className = `skip-feedback ${side}`;
            feedback.innerHTML = side === 'left' ? '↺ 10s' : '10s ↻';
            feedback.style.cssText = `
                position: absolute;
                top: 50%;
                ${side === 'left' ? 'left: 15%' : 'right: 15%'};
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.5);
                color: white;
                padding: 15px;
                border-radius: 50%;
                font-size: 14px;
                font-weight: bold;
                z-index: 100;
                pointer-events: none;
                animation: skip-fade 0.5s ease-out forwards;
            `;
            vjsEl.appendChild(feedback);
            setTimeout(() => feedback.remove(), 500);
        };

        vjsEl.addEventListener('touchend', handleTap as any);
    };

    // Keyboard Hotkeys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key) {
                case "ArrowLeft":
                    e.preventDefault();
                    skipTime(-10);
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    skipTime(10);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    if (nextEpisodeSlug) {
                        router.push(`/xem-phim/${movieSlug}/${nextEpisodeSlug}`);
                    }
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    if (prevEpisodeSlug) {
                        router.push(`/xem-phim/${movieSlug}/${prevEpisodeSlug}`);
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [skipTime, nextEpisodeSlug, prevEpisodeSlug, movieSlug, router]);

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    const videoJsOptions = useMemo(() => ({
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        preload: 'auto',
        html5: {
            vhs: {
                overrideNative: true, // Use Video.js HLS engine even if native is available
                enableLowInitialPlaylist: true,
                fastQualityChange: true,
                useDevicePixelRatio: true
            }
        },
        sources: [{
            src: m3u8Url,
            type: 'application/x-mpegURL'
        }]
    }), [m3u8Url]);

    return (
        <div className="relative">
            {/* Video container with 16:9 aspect ratio */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                {/* Loading overlay - Now semi-transparent to keep video frame visible */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
                        >
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-primary/30 rounded-full" />
                                <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Custom Player for M3U8 using Video.js */}
                {!useEmbed && m3u8Url && (
                    <div className="w-full h-full">
                        <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
                    </div>
                )}

                {/* Embed iframe */}
                {useEmbed && embedUrl && (
                    <iframe
                        src={embedUrl}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture"
                        onLoad={handleIframeLoad}
                    />
                )}

                {/* Fallback message if no embed */}
                {!embedUrl && !m3u8Url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-foreground-secondary">Không có nguồn phát</p>
                    </div>
                )}
            </div>

            {/* Quick Controls Bar (Desktop & Mobile) */}
            {!useEmbed && m3u8Url && (
                <div className="hidden mt-4 flex items-center justify-center gap-4 md:gap-8 p-4 bg-background-secondary rounded-lg border border-white/5">
                    <button
                        onClick={() => skipTime(-10)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                        title="Lùi 10 giây"
                    >
                        <RotateCcw className="w-6 h-6 text-foreground-secondary group-hover:text-primary" />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 flex items-center justify-center bg-primary hover:scale-105 rounded-full transition-all"
                        title={isPlaying ? "Tạm dừng" : "Phát"}
                    >
                        {isPlaying ? (
                            <Pause className="w-6 h-6 fill-white text-white" />
                        ) : (
                            <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                        )}
                    </button>

                    <button
                        onClick={() => skipTime(10)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                        title="Tiến 10 giây"
                    >
                        <RotateCw className="w-6 h-6 text-foreground-secondary group-hover:text-primary" />
                    </button>

                    <div className="w-px h-8 bg-white/10 mx-2 hidden md:block" />

                    <button
                        onClick={toggleMute}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                        title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                    >
                        {isMuted ? (
                            <VolumeX className="w-6 h-6 text-red-500" />
                        ) : (
                            <Volume2 className="w-6 h-6 text-foreground-secondary group-hover:text-primary" />
                        )}
                    </button>
                </div>
            )}

            {/* Player details bar */}
            {/* <div className="mt-4 flex flex-wrap items-center justify-between gap-4 p-4 bg-background-secondary rounded-lg border border-white/5">
                <div>
                    <h2 className="font-semibold text-lg">{movieName}</h2>
                    <p className="text-sm text-foreground-secondary">Tập {episodeName}</p>
                </div>

                <div className="flex items-center gap-2">
                    {m3u8Url && embedUrl && (
                        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
                            <button
                                onClick={() => {
                                    setUseEmbed(false);
                                    setIsLoading(true);
                                }}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!useEmbed ? "bg-primary text-white shadow-lg" : "text-foreground-muted hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                Player chính
                            </button>
                            <button
                                onClick={() => {
                                    setUseEmbed(true);
                                    setIsLoading(true);
                                }}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${useEmbed ? "bg-primary text-white shadow-lg" : "text-foreground-muted hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                Dự phòng (Embed)
                            </button>
                        </div>
                    )}
                </div>
            </div> */}

            {/* Resume notification */}
            {savedProgress && savedProgress.episode !== episode && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between"
                >
                    <p className="text-sm">
                        Bạn đang xem dở <strong>{savedProgress.episodeName || `Tập ${savedProgress.episode}`}</strong>.
                    </p>
                    <a
                        href={`/xem-phim/${movieSlug}/${savedProgress.episode}`}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Tiếp tục xem
                    </a>
                </motion.div>
            )}
        </div>
    );
}

