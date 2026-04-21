"use client";

export default function AnimatedLogoLoader() {
  return (
    <div aria-live="polite" className="app-loader" role="status">
      <div className="app-loader__panel">
        <div aria-hidden="true" className="app-loader__mark">
          <span className="app-loader__orbit" />
          <span className="app-loader__orbit app-loader__orbit--delay" />
          <span className="app-loader__center" />
        </div>

        <p className="app-loader__title">Preparing your workspace</p>
        <p className="app-loader__subtitle">Please wait a moment</p>
      </div>
    </div>
  );
}
