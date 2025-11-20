import React from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle, ChevronUp, ChevronDown } from "lucide-react"
import { AudioState, PlayerState } from "../../types"

interface PlayerControlsProps {
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

export const PlayerControls: React.FC<PlayerControlsProps> = ({ audioState, playerState, playerExpanded, onTogglePlay, onPrevious, onNext, onSeek, onVolumeChange, onToggleMute, onToggleRepeat, onToggleShuffle, onToggleExpanded, className = "" }) => {
	const formatTime = (seconds: number): string => {
		if (!isFinite(seconds)) return "0:00"
		const mins = Math.floor(seconds / 60)
		const secs = Math.floor(seconds % 60)
		return `${mins}:${secs.toString().padStart(2, "0")}`
	}

	const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const progress = parseFloat(e.target.value)
		const time = (progress / 100) * audioState.duration
		onSeek(time)
	}

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onVolumeChange(parseInt(e.target.value))
	}

	const progress = audioState.duration > 0 ? (audioState.currentTime / audioState.duration) * 100 : 0

	return (
		<div className={`flex flex-row justify-center md:w-full md:justify-center ${className}`}>
			{playerExpanded ? (
				<div className={`space-y-4 ${className}`}>
					<div className={`flex flex-wrap justify-center md:justify-start flex-row gap-3 space-y-0 ${className}`}>
						{/* Main Controls */}
						<div className="flex flex-row gap-2">
							{/* Shuffle */}
							<button onClick={onToggleShuffle} className={`p-2 rounded-full transition-all hover:scale-110 ${playerState.isShuffled ? "text-[rgb(var(--player-accent))]" : "text-gray-400 hover:text-white"}`} aria-label={playerState.isShuffled ? "Disable shuffle" : "Enable shuffle"} aria-pressed={playerState.isShuffled}>
								<Shuffle className="h-6 aspect-square" />
							</button>

							{/* Previous */}
							<button onClick={onPrevious} className="p-3 rounded-full text-white hover:bg-gray-700 transition-all hover:scale-110" disabled={playerState.tracks.length <= 1} aria-label="Previous track">
								<SkipBack className="h-6 aspect-square" />
							</button>

							{/* Play/Pause */}
							<button onClick={onTogglePlay} disabled={audioState.isLoading || !playerState.currentTrack} className="p-3 rounded-full bg-white text-black hover:bg-gray-200 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" aria-label={audioState.isPlaying ? "Pause" : "Play"}>
								{audioState.isLoading ? <div className="w-6 h-6 border-2 border-gray-400 border-t-black rounded-full animate-spin" /> : audioState.isPlaying ? <Pause className="h-5 aspect-square" /> : <Play className="h-5 aspect-square" />}
							</button>

							{/* Next */}
							<button onClick={onNext} className="p-3 rounded-full text-white hover:bg-gray-700 transition-all hover:scale-110" disabled={playerState.tracks.length <= 1} aria-label="Next track">
								<SkipForward className="h-6 aspect-square" />
							</button>

							{/* Repeat */}
							<button onClick={onToggleRepeat} className={`p-2 rounded-full transition-all hover:scale-110 ${playerState.repeatMode !== "none" ? "text-white bg-blue-600" : "text-gray-400 hover:text-white"}`} aria-label={`Repeat mode: ${playerState.repeatMode}`} aria-pressed={playerState.repeatMode !== "none"}>
								{playerState.repeatMode === "one" ? <Repeat1 className="h-6 aspect-square" /> : <Repeat className="h-6 aspect-square" />}
							</button>
						</div>

						{/* Volume Control */}
						<div className="flex items-center gap-3">
							<button onClick={onToggleMute} className="p-2 text-gray-400 hover:text-white transition-colors" aria-label={audioState.isMuted ? "Unmute" : "Mute"}>
								{audioState.isMuted || audioState.volume === 0 ? <VolumeX className="h-6 aspect-square" /> : <Volume2 className="h-6 aspect-square" />}
							</button>

							<div className="flex-1 max-w-32 md:max-w-16 lg:max-w-32">
								<input
									type="range"
									min="0"
									max="100"
									value={audioState.isMuted ? 0 : audioState.volume}
									onChange={handleVolumeChange}
									className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
									style={{
										background: `linear-gradient(to right, rgb(var(--player-accent)) ${audioState.isMuted ? 0 : audioState.volume}%, rgba(0, 0, 0, 0.64) ${audioState.isMuted ? 0 : audioState.volume}%)`,
									}}
									aria-label="Volume"
								/>
							</div>

							<span className="text-xs font-mono text-gray-400 w-8">{audioState.isMuted ? "0" : audioState.volume}</span>
						</div>

						{/* Expand/Collapse Button */}
						<div className="flex justify-center">
							<button onClick={onToggleExpanded} className="p-2 text-gray-400 hover:text-white transition-all hover:scale-110" aria-label={playerState.isExpanded ? "Collapse player" : "Expand player"} aria-expanded={playerState.isExpanded}>
								{playerState.isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
							</button>
						</div>
					</div>

					{/* Progress Bar */}
					<div className="space-y-2">
						<div className="relative">
							<input
								type="range"
								min="0"
								max="100"
								value={progress}
								onChange={handleProgressChange}
								className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
								style={{
									background: `linear-gradient(to right, rgb(var(--player-accent)) ${progress}%, rgba(0, 0, 0, 0.64) ${progress}%)`,
								}}
								disabled={audioState.duration === 0}
								aria-label="Seek audio position"
							/>
						</div>
						<div className="flex justify-between text-xs font-mono text-gray-400">
							<span>{formatTime(audioState.currentTime)}</span>
							<span>{formatTime(audioState.duration)}</span>
						</div>
					</div>
				</div>
			) : (
				<div className={`flex flex-row w-full justify-center ${className}`}>
					<div className={`flex flex-row w-full justify-center gap-2 ${className}`}>
						{/* Main Controls */}
						<div className="flex ml-3 flex-row items-center gap-1">
							{/* Shuffle */}
							<button
								onClick={onToggleShuffle}
								className={`flex justify-center items-center rounded-full transition-all hover:scale-110 size-8 ${playerState.isShuffled ? "text-(--player-accent)" : "text-gray-400 hover:text-white"}`}
								style={{
									color: `${playerState.isShuffled ? "rgba(var(--player-accent), 0.95)" : "inherit"}`,
								}}
								aria-label={playerState.isShuffled ? "Disable shuffle" : "Enable shuffle"}
								aria-pressed={playerState.isShuffled}
							>
								<Shuffle className="w-5 h-5" />
							</button>

							{/* Previous */}
							<button onClick={onPrevious} className="flex justify-center items-center rounded-full text-white hover:text-(--player-accent) transition-all hover:scale-110 size-8" disabled={playerState.tracks.length <= 1} aria-label="Previous track">
								<SkipBack className="w-5 h-5" />
							</button>

							{/* Play/Pause */}
							<button
								onClick={onTogglePlay}
								disabled={audioState.isLoading || !playerState.currentTrack}
								className="flex items-center justify-center p-4 rounded-full border hover:bg-gray-200 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed size-16"
								style={{
									backgroundColor: "rgba(var(--player-accent), 0.1)",
									borderColor: "rgba(var(--player-accent), 0.95)",
									color: "rgba(var(--player-accent), 0.95)",
								}}
								aria-label={audioState.isPlaying ? "Pause" : "Play"}
							>
								{audioState.isLoading ? <div className="w-6 h-6 border-2 border-gray-400 border-t-black rounded-full animate-spin" /> : audioState.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
							</button>

							{/* Next */}
							<button onClick={onNext} className="p-3 rounded-full text-white hover:bg-gray-700 transition-all hover:scale-110  size-10" disabled={playerState.tracks.length <= 1} aria-label="Next track">
								<SkipForward className="w-5 h-5" />
							</button>

							{/* Repeat */}
							<button onClick={onToggleRepeat} className={`p-2 rounded-full transition-all hover:scale-110 size-10 ${playerState.repeatMode !== "none" ? "text-white bg-blue-600" : "text-gray-400 hover:text-white"}`} aria-label={`Repeat mode: ${playerState.repeatMode}`} aria-pressed={playerState.repeatMode !== "none"}>
								{playerState.repeatMode === "one" ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
							</button>
						</div>

						{/* Volume Control */}
						<div className="flex items-center gap-1">
							<button onClick={onToggleMute} className="p-2 text-gray-400 hover:text-white transition-colors" aria-label={audioState.isMuted ? "Unmute" : "Mute"}>
								{audioState.isMuted || audioState.volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
							</button>

							<div className="flex flex-1 align-center min-w-32">
								<input
									type="range"
									min="0"
									max="100"
									value={audioState.isMuted ? 0 : audioState.volume}
									onChange={handleVolumeChange}
									className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
									style={{
										background: `linear-gradient(to right, rgb(var(--player-accent)) ${audioState.isMuted ? 0 : audioState.volume}%, rgba(0, 0, 0, 0.64) ${audioState.isMuted ? 0 : audioState.volume}%)`,
									}}
									aria-label="Volume"
								/>
							</div>

							<span className="text-xs font-mono text-gray-400 w-8">{audioState.isMuted ? "0" : audioState.volume}</span>
						</div>

						{/* Progress Bar */}
						<div className="w-full flex-row justify-center items-center hidden md:flex">
							<div className="relative w-full flex flex-row items-center justify-center gap-2">
								<div className="flex justify-between text-xs font-mono text-gray-400">
									<span>{formatTime(audioState.currentTime)}</span>
								</div>
								<input
									type="range"
									min="0"
									max="100"
									value={progress}
									onChange={handleProgressChange}
									className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
									style={{
										background: `linear-gradient(to right, rgb(var(--player-accent)) ${progress}%, rgba(0, 0, 0, 0.64) ${progress}%)`,
									}}
									disabled={audioState.duration === 0}
									aria-label="Seek audio position"
								/>

								<div className="flex justify-between text-xs font-mono text-gray-400">
									<span>{formatTime(audioState.duration)}</span>
								</div>
							</div>
							{/* <div className="flex justify-between text-xs font-mono text-gray-400">
							<span>{formatTime(audioState.currentTime)}</span>
							<span>{formatTime(audioState.duration)}</span>
						</div> */}
						</div>
					</div>

					{/* Expand/Collapse Button */}
					<div className=" absolute flex justify-center left-1/2 bottom-0 transform -translate-x-1/2">
						<button onClick={onToggleExpanded} className="p-2 text-gray-400 hover:text-white transition-all hover:scale-110" aria-label={playerState.isExpanded ? "Collapse player" : "Expand player"} aria-expanded={playerState.isExpanded}>
							{playerState.isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
