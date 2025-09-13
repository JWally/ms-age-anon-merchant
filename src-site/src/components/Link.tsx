import React from "react";

const Link = ({
  to,
  children,
  className,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // allow new-tab or non-left clicks
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return;

    const target = e.currentTarget as HTMLAnchorElement;
    const url = new URL(target.href, location.origin);
    // only intercept same-origin
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
      href={to}
      onClick={handleClick}
      className={className}
      role="link"
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </a>
  );
};

export default Link;
