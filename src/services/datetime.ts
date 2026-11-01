import { useState, useEffect } from 'react';

export function formatLiveTime(date: Date, includeSeconds = false): string {
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true,
  });
}

export function formatLiveDate(date: Date, format: 'short' | 'medium' | 'full' = 'medium'): string {
  if (format === 'short') {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
  if (format === 'full') {
    return date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(timestamp: number, currentNow: number = Date.now()): string {
  const diffMs = currentNow - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 45) {
    return 'Just now';
  }
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  const d = new Date(timestamp);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/**
 * React hook to keep date & time updating live second-by-second across components
 */
export function useLiveDateTime(tickIntervalMs = 1000) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, tickIntervalMs);
    return () => clearInterval(timer);
  }, [tickIntervalMs]);

  return {
    now: currentDate,
    timeString: formatLiveTime(currentDate, false),
    timeWithSeconds: formatLiveTime(currentDate, true),
    shortDate: formatLiveDate(currentDate, 'short'),
    fullDate: formatLiveDate(currentDate, 'full'),
    mediumDate: formatLiveDate(currentDate, 'medium'),
  };
}
