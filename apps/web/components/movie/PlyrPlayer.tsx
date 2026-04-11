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
                'play',
                'progress', 'current-time', 'duration', 'mute', 'volume',
                'captions', 'settings', 'pip', 'airplay', 'fullscreen'
            ],
            settings: ['quality', 'speed'],
            tooltips: { controls: true, seek: true },
            displayDuration: true,
            invertTime: false,
            toggleInvert: false,
            clickToPlay: false,
            blankVideo: 'https://cdn.plyr.io/static/blank.mp4', // Explicitly set or use an alternative
            keyboard: { focused: true, global: true },
            ...options
        };

        const cleanup = () => {
            if (playerRef.current) {
                try {
                    const player = playerRef.current;
                    if (player._customClickHandler && player._playerContainer) {
                        player._playerContainer.removeEventListener('click', player._customClickHandler);
                    }
                    if (player._customTouchHandler && player._playerContainer) {
                        player._playerContainer.removeEventListener('touchend', player._customTouchHandler);
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
                    let lastTouchEndTime = 0;
                    let clickTimeout: any = null;
                    const DOUBLE_CLICK_DELAY = 300;

                    // Use 'click' so it fires AFTER mouseup — no conflict with Plyr internals.
                    // clickToPlay:false means Plyr won't handle this event at all.
                    const handleClick = (e: MouseEvent) => {
                        if ((e.target as HTMLElement).closest('.plyr__controls') || (e.target as HTMLElement).closest('.plyr__menu')) return;
                        // Ignore synthetic click fired right after touchend
                        if (Date.now() - lastTouchEndTime < 500) return;

                        const now = Date.now();
                        if (now - lastClickTime < DOUBLE_CLICK_DELAY && now - lastClickTime > 0) {
                            // Desktop double-click → fullscreen (YouTube behaviour)
                            if (clickTimeout) { clearTimeout(clickTimeout); clickTimeout = null; }
                            player.fullscreen.toggle();
                            lastClickTime = 0;
                        } else {
                            lastClickTime = now;
                            if (clickTimeout) clearTimeout(clickTimeout);
                            clickTimeout = setTimeout(() => { player.togglePlay(); clickTimeout = null; }, DOUBLE_CLICK_DELAY);
                        }
                    };

                    // Touch: use touchend so position is accurate and no ghost click conflict
                    const handleTouchEnd = (e: TouchEvent) => {
                        if ((e.target as HTMLElement).closest('.plyr__controls') || (e.target as HTMLElement).closest('.plyr__menu')) return;
                        lastTouchEndTime = Date.now();

                        const touch = e.changedTouches?.[0];
                        const now = Date.now();
                        if (now - lastClickTime < DOUBLE_CLICK_DELAY && now - lastClickTime > 0) {
                            if (clickTimeout) { clearTimeout(clickTimeout); clickTimeout = null; }
                            if (touch) {
                                const rect = container.getBoundingClientRect();
                                const x = touch.clientX - rect.left;
                                const y = touch.clientY - rect.top;
                                if (x < rect.width / 2) {
                                    player.rewind(10);
                                    showRipple(x, y, 'backward', container);
                                } else {
                                    player.forward(10);
                                    showRipple(x, y, 'forward', container);
                                }
                            }
                            lastClickTime = 0;
                        } else {
                            lastClickTime = now;
                            if (clickTimeout) clearTimeout(clickTimeout);
                            clickTimeout = setTimeout(() => { player.togglePlay(); clickTimeout = null; }, DOUBLE_CLICK_DELAY);
                        }
                    };

                    container.addEventListener('click', handleClick);
                    container.addEventListener('touchend', handleTouchEnd, { passive: true });

                    // Store for cleanup
                    (player as any)._customClickHandler = handleClick;
                    (player as any)._customTouchHandler = handleTouchEnd;
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
