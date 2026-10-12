import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TweetCard from './TweetCard.jsx';

export default function TweetCarousel({ tweets = [], label = 'Posts' }) {
  const posts = Array.isArray(tweets) ? tweets.filter(id => id && id !== 'id1') : [];
  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(index, Math.max(0, posts.length - 1));
  return <section className="evidence-column" aria-label={label}>
    <div className="evidence-heading"><h2>{label}</h2><div className="post-navigation">
      <span aria-live="polite">Post {posts.length ? safeIndex + 1 : 0} of {posts.length}</span>
      {posts.length > 1 && <><button className="icon-button" aria-label={`Previous ${label} post`} onClick={() => setIndex((safeIndex - 1 + posts.length) % posts.length)}><ChevronLeft size={17} /></button><button className="icon-button" aria-label={`Next ${label} post`} onClick={() => setIndex((safeIndex + 1) % posts.length)}><ChevronRight size={17} /></button></>}
    </div></div>
    {posts.length ? <TweetCard key={posts[safeIndex]} tweetId={posts[safeIndex]} /> : <p className="no-posts">No posts available for this side.</p>}
  </section>;
}
