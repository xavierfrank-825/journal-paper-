import React from "react";
import { linkifyContent } from "../../utils/xmlParser";



const PaperViewer = ({ htmlContent }) => {
  return (
    <div
      className="paper-viewer"
      dangerouslySetInnerHTML={{ __html: linkifyContent(htmlContent) }}
    />
  );
};

export default PaperViewer;
