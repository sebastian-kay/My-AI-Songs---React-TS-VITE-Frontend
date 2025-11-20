import React from "react"
import { Track } from "../../types"
import { TrackCard } from "./TrackCard"
import { TrackCardSkeleton } from "../UI/LoadingSkeleton"

interface TrackGridProps {
	tracks: Track[]
	currentTrack: Track | null
	isPlaying: boolean
	isLoading: boolean
	onTrackSelect: (track: Track, index: number) => void
}

export const TrackGrid: React.FC<TrackGridProps> = ({ tracks, currentTrack, isPlaying, isLoading, onTrackSelect }) => {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{Array.from({ length: 8 }).map((_, index) => (
					<TrackCardSkeleton key={index} />
				))}
			</div>
		)
	}

	if (tracks.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-400 text-lg">No tracks available</p>
				<p className="text-gray-500 text-sm mt-2">Check your connection and try again</p>
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-8 gap-x-6" role="grid" aria-label="Music tracks">
			{tracks.map((track, index) => (
				<div key={track.encoded_title} role="gridcell">
					<TrackCard track={track} isPlaying={isPlaying && currentTrack?.encoded_title === track.encoded_title} isActive={currentTrack?.encoded_title === track.encoded_title} isLoading={false} onClick={() => onTrackSelect(track, index)} />
				</div>
			))}
		</div>
	)
}
