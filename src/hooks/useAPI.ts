import { useState, useEffect } from "react"
import { Track, APIError } from "../types"

// const API_URL = 'https://unstablepersonal-songs.hf.space/api/music';
const API_URL = "https://sebastiankay-my-ai-songs.hf.space/api/music"
// const API_URL = "http://127.0.0.1:7866/api/music"
const RETRY_DELAYS = [1000, 2000, 4000, 8000] // Exponential backoff

export function useAPI() {
	const [tracks, setTracks] = useState<Track[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<APIError | null>(null)
	const [retryCount, setRetryCount] = useState(0)

	const fetchTracks = async (attempt = 0): Promise<void> => {
		try {
			setLoading(true)
			setError(null)

			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

			const response = await fetch(API_URL, {
				signal: controller.signal,
				headers: {
					Accept: "application/json",
					"Cache-Control": "no-cache",
				},
			})

			clearTimeout(timeoutId)

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`)
			}

			const data = await response.json()

			if (!Array.isArray(data)) {
				throw new Error("Invalid API response format")
			}

			const validTracks = data.filter((track) => track && typeof track === "object" && track.title && track.audiofile && track.coverart)

			if (validTracks.length === 0) {
				throw new Error("No valid tracks found in API response")
			}

			setTracks(validTracks)
			setRetryCount(0)
		} catch (err) {
			console.error("API fetch error:", err)

			const apiError: APIError = {
				message: err instanceof Error ? err.message : "Unknown error occurred",
				code: err instanceof Error && "status" in err ? (err as any).status : undefined,
				retryable: attempt < RETRY_DELAYS.length - 1,
			}

			setError(apiError)

			// Auto-retry with exponential backoff
			if (attempt < RETRY_DELAYS.length - 1) {
				setRetryCount(attempt + 1)
				const delay = RETRY_DELAYS[attempt]
				setTimeout(() => {
					fetchTracks(attempt + 1)
				}, delay)
			}
		} finally {
			setLoading(false)
		}
	}

	const retry = () => {
		setRetryCount(0)
		fetchTracks(0)
	}

	useEffect(() => {
		fetchTracks(0)
	}, [])

	return {
		tracks,
		loading,
		error,
		retry,
		retryCount,
		isRetrying: retryCount > 0,
	}
}
