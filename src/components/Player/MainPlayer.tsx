import React, { useEffect } from "react"
import { Track, AudioState, PlayerState } from "../../types"
import { PlayerControls } from "./PlayerControls"
import { Waveform } from "./Waveform"
import { CoverArt } from "../UI/CoverArt"

interface MainPlayerProps {
	currentTrack: Track | null
	playerExpanded: boolean | false
	audioState: AudioState
	playerState: PlayerState
	onTogglePlay: () => void
	onPrevious: () => void
	onNext: () => void
	onSeek: (time: number) => void
	onVolumeChange: (volume: number) => void
	onToggleMute: () => void
	onToggleRepeat: () => void
	onToggleShuffle: () => void
	onToggleExpanded: () => void
	className?: string
}

export const MainPlayer: React.FC<MainPlayerProps> = ({ currentTrack, audioState, playerState, onTogglePlay, onPrevious, onNext, onSeek, onVolumeChange, onToggleMute, onToggleRepeat, onToggleShuffle, onToggleExpanded, className = "" }) => {
	// Handle body scroll locking on mobile when expanded
	useEffect(() => {
		const isMobile = window.innerWidth <= 768
		if (isMobile) {
			if (playerState.isExpanded) {
				document.body.classList.add("player-expanded-mobile")
			} else {
				document.body.classList.remove("player-expanded-mobile")
			}
		}

		return () => {
			document.body.classList.remove("player-expanded-mobile")
		}
	}, [playerState.isExpanded])

	if (!currentTrack) {
		return (
			<div className={`fixed-player bg-gray-900/50 backdrop-blur-sm ${className}`}>
				<div className="container mx-auto px-4 py-6 h-full flex items-center justify-center">
					<div className="text-center">
						{/* <CoverArt alt="No track selected" size="small" className="mx-auto mb-4" /> */}
						<p className="text-gray-400">Select a track to start playing</p>
					</div>
				</div>
			</div>
		)
	}

	const parseGenres = (genreString: string): string[] => {
		return genreString
			.split(",")
			.map((g) => g.trim())
			.filter(Boolean)
	}

	const percent = Math.min((audioState.currentTime / audioState.duration) * 100, 100).toFixed(2)
	const style = {
		background: `linear-gradient(
    to right,
    rgb(var(--player-accent)) 0%,
    rgb(var(--player-accent)) ${percent}%,
    transparent ${percent}%,
    transparent 100%
  )`,
		backgroundRepeat: "no-repeat",
	}
	return (
		<div className={`fixed-player relative md:fixed ${playerState.isExpanded ? "expanded" : ""} ${className}`}>
			<div className="relative h-full overflow-hidden">
				{/* Background blur effect */}
				{currentTrack.coverart && (
					<>
						<div
							className="background-blur"
							style={{
								backgroundImage: `url(${currentTrack.coverart})`,
							}}
							aria-hidden="true"
						/>
						<div className="background-overlay" aria-hidden="true" />
						<div className="background-overlay-border" style={style} aria-hidden="true" />
						{/* audioState.duration > 0 ? formatTime(audioState.currentTime) : '0:00' */}
					</>
				)}

				<div className="relative z-10 container-fluid lg:container mx-auto px-4 py-6 h-full">
					{playerState.isExpanded ? (
						// Expanded Player
						<div className="h-full flex flex-col justify-center space-y-6">
							{/* Track Info */}
							<div className="eins flex flex-col md:flex-row items-center md:items-end gap-6 mb-6">
								<div className="">
									<CoverArt src={currentTrack.coverart} alt={`Album cover for ${currentTrack.title}`} size="large" className="h-[200px] md:h-[250px] mx-auto shadow-2xl" />
								</div>

								<div className="space-y-4 flex-1 w-full">
									<div className="space-y-2 items-start">
										<h1 className="text-4xl text-center md:text-left md:text-2xl lg:text-2xl font-bold text-white truncate px-4 md:px-0">{currentTrack.title}</h1>

										{/* Genre Pills */}
										<div className="flex flex-wrap gap-2 mt-3 mb-3 px-4 md:px-0 justify-center md:justify-start">
											{parseGenres(currentTrack.genre).map((genre, index) => (
												<span
													key={index}
													className="genre-pill color-transition"
													style={{
														backgroundColor: `rgba(var(--player-accent), 0.2)`,
														borderColor: `rgb(var(--player-accent))`,
														color: `rgb(var(--player-accent))`,
													}}
												>
													{genre}
												</span>
											))}
										</div>
										{/* Waveform - only on desktop expanded mode */}
										{/* {audioState.duration > 0 && window.innerWidth > 768 && (
											<div className="px-4 flex-shrink-0 max-w-4xl w-full mt-4">
												<Waveform audioUrl={currentTrack.audiofile} isPlaying={audioState.isPlaying} onSeek={onSeek} currentTime={audioState.currentTime} duration={audioState.duration} className="mb-4" />
											</div>
										)} */}
										{/* Controls */}
										<div className="flex-1 mx-auto w-full">
											<PlayerControls playerExpanded={playerState.isExpanded} audioState={audioState} playerState={playerState} onTogglePlay={onTogglePlay} onPrevious={onPrevious} onNext={onNext} onSeek={onSeek} onVolumeChange={onVolumeChange} onToggleMute={onToggleMute} onToggleRepeat={onToggleRepeat} onToggleShuffle={onToggleShuffle} onToggleExpanded={onToggleExpanded} />
										</div>
									</div>
								</div>
							</div>
						</div>
					) : (
						// Collapsed Player
						<div className="h-full flex items-center">
							<div className="flex flex-row w-full">
								{/* Compact Track Info */}
								<div className="flex items-center gap-4">
									<CoverArt src={currentTrack.coverart} alt={`Album cover for ${currentTrack.title}`} size="small" className="coverart-mainplayer flex-shrink-0 shadow-lg" />
									<div className="hidden md:flex flex-1 min-w-0">
										<h2
											className="text-xs md:text-sm md:text-base lg:text-md font-semibold truncate w-[120px] md:w-[180px] xl:w-[300px]"
											style={{
												color: `color-mix(in srgb, rgb(var(--player-accent)) 38.1%, #FFFFFF 46.5%)`,
											}}
										>
											{currentTrack.title}
										</h2>
									</div>
								</div>

								{/* Minimal Controls */}
								<PlayerControls playerExpanded={playerState.isExpanded} audioState={audioState} playerState={playerState} onTogglePlay={onTogglePlay} onPrevious={onPrevious} onNext={onNext} onSeek={onSeek} onVolumeChange={onVolumeChange} onToggleMute={onToggleMute} onToggleRepeat={onToggleRepeat} onToggleShuffle={onToggleShuffle} onToggleExpanded={onToggleExpanded} />
							</div>
						</div>
					)}

					{/* Error Display */}
					{audioState.error && (
						<div className="absolute bottom-4 left-4 right-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
							<p className="text-red-200 text-sm">{audioState.error}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
