import React from "react"
import { MainPlayer } from "./components/Player/MainPlayer"
import { TrackGrid } from "./components/Tracklist/TrackGrid"
import { ErrorBoundary } from "./components/UI/ErrorBoundary"
import { PlayerSkeleton } from "./components/UI/LoadingSkeleton"
import TitleWithGradient from "./components/UI/TitleWithGradient"
import { useAudioPlayer } from "./hooks/useAudioPlayer"
import { useAPI } from "./hooks/useAPI"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react"

function App() {
	const { audioState, playerState, togglePlay, seek, setVolume, toggleMute, setTracks, playTrack, nextTrack, previousTrack, toggleShuffle, toggleRepeat, toggleExpanded, seekForward, seekBackward, volumeUp, volumeDown } = useAudioPlayer()

	const { tracks, loading, error, retry, isRetrying } = useAPI()

	// Set tracks when API data is loaded
	React.useEffect(() => {
		if (tracks.length > 0) {
			setTracks(tracks)
		}
	}, [tracks, setTracks])

	// Keyboard shortcuts
	useKeyboardShortcuts({
		onTogglePlay: togglePlay,
		onSeekForward: seekForward,
		onSeekBackward: seekBackward,
		onVolumeUp: volumeUp,
		onVolumeDown: volumeDown,
		onToggleMute: toggleMute,
		onNextTrack: nextTrack,
		onPreviousTrack: previousTrack,
		isPlaying: audioState.isPlaying,
	})

	// Online/offline detection
	const [isOnline, setIsOnline] = React.useState(navigator.onLine)

	React.useEffect(() => {
		const handleOnline = () => setIsOnline(true)
		const handleOffline = () => setIsOnline(false)

		window.addEventListener("online", handleOnline)
		window.addEventListener("offline", handleOffline)

		return () => {
			window.removeEventListener("online", handleOnline)
			window.removeEventListener("offline", handleOffline)
		}
	}, [])

	// Error state
	if (error && !isRetrying) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="max-w-md w-full">
					<div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-6 text-center">
						<div className="flex items-center justify-center mb-4">{!isOnline ? <WifiOff className="w-12 h-12 text-red-400" /> : <AlertCircle className="w-12 h-12 text-red-400" />}</div>

						<h2 className="text-xl font-semibold text-white mb-2">{!isOnline ? "You're Offline" : "Connection Error"}</h2>

						<p className="text-gray-400 mb-4">{!isOnline ? "Please check your internet connection" : error.message}</p>

						{error.retryable && (
							<button onClick={retry} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900" aria-label="Retry loading tracks">
								<RefreshCw className="w-4 h-4" />
								Try Again
							</button>
						)}
					</div>
				</div>
			</div>
		)
	}

	return (
		<ErrorBoundary>
			<div className="min-h-screen">
				{/* Offline Indicator */}
				{!isOnline && (
					<div className="offline-indicator">
						<div className="flex items-center justify-center gap-2">
							<WifiOff className="w-4 h-4" />
							You're currently offline
						</div>
					</div>
				)}

				{/* Fixed Main Player */}
				{loading ? (
					<div className={`fixed-player bg-gray-900/50 backdrop-blur-sm ${!isOnline ? "top-10" : ""}`}>
						<div className="container mx-auto px-4 py-6 h-full flex items-center justify-center">
							<PlayerSkeleton />
						</div>
					</div>
				) : (
					<MainPlayer
						currentTrack={playerState.currentTrack}
						audioState={audioState}
						playerState={playerState}
						onTogglePlay={togglePlay}
						onPrevious={previousTrack}
						onNext={nextTrack}
						onSeek={seek}
						onVolumeChange={setVolume}
						onToggleMute={toggleMute}
						onToggleRepeat={toggleRepeat}
						onToggleShuffle={toggleShuffle}
						onToggleExpanded={toggleExpanded}
						className={!isOnline ? "top-10" : ""}
						playerExpanded={false}
					/>
				)}

				{/* Content Spacer */}
				<div
					className={`h-1 md:h-(--player-height-expanded) md:h-(--player-height-collapsed) md:h-(--player-height-${playerState.isExpanded ? "expanded" : "collapsed"}) transition-all duration-300 ease-in-out ${!isOnline ? "top-10" : ""}`}
					style={{
						height: `var(${playerState.isExpanded ? "--player-height-expanded" : "--player-height-collapsed"})`,
					}}
				/>

				{/* Main Content */}
				<div className="container-fluid lg:container mx-auto px-4 py-6 space-y-8">
					{/* Header */}
					<header className="text-center">
						<TitleWithGradient headline="A.I. Songs" className="my-special-header" />

						{/* Keyboard shortcuts hint */}
						<div className="keyboard-shortcuts mt-4 text-xs text-gray-500">
							<span className="inline-block border bg-gray-800 px-2 py-1 rounded mr-2">Leertaste</span>
							PLAY/PAUSE
							<span className="dot mx-4">•</span>
							<span className="inline-block border bg-gray-800 px-2 py-1 rounded mr-2">←→</span>
							SUCHEN ±10s
							<span className="dot mx-4">•</span>
							<span className="inline-block border bg-gray-800 px-2 py-1 rounded mr-2">↑↓</span>
							LAUTSTÄRKE
							<span className="dot mx-4">•</span>
							<span className="inline-block border bg-gray-800 px-2 py-1 rounded mr-2">M</span>
							Mute
						</div>
					</header>

					{/* Track Grid */}
					<section aria-label="Track List">
						<div className="mb-6">
							<h2 className="text-2xl font-bold text-white mb-2">All Tracks</h2>
							<p className="text-gray-400">
								{!loading && tracks.length > 0 && `${tracks.length} tracks available`}
								{isRetrying && " • Retrying..."}
							</p>
						</div>

						<TrackGrid tracks={tracks} currentTrack={playerState.currentTrack} isPlaying={audioState.isPlaying} isLoading={loading} onTrackSelect={playTrack} />
					</section>

					{/* Footer */}
					<footer className="text-center text-gray-500 text-sm py-8">
						<div className="flex items-center justify-center gap-2 mb-2"></div>
						<p className="mb-4">
							Made with ♥️ by{" "}
							<a href="https://hf.co/sebastiankay" target="_blank" rel="noopener noreferrer">
								Sebastian Kay
							</a>{" "}
						</p>
						<p className="text-xs mb-1">using React, TypeScript, and Wavesurfer.js</p>
						<p className="text-sm mb-3">Why this shit? That's because I wanted to learn and I love music.</p>
					</footer>
				</div>
			</div>
		</ErrorBoundary>
	)
}

export default App
