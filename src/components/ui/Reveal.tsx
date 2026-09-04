"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Lightweight fade/slide-up on scroll. No animation library — a single
// IntersectionObserver, and it degrades to fully-visible with no JS or when
// the user prefers reduced motion (handled in globals.css via the .reveal
// class + prefers-reduced-motion media query).
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", isVisible && "is-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
