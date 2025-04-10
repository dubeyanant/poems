"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRandomQuote } from "@/lib/apiClient";

const FALLBACK_QUOTE =
  "“There is no greater agony than bearing an untold story inside you.”";
const FALLBACK_AUTHOR = "Maya Angelou";

export default function Home() {
  const router = useRouter();
  const [quote, setQuote] = useState(FALLBACK_QUOTE);
  const [author, setAuthor] = useState(FALLBACK_AUTHOR);

  useEffect(() => {
    getRandomQuote()
      .then((data) => {
        if (data.quote) {
          setQuote(data.quote.startsWith('"') ? data.quote : `"${data.quote}"`);
          setAuthor(data.author);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch quote:", error);
      });

    const timer = setTimeout(() => {
      router.push("/poem");
    }, 300000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col justify-center items-center h-screen max-w-5xl mx-auto p-6 text-center">
      <h3>{quote}</h3>
      <h4>— {author} —</h4>
    </div>
  );
}
