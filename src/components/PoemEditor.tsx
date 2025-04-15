"use client";

import { Button } from "@/components/ui/button";
import type { Poem } from "@/types/poem";
import { useEffect, useState } from "react";

export default function PoemEditor() {
	const [poem, setPoem] = useState<Poem>();
	const [hasAddedLine, setHasAddedLine] = useState(false);
	const [userInput, setUserInput] = useState("");

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
			}
		};

		fetchPoemData();
	}, []);

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

	return (
		<div className="flex flex-col h-screen max-w-5xl mx-auto p-6 font-inter">
			<div className="text-lg mb-4">Poem date will appear here</div>
			<div className="pl-1 text-2xl italic font-lora">
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
						className="flex-grow text-2xl pl-3 py-2 italic font-lora border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
