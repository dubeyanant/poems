"use client";

import {
	addLineToCurrentPoem,
	getCurrentPoem,
	getPoemById,
} from "@/lib/apiClient";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

// Define props interface
interface PoemEditorProps {
	poemIdFromRoute?: string; // Make the prop optional
}

export default function PoemEditor({ poemIdFromRoute }: PoemEditorProps) {
	// Destructure prop
	const [currentDate, setCurrentDate] = useState("");
	const [poemLines, setPoemLines] = useState<string[]>([]);
	const [userInput, setUserInput] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	// Determine initial input visibility based on whether we are viewing a specific poem
	const [showInput, setShowInput] = useState(!poemIdFromRoute);
	const editableDivRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchPoemData = async () => {
			try {
				// Fetch poem based on whether an ID is provided by the route
				const poem = poemIdFromRoute
					? await getPoemById(poemIdFromRoute)
					: await getCurrentPoem();

				const poemId = poem._id; // Use the actual ID from the fetched poem
				setPoemLines(poem.lines);

				if (!/^\d{6}$/.test(poemId)) {
					console.error("Invalid poem ID format received:", poemId);
					setCurrentDate("Invalid Date");
					setPoemLines([]); // Clear lines on format error
					return;
				}

				const day = Number.parseInt(poemId.substring(0, 2), 10);
				const month = Number.parseInt(poemId.substring(2, 4), 10) - 1;
				const year = Number.parseInt(poemId.substring(4, 6), 10) + 2000;

				const poemDate = new Date(year, month, day);

				if (Number.isNaN(poemDate.getTime())) {
					console.error("Failed to parse date from poem ID:", poemId);
					setCurrentDate("Invalid Date");
					setPoemLines([]); // Clear lines on parse error
					return;
				}

				const options: Intl.DateTimeFormatOptions = {
					year: "numeric",
					month: "long",
					day: "numeric",
				};
				setCurrentDate(poemDate.toLocaleDateString(undefined, options));
			} catch (error) {
				console.error(
					`Failed to fetch poem data (ID: ${poemIdFromRoute || "current"}):`,
					error,
				);
				setCurrentDate("Error loading date");
				setPoemLines([]);
				setShowInput(false); // Hide input on error fetching specific poem
			}
		};

		fetchPoemData();
		// Depend on poemIdFromRoute to refetch if the route changes (though unlikely in this setup)
	}, [poemIdFromRoute]);

	const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
		setUserInput(event.currentTarget.textContent ?? "");
	};

	const handleFocus = () => {
		setIsFocused(true);
	};

	const handleBlur = () => {
		setIsFocused(false);
	};

	const handleKeyDown = async (event: KeyboardEvent<HTMLDivElement>) => {
		// Submission should only happen if we are NOT viewing a specific poem by ID
		if (event.key === "Enter" && !poemIdFromRoute) {
			event.preventDefault();
			const lineToAdd = userInput.trim();

			if (lineToAdd) {
				try {
					// Note: addLineToCurrentPoem might need adjustment if it shouldn't be allowed here
					// Or the API needs to handle adding to the 'current' poem regardless of view
					const updatedPoem = await addLineToCurrentPoem(lineToAdd);
					setPoemLines(updatedPoem.lines);
					setUserInput("");
					setShowInput(false);
					if (editableDivRef.current) {
						editableDivRef.current.textContent = "";
					}
				} catch (error) {
					console.error("Failed to add line:", error);
				}
			}
		}
	};

	return (
		<div className="flex flex-col h-screen max-w-5xl mx-auto p-6">
			<div className="text-lg mb-4">{currentDate}</div>
			<div className="pl-1 text-2xl italic">
				{poemLines.map(line => (
					<p key={line}>{line}</p>
				))}
			</div>
			{/* Conditionally render based on showInput state */}
			{showInput && (
				<div
					ref={editableDivRef}
					contentEditable={true} // Keep contentEditable true for focus/placeholder logic, but disable submission via handleKeyDown
					onInput={handleInput}
					onFocus={handleFocus}
					onBlur={handleBlur}
					onKeyDown={handleKeyDown}
					suppressContentEditableWarning={true}
					className={`relative text-2xl pl-1 focus:outline-none italic ${
						!userInput && !isFocused ? "show-placeholder" : ""
					}`}
				/>
			)}
		</div>
	);
}
