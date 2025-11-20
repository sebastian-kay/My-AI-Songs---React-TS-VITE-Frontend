import { useState, useRef, useCallback, useEffect } from "react"
import { Track, AudioState, PlayerState } from "../types"
import { audioCache } from "../utils/audioCache"
import { updateCSSColors } from "../utils/colorUtils"
import { useLocalStorage } from "./useLocalStorage"

export function useAudioPlayer() {
	const audioRef = useRef<HTMLAudioElement>(new Audio())
	const [volume, setVolumeStorage] = useLocalStorage<number>("player-volume", 70)

	const [audioState, setAudioState] = useState<AudioState>({
		isPlaying: false,
		currentTime: 0,
		duration: 0,
		volume: volume,
		isMuted: false,
		isLoading: false,
		error: null,
	})

	const [playerState, setPlayerState] = useState<PlayerState>({
		currentTrack: null,
		tracks: [],
		currentIndex: -1,
		isExpanded: false,
		repeatMode: "none",
		isShuffled: false,
		queue: [],
	})

	const updateAudioTime = useCallback(() => {
		const audio = audioRef.current
		if (audio) {
			setAudioState((prev) => ({
				...prev,
				currentTime: audio.currentTime,
				duration: audio.duration || 0,
			}))
		}
	}, [])

	const handleAudioError = useCallback((error: string) => {
		setAudioState((prev) => ({ ...prev, error, isLoading: false, isPlaying: false }))
		console.error("Audio error:", error)
	}, [])

	const loadTrack = useCallback(
		async (track: Track) => {
			try {
				setAudioState((prev) => ({ ...prev, isLoading: true, error: null }))

				const audio = audioRef.current
				audio.pause()

				// Cache the audio file
				const cachedUrl = await audioCache.cacheAudio(track.audiofile)
				audio.src = cachedUrl

				// Pre-load the audio
				await new Promise((resolve, reject) => {
					const onCanPlay = () => {
						audio.removeEventListener("canplay", onCanPlay)
						audio.removeEventListener("error", onError)
						resolve(void 0)
					}

					const onError = () => {
						audio.removeEventListener("canplay", onCanPlay)
						audio.removeEventListener("error", onError)
						reject(new Error("Failed to load audio"))
					}

					audio.addEventListener("canplay", onCanPlay)
					audio.addEventListener("error", onError)
					audio.load()
				})

				// Update theme colors
				updateCSSColors(track.dominant_color_1, track.complementary_color_1)

				setAudioState((prev) => ({
					...prev,
					isLoading: false,
					currentTime: 0,
					duration: audio.duration || 0,
				}))
			} catch (error) {
				handleAudioError(error instanceof Error ? error.message : "Failed to load track")
			}
		},
		[handleAudioError]
	)

	const play = useCallback(async () => {
		try {
			const audio = audioRef.current
			await audio.play()
			setAudioState((prev) => ({ ...prev, isPlaying: true, error: null }))
		} catch (error) {
			handleAudioError(error instanceof Error ? error.message : "Failed to play audio")
		}
	}, [handleAudioError])

	const pause = useCallback(() => {
		const audio = audioRef.current
		audio.pause()
		setAudioState((prev) => ({ ...prev, isPlaying: false }))
	}, [])

	const togglePlay = useCallback(() => {
		if (audioState.isPlaying) {
			pause()
		} else {
			play()
		}
	}, [audioState.isPlaying, play, pause])

	const seek = useCallback(
		(time: number) => {
			const audio = audioRef.current
			if (audio && isFinite(time)) {
				audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0))
				updateAudioTime()
			}
		},
		[updateAudioTime]
	)

	const setVolume = useCallback(
		(newVolume: number) => {
			const clampedVolume = Math.max(0, Math.min(100, newVolume))
			const audio = audioRef.current
			audio.volume = clampedVolume / 100

			setAudioState((prev) => ({ ...prev, volume: clampedVolume, isMuted: false }))
			setVolumeStorage(clampedVolume)
		},
		[setVolumeStorage]
	)

	const toggleMute = useCallback(() => {
		const audio = audioRef.current
		const newMutedState = !audioState.isMuted

		audio.muted = newMutedState
		setAudioState((prev) => ({ ...prev, isMuted: newMutedState }))
	}, [audioState.isMuted])

	const setTracks = useCallback((tracks: Track[]) => {
		setPlayerState((prev) => ({
			...prev,
			tracks,
			queue: tracks.map((_, index) => index),
		}))
	}, [])

	const playTrack = useCallback(
		async (track: Track, index: number) => {
			setPlayerState((prev) => ({ ...prev, currentTrack: track, currentIndex: index }))
			await loadTrack(track)
			await play()
		},
		[loadTrack, play]
	)

	const nextTrack = useCallback(() => {
		if (playerState.tracks.length === 0) return

		let nextIndex: number

		if (playerState.isShuffled) {
			const availableIndices = playerState.queue.filter((i) => i !== playerState.currentIndex)
			nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
		} else {
			nextIndex = (playerState.currentIndex + 1) % playerState.tracks.length
		}

		const nextTrack = playerState.tracks[nextIndex]
		if (nextTrack) {
			playTrack(nextTrack, nextIndex)
		}
	}, [playerState, playTrack])

	const previousTrack = useCallback(() => {
		if (playerState.tracks.length === 0) return

		let prevIndex: number

		if (playerState.isShuffled) {
			const availableIndices = playerState.queue.filter((i) => i !== playerState.currentIndex)
			prevIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
		} else {
			prevIndex = playerState.currentIndex - 1
			if (prevIndex < 0) prevIndex = playerState.tracks.length - 1
		}

		const prevTrack = playerState.tracks[prevIndex]
		if (prevTrack) {
			playTrack(prevTrack, prevIndex)
		}
	}, [playerState, playTrack])

	const toggleShuffle = useCallback(() => {
		setPlayerState((prev) => ({ ...prev, isShuffled: !prev.isShuffled }))
	}, [])

	const toggleRepeat = useCallback(() => {
		setPlayerState((prev) => ({
			...prev,
			repeatMode: prev.repeatMode === "none" ? "all" : prev.repeatMode === "all" ? "one" : "none",
		}))
	}, [])

	const toggleExpanded = useCallback(() => {
		setPlayerState((prev) => ({ ...prev, isExpanded: !prev.isExpanded }))
	}, [])

	// Audio event listeners
	useEffect(() => {
		const audio = audioRef.current

		const handleTimeUpdate = () => updateAudioTime()
		const handleEnded = () => {
			if (playerState.repeatMode === "one") {
				seek(0)
				play()
			} else if (playerState.repeatMode === "all" || playerState.currentIndex < playerState.tracks.length - 1) {
				nextTrack()
			} else {
				setAudioState((prev) => ({ ...prev, isPlaying: false }))
			}
		}

		const handleLoadedData = () => updateAudioTime()
		const handleError = () => handleAudioError("Audio playback error")

		audio.addEventListener("timeupdate", handleTimeUpdate)
		audio.addEventListener("ended", handleEnded)
		audio.addEventListener("loadeddata", handleLoadedData)
		audio.addEventListener("error", handleError)

		// Set initial volume
		audio.volume = volume / 100

		return () => {
			audio.removeEventListener("timeupdate", handleTimeUpdate)
			audio.removeEventListener("ended", handleEnded)
			audio.removeEventListener("loadeddata", handleLoadedData)
			audio.removeEventListener("error", handleError)
		}
	}, [volume, playerState.repeatMode, playerState.currentIndex, playerState.tracks.length, updateAudioTime, handleAudioError, seek, play, nextTrack])

	// Pre-load adjacent tracks
	useEffect(() => {
		if (playerState.currentTrack && playerState.tracks.length > 1) {
			const nextIndex = (playerState.currentIndex + 1) % playerState.tracks.length
			const prevIndex = playerState.currentIndex - 1 >= 0 ? playerState.currentIndex - 1 : playerState.tracks.length - 1

			if (playerState.tracks[nextIndex]) {
				audioCache.preloadTrack(playerState.tracks[nextIndex].audiofile)
			}
			if (playerState.tracks[prevIndex]) {
				audioCache.preloadTrack(playerState.tracks[prevIndex].audiofile)
			}
		}
	}, [playerState.currentTrack, playerState.currentIndex, playerState.tracks])

	return {
		audioState,
		playerState,
		play,
		pause,
		togglePlay,
		seek,
		setVolume,
		toggleMute,
		setTracks,
		playTrack,
		nextTrack,
		previousTrack,
		toggleShuffle,
		toggleRepeat,
		toggleExpanded,
		// Keyboard shortcut helpers
		seekForward: () => seek(audioState.currentTime + 10),
		seekBackward: () => seek(audioState.currentTime - 10),
		volumeUp: () => setVolume(audioState.volume + 10),
		volumeDown: () => setVolume(audioState.volume - 10),
	}
}
