"use client";

import { QUOTES } from "@/constants/quotes";
import type { QuotesType } from "@/types/quotes";
import { useEffect, useState } from "react";

export default function QuoteDisplay() {
	// Initialize state with null. Explicitly type the state.
	const [quote, setQuote] = useState<string | null>(null);
	const [author, setAuthor] = useState<string | null>(null);

	useEffect(() => {
		// Check if the QUOTES array is not empty
		if (QUOTES && QUOTES.length > 0) {
			// Generate a random index
			const randomIndex = Math.floor(Math.random() * QUOTES.length);
			// Select the random quote object
			const randomQuoteData: QuotesType[number] = QUOTES[randomIndex]; // Accessing the type of a single quote object

			// Update the state with the selected quote and author
			// Add quotes around the text for display consistency
			setQuote(`"${randomQuoteData.quote}"`);
			setAuthor(randomQuoteData.author);
		} else {
			// Optional: Handle the case where QUOTES might be empty
			console.warn("QUOTES array is empty. Cannot display a quote.");
			// You could set an error message or leave it null
			setQuote("No quotes available to display.");
			setAuthor("System");
		}
	}, []); // Empty dependency array means this runs once on mount

	return (
		<div className="flex flex-col justify-center items-center h-screen max-w-5xl mx-auto p-6 text-center">
			{/* Conditionally render the quote and author only when they are not null */}
			{quote && author ? (
				<>
					<blockquote>{quote}</blockquote>
					<cite>— {author} —</cite>
				</>
			) : (
				// Optional: Show a loading indicator or nothing while the quote is being selected
				<p>Loading quote...</p>
			)}
		</div>
	);
}
