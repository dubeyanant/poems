"use client";

import QuoteDisplay from "@/components/QuoteDisplay";
import { Button } from "@/components/ui/button";
import type { Poem } from "@/types/poem";
import { useEffect, useState } from "react";

export default function Home() {
	const [showPoem, setShowPoem] = useState(false);
	const [poem, setPoem] = useState<Poem | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [hasAddedLine, setHasAddedLine] = useState(false);
	const [userInput, setUserInput] = useState("");

	// Load poem data on mount
	useEffect(() => {
		const fetchPoemData = async () => {
			try {
				const response = await fetch("/api/poems/current");
				if (!response.ok) {
					throw new Error("Failed to fetch poem");
				}
				const data: Poem = await response.json();
				setPoem(data);
			} catch (error) {
				console.error("Error fetching poem:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchPoemData();
	}, []);

	// Show poem after minimum 3 seconds AND when data is loaded
	useEffect(() => {
		const timer = setTimeout(() => {
			if (!isLoading) {
				setShowPoem(true);
			}
		}, 3000);

		return () => clearTimeout(timer);
	}, [isLoading]);

	// If data loads before 3 seconds, wait until timer completes
	useEffect(() => {
		if (!isLoading && !showPoem) {
			const remainingTime = setTimeout(() => {
				setShowPoem(true);
			}, 3000);

			return () => clearTimeout(remainingTime);
		}
	}, [isLoading, showPoem]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUserInput(e.target.value);
	};

	const submitLine = async () => {
		const trimmedInput = userInput.trim();

		if (!trimmedInput) {
			return;
		}

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
				headers: {
					"Content-Type": "application/json",
				},
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
	};

	// Show quote while loading or during initial 3 seconds
	if (!showPoem) {
		return <QuoteDisplay />;
	}

	// Show poem once ready
	return (
		<div className="flex flex-col h-screen max-w-5xl mx-auto p-6">
			<div className="text-lg mb-4">Poem date will appear here</div>
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
