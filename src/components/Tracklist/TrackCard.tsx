import React from "react"
import { Play, Pause } from "lucide-react"
import { Track } from "../../types"
import { CoverArt } from "../UI/CoverArt"

interface TrackCardProps {
	track: Track
	isPlaying: boolean
	isActive: boolean
	isLoading: boolean
	onClick: () => void
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, isPlaying, isActive, isLoading, onClick }) => {
	const formatDuration = (seconds: number): string => {
		const mins = Math.floor(seconds / 60)
		const secs = Math.floor(seconds % 60)
		return `${mins}:${secs.toString().padStart(2, "0")}`
	}

	const parseGenres = (genreString: string): string[] => {
		return genreString
			.split(",")
			.map((g) => g.trim())
			.filter(Boolean)
	}

	return (
		<div
			style={{ "--player-accent": track.dominant_color_2, "--player-accent_rgb": `rgb(${track.dominant_color_2})`, "--player-accent-complement_rgb": `rgb(${track.complementary_color_2})`, "--player-accent-complement": track.complementary_color_2 } as React.CSSProperties}
			className={`track-card bg-black/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer border border-gray-800/50 hover:border-gray-700/70 ${isActive ? "active" : ""}`}
			onClick={onClick}
			role="button"
			tabIndex={0}
			aria-label={`Play ${track.title} by ${track.artist}`}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault()
					onClick()
				}
			}}
		>
			{/* Album Art & Play Button */}
			<div className="relative mb-3 group/play w-full aspect-square overflow-hidden rounded-lg">
				<CoverArt src={track.coverart} alt={`Album cover for ${track.title}`} className={`w-full aspect-square group ${isActive ? "active" : ""}`} />

				{/* Play Overlay */}
				<div className={`absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
					<div
						className="size-48 flex items-center justify-center border backdrop-blur-sm rounded-full p-3 transform transition-transform hover:scale-110"
						style={{
							backgroundColor: `rgba(${track.dominant_color_2}, 0.1)`,
							borderColor: `rgba(${track.dominant_color_2}, 0.95)`,
							color: `rgba(${track.dominant_color_2}, 0.95)`,
						}}
					>
						{isLoading ? <div className="w-6 h-6 border-2 border-gray-600 border-t-black rounded-full animate-spin" /> : isPlaying && isActive ? <Pause className="size-24" /> : <Play className="size-24" />}
					</div>
				</div>

				{/* Track Number */}
				<div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">#{track.track_number}</div>
			</div>

			{/* Track Info */}
			<div className="space-y-2 h-[120px]">
				<h4
					className="font-semibold text-white text-sm line-clamp-2 leading-tight"
					style={{
						color: `color-mix(in srgb, rgb(${track.dominant_color_2}) 38.1%, #FFFFFF 86.5%)`,
					}}
				>
					{track.title}
				</h4>

				{/* Genre Pills */}
				<div className="flex flex-wrap gap-1">
					{parseGenres(track.genre)
						.slice(0, 3)
						.map((genre, index) => (
							<span
								key={index}
								className="inline-block px-2 py-1 text-xs rounded border"
								style={{
									backgroundColor: `rgba(${track.dominant_color_2}, 0.1)`,
									borderColor: `rgba(${track.dominant_color_2}, 0.95)`,
									color: `rgba(${track.dominant_color_2}, 0.95)`,
								}}
							>
								{genre}
							</span>
						))}
					{parseGenres(track.genre).length > 3 && <span className="text-xs text-gray-500">+{parseGenres(track.genre).length - 3}</span>}
				</div>

				{/* Colors */}
				<div className="hidden flex items-center text-xs text-gray-500">
					<div className="size-[30px] rounded-full" style={{ backgroundColor: `rgba(${track.dominant_color_1}, 1.0)` }}></div>
					<div className="size-[30px] rounded-full" style={{ backgroundColor: `rgba(${track.complementary_color_1}, 1.0)` }}></div>
					<div className="size-[30px] rounded-full" style={{ backgroundColor: `rgba(${track.dominant_color_2}, 1.0)` }}></div>
					<div className="size-[30px] rounded-full" style={{ backgroundColor: `rgba(${track.complementary_color_2}, 1.0)` }}></div>
					{/* <span>{track.luminance}</span> */}
				</div>

				{/* Duration */}
				<div className="flex justify-between items-center text-xs text-gray-500">
					<span>{formatDuration(track.duration)}</span>
					{/* {isActive && (
						<div className="flex items-center gap-1">
							<div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
							<span className="text-green-400">Playing</span>
						</div>
					)} */}
				</div>
			</div>
		</div>
	)
}
