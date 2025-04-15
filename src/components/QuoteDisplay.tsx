"use client";

export default function QuoteDisplay() {
	const quote =
		"Two roads diverged in a wood, and I— I took the one less traveled by,";
	const author = "Robert Frost";

	return (
		<div className="flex flex-col justify-center items-center h-screen max-w-5xl mx-auto p-6 text-center">
			<blockquote className="font-playfair text-xl md:text-2xl mb-4">
				{quote}
			</blockquote>
			<cite className="font-lora text-lg">— {author} —</cite>
		</div>
	);
}
