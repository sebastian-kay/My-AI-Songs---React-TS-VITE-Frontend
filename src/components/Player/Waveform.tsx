import React, { useCallback, useEffect, useRef } from "react"
import { useWavesurfer } from "@wavesurfer/react"

interface WaveformProps {
	audioUrl?: string
	isPlaying: boolean
	onSeek: (time: number) => void
	currentTime: number
	duration: number
	className?: string
}

export const Waveform: React.FC<WaveformProps> = ({ audioUrl, isPlaying, onSeek, currentTime, duration, className = "" }) => {
	const containerRef = useRef<HTMLDivElement>(null)

	const { wavesurfer, isReady } = useWavesurfer({
		container: containerRef,
		height: 80,
		waveColor: "rgba(255, 255, 255, 0.3)",
		progressColor: "rgb(var(--player-accent))",
		cursorColor: "rgb(var(--player-accent-complement))",
		barWidth: 6,
		barRadius: 3,
		barGap: 4,
		responsive: true,
		normalize: true,
		backend: "WebAudio",
		mediaControls: false,
		interact: true,
		hideScrollbar: true,
	})

	// Load audio when URL changes
	useEffect(() => {
		if (wavesurfer && audioUrl) {
			wavesurfer.load(audioUrl)
		}
	}, [wavesurfer, audioUrl])

	// Handle seeking
	const handleSeek = useCallback(
		(time: number) => {
			if (wavesurfer && isReady) {
				const seekTime = time * duration
				wavesurfer.seekTo(time)
				onSeek(seekTime)
			}
		},
		[wavesurfer, isReady, duration, onSeek]
	)

	// Set up event listeners
	useEffect(() => {
		if (!wavesurfer) return

		const handleInteraction = () => {
			const currentProgress = wavesurfer.getCurrentTime() / wavesurfer.getDuration()
			handleSeek(currentProgress)
		}

		const handleReady = () => {
			// Sync with current playback position
			if (duration > 0 && currentTime > 0) {
				wavesurfer.seekTo(currentTime / duration)
			}
		}

		wavesurfer.on("interaction", handleInteraction)
		wavesurfer.on("ready", handleReady)

		return () => {
			wavesurfer.un("interaction", handleInteraction)
			wavesurfer.un("ready", handleReady)
		}
	}, [wavesurfer, handleSeek, currentTime, duration])

	// Sync playback position
	useEffect(() => {
		if (wavesurfer && isReady && duration > 0) {
			const progress = currentTime / duration
			if (Math.abs(wavesurfer.getCurrentTime() - currentTime) > 1) {
				wavesurfer.seekTo(progress)
			}
		}
	}, [wavesurfer, isReady, currentTime, duration])

	// Update colors when theme changes
	useEffect(() => {
		if (wavesurfer && isReady) {
			const accent = getComputedStyle(document.documentElement).getPropertyValue("--player-accent")
			const complement = getComputedStyle(document.documentElement).getPropertyValue("--player-accent-complement")

			if (accent && complement) {
				wavesurfer.setOptions({
					progressColor: `rgb(${accent})`,
					cursorColor: `rgb(${complement})`,
				})
			}
		}
	}, [wavesurfer, isReady])

	return (
		<div
			className={`wavesurfer-container ${className}`}
			role="slider"
			aria-label="Audio waveform"
			aria-valuemin={0}
			aria-valuemax={duration}
			aria-valuenow={currentTime}
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "ArrowLeft") {
					e.preventDefault()
					onSeek(Math.max(0, currentTime - 10))
				} else if (e.key === "ArrowRight") {
					e.preventDefault()
					onSeek(Math.min(duration, currentTime + 10))
				}
			}}
		>
			<div ref={containerRef} className="w-full" />
			{!isReady && (
				<div className="flex items-center justify-center h-20 text-gray-400">
					<div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-400 border-t-transparent" />
					<span className="ml-2 text-sm">Loading waveform...</span>
				</div>
			)}
		</div>
	)
}
