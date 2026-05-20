import React from "react";

function PageContainer({ title, subtitle, children }) {
  return (
    <div className="page-wrapper">
      <div className="page-card">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export default PageContainer;