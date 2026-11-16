import { useEffect, useRef, useState } from "react";

// Must match the animation duration in index.css.
const DURATION = 300;

/**
 * Crossfades between pages using a "cover" technique: the outgoing page stays
 * in normal flow and fully opaque (so it defines the document height and hides
 * the body background), while the incoming page is overlaid on top and fades +
 * rises in. Layers keep stable keys, so no page is ever remounted mid-switch.
 */
export default function PageTransition({ pageKey, children }) {
  const [layers, setLayers] = useState(() => [
    { key: pageKey, node: children },
  ]);
  const lastKeyRef = useRef(pageKey);

  // Update the layer list when the page (or its node) changes.
  useEffect(() => {
    if (lastKeyRef.current === pageKey) {
      setLayers((prev) => {
        const next = prev.slice();
        next[next.length - 1] = { ...next[next.length - 1], node: children };
        return next;
      });
      return;
    }

    lastKeyRef.current = pageKey;
    setLayers((prev) => [...prev.slice(-1), { key: pageKey, node: children }]);
  }, [pageKey, children]);

  const transitioning = layers.length > 1;

  // Finish the transition. Kept in its own effect (keyed on the boolean) so a
  // mid-transition re-render can't cancel the pending timer.
  useEffect(() => {
    if (!transitioning) return undefined;
    const timer = setTimeout(() => {
      setLayers((prev) => prev.slice(-1));
    }, DURATION);
    return () => clearTimeout(timer);
  }, [transitioning]);

  return (
    <div
      className={`page-transition${transitioning ? " is-transitioning" : ""}`}
    >
      {layers.map((layer, index) => {
        const isTop = index === layers.length - 1;
        const isOverlay = isTop && transitioning;
        return (
          <div
            key={layer.key}
            className={isOverlay ? "page-layer page-layer--enter" : "page-layer"}
          >
            {layer.node}
          </div>
        );
      })}
    </div>
  );
}
