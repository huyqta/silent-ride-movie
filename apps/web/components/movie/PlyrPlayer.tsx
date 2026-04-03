"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';

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
                'restart', 'rewind', 'play', 'fast-forward',
                'progress', 'current-time', 'duration', 'mute', 'volume',
                'captions', 'settings', 'pip', 'airplay', 'fullscreen'
            ],
            settings: ['quality', 'speed'],
            tooltips: { controls: true, seek: true },
            displayDuration: true,
            invertTime: false,
            toggleInvert: false,
            clickToPlay: true,
            blankVideo: 'https://cdn.plyr.io/static/blank.mp4', // Explicitly set or use an alternative
            keyboard: { focused: true, global: true },
            ...options
        };

        const cleanup = () => {
            if (playerRef.current) {
                try {
                    const player = playerRef.current;
                    if (player._customClickHandler && player._playerContainer) {
                        player._playerContainer.removeEventListener('mousedown', player._customClickHandler, true);
                        player._playerContainer.removeEventListener('touchstart', player._customClickHandler, true);
                    }
                    if (player._customDblClickHandler && player._playerContainer) {
                        player._playerContainer.removeEventListener('dblclick', player._customDblClickHandler, true);
                    }
                    player.destroy();
                } catch (e) {
                    console.error('Error destroying player:', e);
                }
                playerRef.current = null;
            }
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            // Reset Plyr global + script tag → next mount always loads async (no synchronous init race)
            (window as any).Plyr = undefined;
            document.getElementById('plyr-cdn-script')?.remove();
        };

        const initPlayer = (Constructor: any) => {
            if (!Constructor || !video) return;
            cleanup();

            try {
                const player = new Constructor(video, defaultOptions);
                playerRef.current = player;

                if (hlsUrl && Hls.isSupported()) {
                    // HLS.js manages the source directly — do NOT set player.source
                    // or it causes a double video.load() that breaks play() on fast navigation.
                    // startPosition tells HLS to buffer from that point immediately (no post-seek needed)
                    const hls = new Hls(startTime && startTime > 0 ? { startPosition: startTime } : {});
                    hlsRef.current = hls;
                    hls.loadSource(hlsUrl);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        if (onReady) onReady(player);
                        player.play().catch(() => {});
                    });
                } else if (hlsUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
                    // Safari native HLS
                    video.src = hlsUrl;
                    video.addEventListener('loadedmetadata', () => {
                        if (onReady) onReady(player);
                        if (startTime && startTime > 0) video.currentTime = startTime;
                        player.play().catch(() => {});
                    }, { once: true });
                } else {
                    // YouTube / embed / direct video source
                    if (source) player.source = source;
                    onReady && onReady(player);
                }

                // Add Double-click / Double-tap to seek (YouTube Style)
                const container = video.closest('.plyr') as HTMLElement;
                if (container) {
                    let lastClickTime = 0;
                    let lastTouchTime = 0;
                    let clickTimeout: any = null;
                    const DOUBLE_CLICK_DELAY = 300;

                    const handleEvent = (e: any) => {
                        // 1. Skip if clicking on controls or menus
                        if (e.target.closest('.plyr__controls') || e.target.closest('.plyr__menu')) {
                            return;
                        }

                        const now = Date.now();
                        
                        // 2. Deduplicate Touch/Mouse
                        if (e.type === 'touchstart') {
                            lastTouchTime = now;
                        } else if (e.type === 'mousedown' && now - lastTouchTime < 500) {
                            return;
                        }

                        // 3. Detect double click vs single click delay
                        if (now - lastClickTime < DOUBLE_CLICK_DELAY && now - lastClickTime > 0) {
                            // Double-click detected!
                            // Cancel the pending single-click action
                            if (clickTimeout) {
                                clearTimeout(clickTimeout);
                                clickTimeout = null;
                            }
                            
                            // Capture and stop so Plyr doesn't handle this event
                            if (e.cancelable) e.preventDefault();
                            e.stopPropagation();

                            const rect = container.getBoundingClientRect();
                            const clientX = 'clientX' in e ? e.clientX : e.touches?.[0]?.clientX;
                            const clientY = 'clientY' in e ? e.clientY : e.touches?.[0]?.clientY;

                            if (clientX !== undefined) {
                                const x = clientX - rect.left;
                                const y = clientY - rect.top;
                                const isLeftSide = x < rect.width / 2;

                                if (isLeftSide) {
                                    player.rewind(10);
                                    showRipple(x, y, 'backward', container);
                                } else {
                                    player.forward(10);
                                    showRipple(x, y, 'forward', container);
                                }
                            }
                            lastClickTime = 0; // Reset
                        } else {
                            // Potentially a single click or the first of a double click
                            lastClickTime = now;
                            
                            // Clear any existing timeout (shouldn't be any but for safety)
                            if (clickTimeout) clearTimeout(clickTimeout);
                            
                            // Set a delay to trigger single-click pause/play only if no 2nd click follows
                            clickTimeout = setTimeout(() => {
                                player.togglePlay();
                                clickTimeout = null;
                            }, DOUBLE_CLICK_DELAY);
                        }
                    };

                    // We use the capture phase (true) to intercept the second click, 
                    // but we let the first one through to Plyr.
                    container.addEventListener('mousedown', handleEvent, true);
                    container.addEventListener('touchstart', handleEvent, { capture: true, passive: false });

                    // Explicitly block standard dblclick only on the video area
                    const blockDblClick = (e: Event) => {
                        if (!e.target || (e.target as HTMLElement).closest('.plyr__controls')) return;
                        e.preventDefault();
                        e.stopPropagation();
                    };
                    container.addEventListener('dblclick', blockDblClick, true);

                    // Store for cleanup
                    (player as any)._customClickHandler = handleEvent;
                    (player as any)._customDblClickHandler = blockDblClick;
                    (player as any)._playerContainer = container;
                }
            } catch (e) {
                console.error('Failed to init Plyr:', e);
            }
        };

        // LOAD PLYR VIA CDN - This is the most compatible way for Turbopack/Next.js
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

    const showRipple = (x: number, y: number, type: 'forward' | 'backward', container: HTMLElement) => {
        const ripple = document.createElement('div');
        ripple.className = `touch-ripple ${type}`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        container.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    };

    useEffect(() => {
        const handleFullscreen = () => {
            if (document.fullscreenElement && window.screen.orientation && (window as any).screen.orientation.lock) {
                (window as any).screen.orientation.lock('landscape').catch(() => {});
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreen);
        return () => document.removeEventListener('fullscreenchange', handleFullscreen);
    }, []);

    return (
        <div className="plyr-container w-full h-full min-h-[200px] rounded-lg overflow-hidden border border-white/5 shadow-2xl relative z-10 bg-black group flex items-center justify-center">
            <video ref={videoRef} className="plyr-react h-full w-full block" crossOrigin="anonymous" playsInline />
        </div>
    );
});

PlyrPlayer.displayName = 'PlyrPlayer';

export default PlyrPlayer;
