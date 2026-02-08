"use client";

import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import Player from 'video.js/dist/types/player';

interface VideoJSProps {
    options: any;
    onReady?: (player: Player) => void;
}

export const VideoJS = (props: VideoJSProps) => {
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<Player | null>(null);
    const { options, onReady } = props;

    useEffect(() => {
        // Make sure Video.js player is only initialized once
        if (!playerRef.current) {
            const videoElement = document.createElement("video-js");
            videoElement.classList.add('vjs-big-play-centered');
            videoRef.current?.appendChild(videoElement);

            const player = playerRef.current = videojs(videoElement, options, () => {
                onReady && onReady(player);
            });
        } else {
            const player = playerRef.current;

            if (player) {
                // Only update sources if they have changed to avoid restarting playback
                const currentSrc = player.currentSrc();
                const newSrc = options.sources?.[0]?.src;

                if (newSrc && currentSrc !== newSrc) {
                    player.src(options.sources);
                    if (options.autoplay) {
                        player.play().catch(() => {
                            // Browser might block autoplay if no interaction
                            console.log("Autoplay prevented");
                        });
                    }
                }

                if (options.autoplay !== undefined) {
                    player.autoplay(options.autoplay);
                }
            }
        }
    }, [options]); // Only depend on options

    // Dispose the player on unmount
    useEffect(() => {
        const player = playerRef.current;

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [playerRef]);

    return (
        <div data-vjs-player className="w-full h-full">
            <div ref={videoRef} />
            <style dangerouslySetInnerHTML={{
                __html: `
                .video-js {
                    width: 100% !important;
                    height: 100% !important;
                    border-radius: 0.5rem;
                    overflow: hidden;
                    background-color: transparent !important;
                }
                .vjs-tech {
                    background-color: transparent !important;
                }
                /* Hide default loading spinner to use our custom one */
                .vjs-loading-spinner {
                    display: none !important;
                }
                .vjs-big-play-button {
                    background-color: #e11d48 !important;
                    border-color: #e11d48 !important;
                    width: 3em !important;
                    height: 3em !important;
                    line-height: 3em !important;
                    border-radius: 50% !important;
                    top: 50% !important;
                    left: 50% !important;
                    margin-top: -1.5em !important;
                    margin-left: -1.5em !important;
                    border: none !important;
                    box-shadow: 0 4px 20px rgba(225, 29, 72, 0.4);
                }
                .vjs-control-bar {
                    background: rgba(0, 0, 0, 0.7) !important;
                    backdrop-filter: blur(8px);
                }
                .skip-feedback {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.5);
                    color: white;
                    padding: 20px;
                    border-radius: 50%;
                    font-weight: bold;
                    pointer-events: none;
                    animation: fadeOut 0.5s ease-out forwards;
                    z-index: 10;
                }
                .skip-feedback.left { left: 15%; }
                .skip-feedback.right { right: 15%; }
                @keyframes fadeOut {
                    0% { opacity: 1; transform: translateY(-50%) scale(1); }
                    100% { opacity: 0; transform: translateY(-50%) scale(1.5); }
                }
            `}} />
        </div>
    );
}

export default VideoJS;
