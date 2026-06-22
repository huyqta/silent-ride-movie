"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';

// iOS (Safari/Chrome) dùng WebKit, không hỗ trợ Fullscreen API chuẩn.
// Detect để dùng webkitEnterFullscreen thay thế.
const isIOS = () =>
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

declare global {
    interface Window {
        Plyr: any;
    }
}

interface PlyrPlayerProps {
    options?: any;
    source: any;
    hlsUrl?: string;
    onReady?: (player: any) => void;
    startTime?: number;
}

export type PlyrPlayerHandle = {
    getInternalPlayer: () => any;
};

export const PlyrPlayer = forwardRef<PlyrPlayerHandle, PlyrPlayerProps>((props, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<any>(null);
    const hlsRef = useRef<Hls | null>(null);
    const { options, source, hlsUrl, onReady, startTime } = props;

    useImperativeHandle(ref, () => ({
        getInternalPlayer: () => playerRef.current
    }));

    useEffect(() => {
        if (!videoRef.current) return;

        const video = videoRef.current;

        const defaultOptions = {
            controls: [
                'play-large', 'play', 'progress',
                'current-time', 'mute', 'volume',
                'captions', 'settings',
                'airplay', 'pip', 'rewind', 'fast-forward', 'fullscreen'
            ],
            settings: ['quality', 'speed'],
            speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4] },
            quality: { default: 1080, options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240] },
            ...options
        };

        const cleanup = () => {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (e) {
                    console.error('Error destroying player:', e);
                }
                playerRef.current = null;
            }
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            (window as any).Plyr = undefined;
            document.getElementById('plyr-cdn-script')?.remove();
        };

        const initPlayer = (Constructor: any) => {
            if (!Constructor || !video) return;
            cleanup();

            try {
                const player = new Constructor(video, defaultOptions);
                playerRef.current = player;

                // iOS: Plyr gọi requestFullscreen() khi bấm nút fullscreen — không hoạt động trên iOS.
                // Override bằng cách patch nút fullscreen để gọi webkitEnterFullscreen thay thế.
                if (isIOS()) {
                    player.on('ready', () => {
                        const fullscreenBtn = player.elements?.buttons?.fullscreen as HTMLElement | null;
                        if (fullscreenBtn) {
                            fullscreenBtn.addEventListener('click', (e: Event) => {
                                e.stopImmediatePropagation();
                                if ((video as any).webkitEnterFullscreen) {
                                    (video as any).webkitEnterFullscreen();
                                }
                            }, true); // capture phase để chặn trước Plyr
                        }
                    });
                }

                if (hlsUrl && Hls.isSupported()) {
                    const hls = new Hls(startTime && startTime > 0 ? { startPosition: startTime } : {});
                    hlsRef.current = hls;
                    hls.loadSource(hlsUrl);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        if (onReady) onReady(player);
                        player.play().catch(() => { });
                    });
                } else if (hlsUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = hlsUrl;
                    video.addEventListener('loadedmetadata', () => {
                        if (onReady) onReady(player);
                        if (startTime && startTime > 0) video.currentTime = startTime;
                        player.play().catch(() => { });
                    }, { once: true });
                } else {
                    if (source) player.source = source;
                    onReady && onReady(player);
                }
            } catch (e) {
                console.error('Failed to init Plyr:', e);
            }
        };

        const loadAndInit = () => {
            if (window.Plyr) {
                initPlayer(window.Plyr);
                return;
            }

            const scriptId = 'plyr-cdn-script';
            let script = document.getElementById(scriptId) as HTMLScriptElement;

            if (!script) {
                script = document.createElement('script');
                script.id = scriptId;
                script.src = 'https://cdn.plyr.io/3.7.8/plyr.js';
                script.async = true;
                document.head.appendChild(script);
            }

            const onScriptLoad = () => {
                if (window.Plyr) initPlayer(window.Plyr);
            };

            script.addEventListener('load', onScriptLoad);
            return () => script.removeEventListener('load', onScriptLoad);
        };

        const cleanupEventListener = loadAndInit();

        return () => {
            cleanup();
            if (cleanupEventListener) cleanupEventListener();
        };
    }, [hlsUrl, JSON.stringify(source)]);

    useEffect(() => {
        const video = videoRef.current;

        // Trên iOS, Plyr không thể gọi requestFullscreen() chuẩn.
        // Override: khi Plyr trigger fullscreen, dùng webkitEnterFullscreen của <video>.
        const handlePlyrFullscreen = () => {
            if (!video) return;
            if (isIOS()) {
                // iOS chỉ hỗ trợ webkitEnterFullscreen trực tiếp trên <video>
                if ((video as any).webkitEnterFullscreen) {
                    (video as any).webkitEnterFullscreen();
                }
                return;
            }
            // Android/Desktop: dùng Fullscreen API chuẩn
            if (video.requestFullscreen) {
                video.requestFullscreen().catch(() => {});
            } else if ((video as any).webkitRequestFullscreen) {
                (video as any).webkitRequestFullscreen();
            }
        };

        // Orientation lock — chỉ Android hỗ trợ, iOS luôn throw error nên skip
        const handleFullscreenChange = () => {
            if (isIOS()) return; // iOS không hỗ trợ orientation lock
            try {
                const isFullscreen =
                    !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
                if (isFullscreen) {
                    if (window.screen?.orientation && (window.screen.orientation as any).lock) {
                        (window.screen.orientation as any).lock('landscape').catch(() => {});
                    }
                } else {
                    if (window.screen?.orientation?.unlock) {
                        window.screen.orientation.unlock();
                    }
                }
            } catch (err) {
                console.warn('Orientation lock error:', err);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        // Expose helper cho VideoPlayer (phím tắt 'f')
        if (video) {
            (video as any).__iosFullscreen = handlePlyrFullscreen;
        }

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div className="plyr-container w-full h-full min-h-[200px] rounded-lg overflow-hidden border border-white/5 shadow-2xl relative z-10 bg-black group flex items-center justify-center">
            {/* playsInline + webkit-playsinline: bắt buộc để iOS không auto-fullscreen khi play */}
            <video
                ref={videoRef}
                className="plyr-react h-full w-full block"
                crossOrigin="anonymous"
                playsInline
                // @ts-ignore — webkit attribute cần cho iOS Safari
                webkit-playsinline="true"
                x-webkit-airplay="allow"
            />
        </div>
    );
});

PlyrPlayer.displayName = 'PlyrPlayer';

export default PlyrPlayer;
