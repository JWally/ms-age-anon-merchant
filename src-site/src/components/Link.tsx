import React from "react";

interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  children: React.ReactNode;
}

const Link = ({ to, children, onClick, ...props }: LinkProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call the provided onClick handler first if it exists
    if (onClick) {
      onClick(e);
    }

    // Allow new-tab or non-left clicks
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }

    const target = e.currentTarget as HTMLAnchorElement;
    const url = new URL(target.href, location.origin);

    // Only intercept same-origin
    if (url.origin !== location.origin) return;

    e.preventDefault();
    if (url.pathname !== location.pathname || url.search !== location.search) {
      window.history.pushState({}, "", url.pathname + url.search + url.hash);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  const isActive = to === window.location.pathname;

  return (
    <a
      {...props} // This spreads all the other props including style, onMouseEnter, onMouseLeave, etc.
      href={to}
      onClick={handleClick}
      role="link"
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </a>
  );
};

export default Link;
