import React, { useState, useRef, useEffect } from "react"

interface CoverArtProps {
	src?: string
	alt: string
	className?: string
	size?: "small" | "medium" | "large"
	showPlaceholder?: boolean
}

export const CoverArt: React.FC<CoverArtProps> = ({ src, alt, className = "", size = "medium", showPlaceholder = true }) => {
	const [imageLoaded, setImageLoaded] = useState(false)
	const [imageError, setImageError] = useState(false)
	const imgRef = useRef<HTMLImageElement>(null)

	const sizeClasses = {
		small: "w-16 h-16",
		medium: "w-32 h-32",
		large: "w-80 h-80",
	}

	useEffect(() => {
		if (src && imgRef.current) {
			setImageLoaded(false)
			setImageError(false)

			// Pre-load the image
			const img = new Image()
			img.onload = () => {
				setImageLoaded(true)
				setImageError(false)
			}
			img.onerror = () => {
				setImageLoaded(false)
				setImageError(true)
			}
			img.src = src
		} else {
			setImageLoaded(false)
			setImageError(false)
		}
	}, [src])

	const shouldShowPlaceholder = !src || imageError || !imageLoaded

	return (
		<div className={`cover-art rounded-lg ${className} `}>
			{src && !imageError && <img ref={imgRef} src={src} alt={alt} className={`rounded-lg ${imageLoaded ? "opacity-100" : "loading"}`} loading="lazy" onLoad={() => setImageLoaded(true)} onError={() => setImageError(true)} />}

			{shouldShowPlaceholder && showPlaceholder && (
				<div className="placeholder rounded-lg">
					<div>
						<div className="text-2xl mb-2">🎵</div>
						<div className="text-xs opacity-60">{imageError ? "Image unavailable" : "No artwork"}</div>
					</div>
				</div>
			)}
		</div>
	)
}
