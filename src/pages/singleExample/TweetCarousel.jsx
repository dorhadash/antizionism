import React, { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../../styles/stylesheet.css";

import TweetCard from "./TweetCard.jsx";

export default function TweetCarousel({
  tweets = [],
  displayedDate = "",
  currentIndex = 0,
  tweetIndex = 0,
  handleTweetsIndex = () => {},
}) {
  const clickCooldown = useRef(false);

  // Always work with a real array
  const safeTweets = useMemo(() => (Array.isArray(tweets) ? tweets : []), [tweets]);
  const count = safeTweets.length;

  // Normalize tweetIndex so it never becomes NaN or out of range
  const safeIndex = Number.isInteger(tweetIndex) && tweetIndex >= 0 ? tweetIndex : 0;

  // If tweets changed and index is now out of bounds, reset to 0
  useEffect(() => {
    if (count === 0) {
      if (safeIndex !== 0) handleTweetsIndex(0);
      return;
    }
    if (safeIndex > count - 1) handleTweetsIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const prev = () => {
    if (clickCooldown.current) return;
    clickCooldown.current = true;
    setTimeout(() => (clickCooldown.current = false), 400);

    if (count === 0) return;

    if (safeIndex === 0) {
      handleTweetsIndex(count - 1);
    } else {
      handleTweetsIndex(safeIndex - 1);
    }
  };

  const next = () => {
    if (clickCooldown.current) return;
    clickCooldown.current = true;
    setTimeout(() => (clickCooldown.current = false), 400);

    if (count === 0) return;

    if (safeIndex === count - 1) {
      handleTweetsIndex(0);
    } else {
      handleTweetsIndex(safeIndex + 1);
    }
  };

  const displayNum = count === 0 ? 0 : safeIndex + 1;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Header bar */}
      <div className="tweet-carousel-header">
        <button
          onClick={prev}
          className="p-2 bg-gray-200 rounded-full icon-black"
          aria-label="Previous tweet"
          disabled={count === 0}
          style={count === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
        >
          <ChevronLeft size={18} />
        </button>

        <p className="font-bold text-gray-700 text-sm horizontal-padding">
          Tweet {displayNum} of {count}
        </p>

        <button
          onClick={next}
          className="p-2 bg-gray-200 rounded-full icon-black"
          aria-label="Next tweet"
          disabled={count === 0}
          style={count === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Body */}
      {count === 0 ? (
        <div className="text-gray-700" style={{ opacity: 0.7 }}>
          No tweets available.
        </div>
      ) : (
        <motion.div
          key={displayedDate + currentIndex + safeIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
        >
          {/* IMPORTANT: your data is tweet IDs, so pass a tweetId string */}
          <TweetCard tweetId={safeTweets[safeIndex]} />
        </motion.div>
      )}
    </div>
  );
}
