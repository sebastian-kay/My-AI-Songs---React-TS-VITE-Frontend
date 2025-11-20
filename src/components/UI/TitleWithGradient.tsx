// TitleWithGradient.tsx
import { useEffect, useRef } from "react"

// 1️⃣ Props‑Typ definieren
export interface TitleWithGradientProps {
	/** Der große Titel, auf den der Gradient wirkt */
	headline: string
	/** Optionaler Untertitel – ohne Gradient, nur normales Styling */
	subheadline?: string
	/** Optional ein zusätzlicher CSS‑Klassen‑Name für mehr Styling‑Flexibilität */
	className?: string
}

// 2️⃣ Functional Component mit Typisierung
const TitleWithGradient: React.FC<TitleWithGradientProps> = ({ headline, subheadline, className = "" }) => {
	// Ref auf das h1‑Element (der Gradient wird hier gesetzt)
	const titleRef = useRef<HTMLHeadingElement>(null)

	// 3️⃣ Effekt: Mouse‑Move‑Listener & Cleanup
	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			// Ref‑Check – falls das Element noch nicht gemountet ist, abbrechen
			if (!titleRef.current) return

			const centerX = window.innerWidth / 2
			const centerY = window.innerHeight / 2

			const deltaX = event.clientX - centerX
			const deltaY = event.clientY - centerY

			const angleRad = Math.atan2(deltaY, deltaX)
			const angleDeg = (angleRad * 180) / Math.PI + 180 // 0‑360°

			titleRef.current.style.setProperty("--title-gradient-deg", `${angleDeg.toFixed(2)}deg`)
		}

		document.body.addEventListener("mousemove", handleMouseMove)
		return () => {
			document.body.removeEventListener("mousemove", handleMouseMove)
		}
	}, []) // leeres Dep‑Array → nur beim Mounten

	// 4️⃣ JSX‑Ausgabe
	return (
		<div className={`title-with-gradient ${className}`.trim()}>
			{/* Das eigentliche h1‑Element bekommt das Ref */}
			<h1 ref={titleRef} className="site-title">
				{headline}
				{/* Die besten deutschen <br /> A.I. Songs */}
			</h1>

			{/* Optionaler Untertitel – nur rendern, wenn er übergeben wurde */}
			{subheadline && <p className="site-subtitle">{subheadline}</p>}
		</div>
	)
}

export default TitleWithGradient
