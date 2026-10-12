import React, { useEffect, useRef, useState } from 'react';
let scriptReady;
function loadTwitter() {
  if (window.twttr?.widgets) return Promise.resolve(window.twttr);
  if (!scriptReady) scriptReady = new Promise((resolve, reject) => {
    const deadline = setTimeout(() => { clearInterval(poll); reject(new Error('Embed unavailable')); }, 15000);
    const poll = setInterval(() => {
      if (window.twttr?.widgets) { clearTimeout(deadline); clearInterval(poll); resolve(window.twttr); }
    }, 100);
  }).catch(error => { scriptReady = null; throw error; });
  return scriptReady;
}
export default function TweetEmbed({ tweetId }) {
  const container = useRef(null);
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    let active = true;
    // Each effect gets its own mount so a cancelled embed cannot populate a newer post.
    const mount = document.createElement('div');
    container.current.replaceChildren(mount);
    setStatus('loading');
    const timeout = setTimeout(() => { if (active) setStatus('unavailable'); }, 20000);
    loadTwitter().then(twitter => {
      if (!active) return null;
      return twitter.widgets.createTweet(String(tweetId), mount, { conversation: 'none', cards: 'visible', theme: 'light', dnt: true, align: 'center' });
    }).then(result => {
      if (active) { clearTimeout(timeout); setStatus(result ? 'loaded' : 'unavailable'); }
    }).catch(() => { if (active) { clearTimeout(timeout); setStatus('unavailable'); } });
    return () => { active = false; clearTimeout(timeout); mount.remove(); };
  }, [tweetId]);
  return <><div className={`embed-status ${status}`} role="status" hidden={status === 'loaded'}>
    {status === 'loading' ? <><span className="loading-dot" />Loading post from X…</> : 'This post could not be displayed. You can try viewing the original on X.'}
  </div><div ref={container} className="tweet-embed" hidden={status === 'unavailable'} /></>;
}
