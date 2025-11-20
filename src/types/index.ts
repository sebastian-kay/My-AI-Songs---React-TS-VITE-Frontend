export interface Track {
	encoded_title: string
	title: string
	artist: string
	genre: string
	duration: number
	track_number: number
	audiofile: string
	coverart: string
	dominant_color_1: string
	complementary_color_1: string
	dominant_color_2: string
	complementary_color_2: string
}

export interface AudioState {
	isPlaying: boolean
	currentTime: number
	duration: number
	volume: number
	isMuted: boolean
	isLoading: boolean
	error: string | null
}

export interface PlayerState {
	currentTrack: Track | null
	tracks: Track[]
	currentIndex: number
	isExpanded: boolean
	repeatMode: "none" | "one" | "all"
	isShuffled: boolean
	queue: number[]
}

export interface APIError {
	message: string
	code?: number
	retryable: boolean
}

export interface CachedAudio {
	blob: Blob
	url: string
	timestamp: number
}
