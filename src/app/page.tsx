"use client";

import QuoteDisplay from "@/components/QuoteDisplay";
import { Button } from "@/components/ui/button";
import type { Poem } from "@/types/poem";
import { useEffect, useState } from "react";

export default function Home() {
	const [poem, setPoem] = useState<Poem | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isApiTimedOut, setIsApiTimedOut] = useState(false);
	const [hasAddedLine, setHasAddedLine] = useState(false);
	const [userInput, setUserInput] = useState("");
	const [formattedDate, setFormattedDate] = useState("");

	// Format date from poem ID (format: DDMMYY)
	function formatDate(id: string) {
		if (!id || id.length < 6) return "";

		const day = id.substring(0, 2);
		const monthNum = Number.parseInt(id.substring(2, 4), 10);
		const year = id.substring(4);

		// Convert 2-digit year to 4-digit year
		const fullYear = year.length === 2 ? `20${year}` : year;

		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];

		return `${day} ${months[monthNum - 1]}, ${fullYear}`;
	}

	// Fetch poem data once on component mount
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// Set a timeout to handle slow API responses
		const timeoutId = setTimeout(() => {
			if (isLoading) {
				setIsApiTimedOut(true);
				console.warn("API request is taking longer than expected");
			}
		}, 5000); // 5 seconds timeout

		// Fetch poem data
		fetch("/api/poems/current")
			.then(response => {
				if (!response.ok) throw new Error("Failed to fetch poem");
				return response.json();
			})
			.then(data => {
				setPoem(data);
				if (data._id) {
					setFormattedDate(formatDate(data._id));
				}
				setIsLoading(false);
			})
			.catch(error => {
				console.error("Error fetching poem:", error);
				setIsLoading(false);
			});

		return () => clearTimeout(timeoutId);
	}, []);

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		setUserInput(e.target.value);
	}

	async function submitLine() {
		const trimmedInput = userInput.trim();
		if (!trimmedInput) return;

		try {
			// Optimistically update UI
			setPoem(prev => {
				if (!prev) return prev;
				return {
					...prev,
					lines: [...prev.lines, trimmedInput],
				};
			});
			setHasAddedLine(true);
			setUserInput("");

			// Send to API
			await fetch("/api/poems/current", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ line: trimmedInput }),
			});
		} catch (error) {
			console.error("Error adding line:", error);
			// Revert optimistic update on failure
			setPoem(prev => {
				if (!prev) return prev;
				return {
					...prev,
					lines: prev.lines.slice(0, -1),
				};
			});
			setHasAddedLine(false);
		}
	}

	// Show quote while loading
	if (isLoading && !isApiTimedOut) {
		return <QuoteDisplay />;
	}

	// Show poem once ready or after timeout
	return (
		<div className="flex flex-col h-screen max-w-5xl mx-auto p-6">
			{isApiTimedOut && !poem && (
				<div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
					<p className="text-yellow-700">
						Taking longer than usual to load the poem. Please wait
						or refresh the page.
					</p>
				</div>
			)}
			<div className="text-lg mb-4">
				{formattedDate || "Loading date..."}
			</div>
			<div className="pl-1 text-2xl italic">
				{poem?.lines.map((line, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<p key={index}>{line}</p>
				))}
			</div>
			{!hasAddedLine && (
				<div className="flex mt-4 gap-3">
					<input
						type="text"
						value={userInput}
						onChange={handleInputChange}
						placeholder="Add a line..."
						className="flex-grow text-2xl pl-3 py-2 italic border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
					/>
					<Button
						type="submit"
						onClick={submitLine}
						disabled={!userInput.trim()}
					>
						Submit Line
					</Button>
				</div>
			)}
		</div>
	);
}
