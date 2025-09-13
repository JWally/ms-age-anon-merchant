// src/components/JsonModal.tsx
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import ReactJson from "@microlink/react-json-view";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface Props {
  title: string;
  url: string;
  onClose: () => void;
}

// Extended HTMLElement interface to include our custom scrollTimer property
interface ScrollableElement extends HTMLElement {
  scrollTimer?: NodeJS.Timeout;
}

const JsonModal: React.FC<Props> = ({ title, url, onClose }) => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /* ─ fetch fresh every mount ─ */
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancel) setData(json);
      } catch (e) {
        if (!cancel) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [url]);

  /* ─ close on esc & lock scroll ─ */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    // Add custom scrollbar styles
    const style = document.createElement("style");
    style.textContent = `
      .scrollable-content {
        scrollbar-width: thin;
        scrollbar-color: transparent transparent;
        transition: scrollbar-color 0.3s ease;
      }
      .scrollable-content::-webkit-scrollbar {
        width: 8px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .scrollable-content::-webkit-scrollbar-track {
        background: transparent;
      }
      .scrollable-content::-webkit-scrollbar-thumb {
        background: #4b5563;
        border-radius: 4px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .scrollable-content:hover::-webkit-scrollbar,
      .scrollable-content.scrolling::-webkit-scrollbar {
        opacity: 1;
      }
      .scrollable-content:hover::-webkit-scrollbar-thumb,
      .scrollable-content.scrolling::-webkit-scrollbar-thumb {
        opacity: 1;
      }
      .scrollable-content:hover,
      .scrollable-content.scrolling {
        scrollbar-color: #4b5563 transparent;
      }
      .scrollable-content::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = overflow;
      document.head.removeChild(style);
    };
  }, [onClose]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as ScrollableElement;
    target.classList.add("scrolling");

    if (target.scrollTimer) {
      clearTimeout(target.scrollTimer);
    }

    target.scrollTimer = setTimeout(() => {
      target.classList.remove("scrolling");
    }, 1000);
  };

  /* ─ the overlay & card ─ */
  const modalJSX = (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 backdrop-blur-md bg-black bg-opacity-75"
    >
      <div className="min-h-full flex items-center justify-center p-2 sm:p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-gray-900 rounded-lg shadow-2xl"
          style={{
            height: "min(800px, calc(100vh - 2rem))",
            maxHeight: "calc(100vh - 2rem)",
          }}
        >
          {/* header - fixed height */}
          <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h2 className="text-pink-400 text-lg font-bold truncate pr-4">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-200 flex-shrink-0 p-2 -m-2 touch-manipulation"
              style={{ minHeight: "44px", minWidth: "44px" }}
            >
              <XMarkIcon className="h-6 w-6 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* body: scrollable content area */}
          <div
            className="p-4 sm:p-6 overflow-y-auto scrollable-content"
            style={{
              height: "calc(min(800px, calc(100vh - 2rem)) - 64px)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            onScroll={handleScroll}
          >
            {loading && <p className="text-gray-400">Loading…</p>}
            {error && <p className="text-red-500">{error}</p>}
            {data && (
              <ReactJson
                src={data}
                name={false}
                collapsed={2}
                enableClipboard
                displayDataTypes={false}
                theme="paraiso"
                style={{
                  backgroundColor: "transparent",
                  fontSize: "14px",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* ─ portal so it's outside parent flex/grid ─ */
  return ReactDOM.createPortal(modalJSX, document.body);
};

export default JsonModal;
