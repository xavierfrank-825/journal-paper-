import React from "react";

const XMLRenderer = ({ htmlContent }) => {
  if (!htmlContent) return <p>No XML uploaded yet.</p>;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "10px",
        borderRadius: "5px",
        marginTop: "10px",
        background: "#fafafa"
      }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default XMLRenderer;
