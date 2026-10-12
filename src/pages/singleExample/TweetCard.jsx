import React from 'react';
import TweetEmbed from './TweetEmbed.jsx';
export default function TweetCard({ tweetId }) {
  return <div className="tweet-card"><TweetEmbed tweetId={tweetId} /><a className="original-link" href={`https://x.com/i/status/${tweetId}`} target="_blank" rel="noopener noreferrer">View original on X ↗</a></div>;
}
