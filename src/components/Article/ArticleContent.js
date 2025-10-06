// frontend/src/components/Article/ArticleContent.js
import { useEffect } from 'react';

const useJATSParser = () => {
  useEffect(() => {
    const articleWrapperEl = document.getElementById("jatsParserFullText");
    if (!articleWrapperEl) return;

    const widthMarkerClass = "jatsparser__article-mobile-view";
    const hideElClass = "jatsParser__hide";
    const hideSectionContentClass = "jatsParser__hide-content";

    const toggleElementRecursively = (sectionTitleEl) => {
      if (!sectionTitleEl) return;
      sectionTitleEl.classList.toggle(hideSectionContentClass);

      let next = sectionTitleEl.nextElementSibling;
      while (next && next.tagName !== "H2") {
        next.classList.toggle(hideElClass);
        next = next.nextElementSibling;
      }
    };

    const accordionEventResize = () => {
      if (!articleWrapperEl) return;
      const widthLimit = 992;
      const headings = document.querySelectorAll("h2.article-section-title");
      if (!headings || headings.length === 0) return;

      if (window.innerWidth < widthLimit) {
        if (!articleWrapperEl.classList.contains(widthMarkerClass)) {
          articleWrapperEl.classList.add(widthMarkerClass);
          headings.forEach(h => {
            if (!h.classList.contains(hideSectionContentClass)) {
              toggleElementRecursively(h);
            }
          });
        }
      } else {
        if (articleWrapperEl.classList.contains(widthMarkerClass)) {
          articleWrapperEl.classList.remove(widthMarkerClass);
          headings.forEach(h => {
            if (h.classList.contains(hideSectionContentClass)) {
              toggleElementRecursively(h);
            }
          });
        }
      }
    };

    const accordionClick = () => {
      const headings = document.querySelectorAll(`.${widthMarkerClass} h2.article-section-title`);
      if (!headings || headings.length === 0) return;

      headings.forEach(h => {
        h.onclick = () => {
          toggleElementRecursively(h);
          if (!h.classList.contains(hideSectionContentClass)) h.scrollIntoView();
        };
      });
    };

    // Initial run
    accordionEventResize();
    accordionClick();

    // Resize listener
    window.addEventListener("resize", () => {
      accordionEventResize();
      accordionClick();
    });

    // Cleanup listener
    return () => {
      window.removeEventListener("resize", () => {
        accordionEventResize();
        accordionClick();
      });
    };
  }, []);
};

export default useJATSParser;
