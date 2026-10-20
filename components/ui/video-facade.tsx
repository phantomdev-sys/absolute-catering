'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

type VideoFacadeProps = {
  /** YouTube or Vimeo video id. */
  videoId: string;
  provider?: 'youtube' | 'vimeo';
  /** Local poster image in public/. Do not hotlink the provider's thumbnail — that is a third-party request. */
  poster: string;
  title: string;
  className?: string;
};

/**
 * Click-to-load video.
 *
 * Nothing from the video provider is requested until a visitor presses play:
 * no script, no iframe, no cookies. That is faster (a YouTube embed is
 * several hundred kilobytes before anyone watches anything) and it keeps the
 * cookie policy honest — a site that sets no tracking cookies on page view
 * doesn't need a consent banner for them.
 *
 * `nocookie` domains are used for the same reason once playback starts.
 */
export function VideoFacade({
  videoId,
  provider = 'youtube',
  poster,
  title,
  className,
}: VideoFacadeProps) {
  const [playing, setPlaying] = useState(false);

  const src =
    provider === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
      : `https://player.vimeo.com/video/${videoId}?autoplay=1&dnt=1`;

  return (
    <div className={`relative aspect-video overflow-hidden rounded-lg bg-ground-inverse ${className ?? ''}`}>
      {playing ? (
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full cursor-pointer"
          aria-label={`Play video: ${title}`}
        >
          <Image
            src={poster}
            alt=""
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center bg-black/25 transition-colors group-hover:bg-black/35"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-ground-raised text-ink shadow-lg">
              <Play className="h-6 w-6 translate-x-0.5" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
