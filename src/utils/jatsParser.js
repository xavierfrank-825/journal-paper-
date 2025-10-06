// frontend/src/utils/jatsParser.js

// ✅ JATS Parser Class
class JATSParser {
  constructor() {
    this.processors = {
      image: ImageProcessor,
      modal: FigureModal
    };
  }

  parse(xmlString) {
    try {
      console.log("🚀 Starting JATS XML parsing...");
      
      // Parse XML string to DOM
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      // Check for parsing errors
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      if (parseError.length > 0) {
        console.error("XML parsing error:", parseError[0].textContent);
        return "<p>Error: Invalid XML format</p>";
      }

      // Create a container for processing
      const container = document.createElement('div');
      container.id = 'jatsParserFullText';
      
      // Convert XML to HTML structure
      const htmlContent = this.convertXMLToHTML(xmlDoc);
      container.innerHTML = htmlContent;
      
      // Process images and other elements
      this.processImages(container);
      
      // Set up figure modals
      this.setupModals(container);
      
      console.log("✅ JATS parsing complete");
      return container.innerHTML;
      
    } catch (error) {
      console.error("Error in JATS parsing:", error);
      return "<p>Error: Failed to parse XML</p>";
    }
  }

  convertXMLToHTML(xmlDoc) {
    // Basic XML to HTML conversion
    // This is a simplified version - you may need to enhance based on your specific JATS structure
    
    let html = '';
    
    // Process article element
    const article = xmlDoc.querySelector('article');
    if (article) {
      html = this.processArticle(article);
    } else {
      // If no article element, process the root
      html = this.processElement(xmlDoc.documentElement);
    }
    
    return html;
  }

  processArticle(article) {
    let html = '<div class="article-content">';
    
    // Process front matter (title, authors, abstract)
    const front = article.querySelector('front');
    if (front) {
      html += this.processFront(front);
    }
    
    // Process body
    const body = article.querySelector('body');
    if (body) {
      html += this.processBody(body);
    }
    
    // Process back matter (references)
    const back = article.querySelector('back');
    if (back) {
      html += this.processBack(back);
    }
    
    html += '</div>';
    return html;
  }

  processFront(front) {
    let html = '<div class="article-front">';
    
    // Process title
    const titleGroup = front.querySelector('title-group');
    if (titleGroup) {
      const title = titleGroup.querySelector('article-title');
      if (title) {
        html += `<h1 class="article-title">${title.textContent}</h1>`;
      }
    }
    
    // Process authors
    const contribGroup = front.querySelector('contrib-group');
    if (contribGroup) {
      html += this.processContribGroup(contribGroup);
    }
    
    // Process abstract
    const abstract = front.querySelector('abstract');
    if (abstract) {
      html += `<div class="abstract"><h2>Abstract</h2>${this.processElement(abstract)}</div>`;
    }
    
    html += '</div>';
    return html;
  }

  processBody(body) {
    let html = '<div class="article-body">';
    
    // Process sections
    const sections = body.querySelectorAll('sec');
    sections.forEach(section => {
      html += this.processSection(section);
    });
    
    html += '</div>';
    return html;
  }

  processSection(section) {
    let html = '<div class="section">';
    
    // Process title
    const title = section.querySelector('title');
    if (title) {
      html += `<h2 class="article-section-title">${title.textContent}</h2>`;
    }
    
    // Process paragraphs and other content
    const paragraphs = section.querySelectorAll('p');
    paragraphs.forEach(p => {
      html += `<p>${this.processElement(p)}</p>`;
    });
    
    // Process figures
    const figures = section.querySelectorAll('fig');
    figures.forEach(fig => {
      html += this.processFigure(fig);
    });
    
    html += '</div>';
    return html;
  }

  processFigure(fig) {
    let html = '<figure class="jats-figure-container">';
    
    // Process label
    const label = fig.querySelector('label');
    if (label) {
      html += `<div class="figure-label">${label.textContent}</div>`;
    }
    
    // Process graphic
    const graphic = fig.querySelector('graphic, inline-graphic');
    if (graphic) {
      const href = graphic.getAttribute('xlink:href') || graphic.getAttribute('href') || graphic.getAttribute('src');
      if (href) {
        html += `<img src="${href}" alt="Figure" class="jats-figure processed-image" loading="lazy" />`;
      }
    }
    
    // Process caption
    const caption = fig.querySelector('caption');
    if (caption) {
      html += `<figcaption class="figure-caption">${this.processElement(caption)}</figcaption>`;
    }
    
    html += '</figure>';
    return html;
  }

  processContribGroup(contribGroup) {
    let html = '<div class="contrib-group">';
    
    const contribs = contribGroup.querySelectorAll('contrib');
    contribs.forEach(contrib => {
      html += this.processContrib(contrib);
    });
    
    html += '</div>';
    return html;
  }

  processContrib(contrib) {
    let html = '<div class="contrib">';
    
    const name = contrib.querySelector('name');
    if (name) {
      const givenNames = name.querySelector('given-names');
      const surname = name.querySelector('surname');
      if (givenNames && surname) {
        html += `<span class="author-name">${givenNames.textContent} ${surname.textContent}</span>`;
      }
    }
    
    html += '</div>';
    return html;
  }

  processBack(back) {
    let html = '<div class="article-back">';
    
    // Process references
    const refList = back.querySelector('ref-list');
    if (refList) {
      html += '<div class="references"><h2>References</h2>';
      const refs = refList.querySelectorAll('ref');
      refs.forEach(ref => {
        html += `<div class="reference">${this.processElement(ref)}</div>`;
      });
      html += '</div>';
    }
    
    html += '</div>';
    return html;
  }

  processElement(element) {
    if (!element) return '';
    
    // Handle text nodes
    if (element.nodeType === Node.TEXT_NODE) {
      return element.textContent;
    }
    
    // Handle different element types
    const tagName = element.tagName.toLowerCase();
    
    switch (tagName) {
      case 'p':
        return `<p>${this.processChildren(element)}</p>`;
      case 'bold':
      case 'b':
        return `<strong>${this.processChildren(element)}</strong>`;
      case 'italic':
      case 'i':
        return `<em>${this.processChildren(element)}</em>`;
      case 'underline':
        return `<u>${this.processChildren(element)}</u>`;
      case 'sup':
        return `<sup>${this.processChildren(element)}</sup>`;
      case 'sub':
        return `<sub>${this.processChildren(element)}</sub>`;
      case 'xref':
        const refType = element.getAttribute('ref-type');
        const rid = element.getAttribute('rid');
        if (refType === 'bibr' && rid) {
          return `<a href="#ref-${rid}" class="reference-link">${this.processChildren(element)}</a>`;
        }
        return this.processChildren(element);
      case 'ext-link':
        const href = element.getAttribute('xlink:href') || element.getAttribute('href');
        if (href) {
          return `<a href="${href}" target="_blank" rel="noopener noreferrer">${this.processChildren(element)}</a>`;
        }
        return this.processChildren(element);
      default:
        return this.processChildren(element);
    }
  }

  processChildren(element) {
    let html = '';
    for (let child of element.childNodes) {
      html += this.processElement(child);
    }
    return html;
  }

  processImages(container) {
    if (this.processors.image) {
      this.processors.image.processImages(container);
    }
  }

  setupModals(container) {
    if (this.processors.modal) {
      this.processors.modal.init(container);
    }
  }
}

// ✅ Image Processing Utilities
const ImageProcessor = {
  // Process different types of image elements in JATS XML
  processImages: function(container) {
    console.log("🖼️ Processing images in JATS content...");
    
    if (!container) {
      console.warn("No container provided for image processing");
      return;
    }

    // Process various image formats
    this.processGraphicElements(container);
    this.processFigureElements(container);
    this.processInlineImages(container);
    this.processBase64Images(container);
    this.fixImagePaths(container);
    this.addImageErrorHandling(container);
    
    console.log("✅ Image processing complete");
  },

  // Process <graphic> elements common in JATS XML
  processGraphicElements: function(container) {
    const graphics = container.querySelectorAll('graphic, inline-graphic');
    console.log(`Found ${graphics.length} graphic elements`);
    
    graphics.forEach(graphic => {
      const href = graphic.getAttribute('xlink:href') || 
                   graphic.getAttribute('href') || 
                   graphic.getAttribute('src');
      
      if (href) {
        const img = document.createElement('img');
        img.src = this.processImagePath(href);
        img.alt = graphic.getAttribute('alt') || 'Figure';
        img.className = 'jats-graphic processed-image';
        img.loading = 'lazy';
        
        // Copy any ID
        if (graphic.id) {
          img.id = graphic.id;
        }
        
        // Replace the graphic element with img
        graphic.parentNode.replaceChild(img, graphic);
        console.log(`✅ Converted <graphic> to <img>: ${img.src}`);
      }
    });
  },

  // Process <fig> elements with enhanced figure handling
  processFigureElements: function(container) {
    const figures = container.querySelectorAll('fig');
    console.log(`Found ${figures.length} figure elements`);
    
    figures.forEach(fig => {
      // Find graphic within figure
      const graphic = fig.querySelector('graphic, inline-graphic');
      if (graphic) {
        const href = graphic.getAttribute('xlink:href') || 
                     graphic.getAttribute('href') || 
                     graphic.getAttribute('src');
        
        if (href) {
          // Create proper HTML figure structure
          const htmlFigure = document.createElement('figure');
          htmlFigure.className = 'jats-figure-container';
          
          if (fig.id) {
            htmlFigure.id = fig.id;
          }
          
          // Create image
          const img = document.createElement('img');
          img.src = this.processImagePath(href);
          img.alt = graphic.getAttribute('alt') || fig.getAttribute('alt') || 'Figure';
          img.className = 'jats-figure processed-image';
          img.loading = 'lazy';
          
          htmlFigure.appendChild(img);
          
          // Process caption
          const caption = fig.querySelector('caption');
          if (caption) {
            const figcaption = document.createElement('figcaption');
            figcaption.className = 'figure-caption';
            figcaption.innerHTML = caption.innerHTML;
            htmlFigure.appendChild(figcaption);
          }
          
          // Process label
          const label = fig.querySelector('label');
          if (label) {
            const labelDiv = document.createElement('div');
            labelDiv.className = 'figure-label';
            labelDiv.innerHTML = label.innerHTML;
            htmlFigure.insertBefore(labelDiv, htmlFigure.firstChild);
          }
          
          // Replace original figure
          fig.parentNode.replaceChild(htmlFigure, fig);
          console.log(`✅ Converted <fig> to HTML <figure>: ${img.src}`);
        }
      }
    });
  },

  // Process inline images that might not be in figure elements
  processInlineImages: function(container) {
    const inlineImages = container.querySelectorAll('img:not(.processed-image)');
    console.log(`Found ${inlineImages.length} inline images to process`);
    
    inlineImages.forEach(img => {
      img.src = this.processImagePath(img.src);
      img.className += ' processed-image';
      img.loading = 'lazy';
      
      if (!img.alt) {
        img.alt = 'Image';
      }
      
      console.log(`✅ Processed inline image: ${img.src}`);
    });
  },

  // Process base64 encoded images
  processBase64Images: function(container) {
    // Look for base64 image data in text content
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      
      // Check for base64 image patterns
      const base64Pattern = /data:image\/([^;]+);base64,([A-Za-z0-9+/=]+)/g;
      const matches = text.match(base64Pattern);
      
      if (matches) {
        let newHTML = text;
        matches.forEach(match => {
          const img = `<img src="${match}" alt="Base64 Image" class="base64-image processed-image" loading="lazy" />`;
          newHTML = newHTML.replace(match, img);
        });
        
        // Replace text node with HTML
        const wrapper = document.createElement('span');
        wrapper.innerHTML = newHTML;
        textNode.parentNode.replaceChild(wrapper, textNode);
        
        console.log(`✅ Converted base64 image data to <img> tags`);
      }
    });
  },

  // Fix and process image paths
  processImagePath: function(path) {
    if (!path) return '';
    
    // If already a complete URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    
    // Handle relative paths - you may need to adjust this based on your setup
    if (path.startsWith('./') || path.startsWith('../')) {
      // Remove leading ./ or adjust path as needed
      return path.replace(/^\.\//, '');
    }
    
    // If path doesn't start with /, assume it's relative to current location
    if (!path.startsWith('/')) {
      return './' + path;
    }
    
    return path;
  },

  // Fix image paths throughout the container
  fixImagePaths: function(container) {
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      if (img.src && !img.src.startsWith('data:') && !img.classList.contains('path-fixed')) {
        const originalSrc = img.getAttribute('src') || img.src;
        img.src = this.processImagePath(originalSrc);
        img.classList.add('path-fixed');
      }
    });
  },

  // Add error handling for broken images
  addImageErrorHandling: function(container) {
    const images = container.querySelectorAll('img:not(.error-handled)');
    
    images.forEach(img => {
      img.classList.add('error-handled');
      
      img.addEventListener('error', function() {
        console.warn(`Failed to load image: ${this.src}`);
        
        // Create a placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.innerHTML = `
          <div class="placeholder-content">
            <span class="placeholder-icon">🖼️</span>
            <span class="placeholder-text">Image not available</span>
            <span class="placeholder-path">${this.alt || 'Unknown image'}</span>
          </div>
        `;
        
        this.parentNode.replaceChild(placeholder, this);
      });
      
      img.addEventListener('load', function() {
        console.log(`✅ Successfully loaded image: ${this.src}`);
      });
    });
  }
};

// ✅ Enhanced figure modal functionality with image support
const FigureModal = {
  init: function(container) {
    if (!container) return;
    
    // Process images first
    ImageProcessor.processImages(container);
    
    // Then set up modals for figures and tables
    const figures = container.querySelectorAll("figure, table");
    console.log(`Setting up modals for ${figures.length} figures/tables`);
    
    if (!figures || figures.length === 0) return;

    figures.forEach(fig => {
      // Prevent multiple expand buttons
      if (fig.querySelector(".jatsParser__expand")) return;

      const expandEl = document.createElement("button");
      expandEl.className = "jatsParser__expand";
      expandEl.textContent = "⤢"; // ⤢ expand arrow
      expandEl.setAttribute("aria-label", "Expand figure");
      fig.insertBefore(expandEl, fig.firstChild);

      expandEl.addEventListener("click", (event) => {
        event.stopPropagation();
        this.openModal(fig);
      });
    });
  },

  openModal: function(figure) {
    const pageYoffset = window.pageYOffset;
    const modalContent = figure.cloneNode(true);
    
    // Generate unique ID for modal
    modalContent.id = "modal-" + (modalContent.id || Math.random().toString(36).substr(2));
    modalContent.classList.add("jatsParser__modal");
    
    // Add fade effect to body
    document.body.classList.add("jatsParser__fade");
    document.body.insertBefore(modalContent, document.body.firstChild);

    // Remove nested expand button in clone
    const cloneExpand = modalContent.querySelector(".jatsParser__expand");
    if (cloneExpand) cloneExpand.remove();

    // Create close button
    const closeEl = document.createElement("button");
    closeEl.id = "jatsParser__close";
    closeEl.setAttribute("aria-label", "Close modal");
    closeEl.textContent = "✕"; // × close symbol
    modalContent.insertBefore(closeEl, modalContent.firstChild);

    // Ensure images in modal are properly loaded
    const modalImages = modalContent.querySelectorAll('img');
    modalImages.forEach(img => {
      // Refresh image src to ensure it loads in modal
      const src = img.src;
      img.src = '';
      img.src = src;
    });

    // Close modal functionality
    closeEl.addEventListener("click", () => {
      this.closeModal(modalContent, pageYoffset);
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal(modalContent, pageYoffset);
      }
    });

    // Close on backdrop click
    modalContent.addEventListener('click', (e) => {
      if (e.target === modalContent) {
        this.closeModal(modalContent, pageYoffset);
      }
    });
  },

  closeModal: function(modalContent, pageYoffset) {
    modalContent.remove();
    document.body.classList.remove("jatsParser__fade");
    window.scrollTo(0, pageYoffset);
  }
};

// Wrap modal logic in DOMContentLoaded or after page is ready
document.addEventListener("DOMContentLoaded", function () {
  
  // Initialize image processing and figure modals
  const container = document.getElementById("jatsParserFullText");
  if (container) {
    console.log("🚀 Initializing JATS parser with image support...");
    
    // Process images and set up figure modals
    FigureModal.init(container);
    
    // Add CSS styles for image handling
    addImageStyles();
  }

  // -------------------------------
  // Show author affiliation on click
  // -------------------------------
  (function () {
    var authorStrings = document.getElementsByClassName("jatsParser__meta-author-string-href");
    if (!authorStrings) return;

    for (var i = 0; i < authorStrings.length; i++) {
      var authorString = authorStrings.item(i);
      if (!authorString) continue;

      authorString.addEventListener("click", function (event) {
        event.preventDefault();
        var elementId = this.getAttribute("href").replace("#", "");
        var authorsDetails = document.getElementsByClassName("jatsParser__details-author");
        if (!authorsDetails) return;

        for (var y = 0; y < authorsDetails.length; y++) {
          var authorsDetail = authorsDetails.item(y);
          if (!authorsDetail) continue;

          if (authorsDetail.id === "jatsParser__" + elementId && authorsDetail.classList.contains("jatsParser__hideAuthor")) {
            authorsDetail.classList.remove("jatsParser__hideAuthor");
          } else {
            authorsDetail.classList.add("jatsParser__hideAuthor");
          }
        }

        for (var x = 0; x < authorStrings.length; x++) {
          var authorString2 = authorStrings.item(x);
          if (!authorString2) continue;

          if (authorString2.getAttribute("href") === "#" + elementId && !authorString2.classList.contains("active")) {
            authorString2.classList.add("active");
            for (var z = 0; z < authorString2.childNodes.length; z++) {
              var child = authorString2.childNodes[z];
              if (child.classList) {
                child.classList.toggle("jatsParser__hide", child.classList.contains("jatsParser__symbol-plus") === false);
              }
            }
          } else {
            authorString2.classList.remove("active");
            for (var j = 0; j < authorString2.childNodes.length; j++) {
              var child = authorString2.childNodes[j];
              if (child.classList) {
                child.classList.remove("jatsParser__hide");
              }
            }
          }
        }
      });
    }
  })();

  // -------------------------------
  // Bio modal
  // -------------------------------
  (function () {
    var modals = document.getElementsByClassName("jatsParser__modal-bio");
    var links = document.getElementsByClassName("jatsParser__details-bio-toggle");
    if (!modals || !links) return;

    for (var i = 0; i < links.length; i++) {
      var link = links.item(i);
      if (!link) continue;

      link.addEventListener("click", function (event) {
        event.preventDefault();
        var linkHref = this.getAttribute("href").replace("#", "");
        for (var j = 0; j < modals.length; j++) {
          var modal = modals.item(j);
          if (!modal) continue;
          if (modal.id === linkHref) modal.style.display = "block";
        }
      });
    }

    var closeLinks = document.getElementsByClassName("jatsParser__close");
    for (var z = 0; z < closeLinks.length; z++) {
      closeLinks.item(z).addEventListener("click", function () {
        for (var x = 0; x < modals.length; x++) {
          if (modals.item(x)) modals.item(x).style.display = "none";
        }
      });
    }

    window.addEventListener("click", function (event) {
      for (var c = 0; c < modals.length; c++) {
        if (event.target === modals.item(c)) {
          modals.item(c).style.display = "none";
        }
      }
    });
  })();

  // -------------------------------
  // ScrollSpy
  // -------------------------------
  (function () {
    function trackElement(headLvl, navLvl) {
      var sectionTitles = document.getElementsByClassName("article-section-title");
      if (!sectionTitles) return;
      var arrayReturn = sectionTitlePos(sectionTitles, headLvl);
      var closestToZeroElement = arrayReturn[0];
      var minimum = arrayReturn[1];

      var navItems = document.getElementsByClassName(navLvl);
      if (!navItems) return;

      if (closestToZeroElement) {
        var closestToZeroElementId = closestToZeroElement.getAttribute("id");
        for (var y = 0; y < navItems.length; y++) {
          var navItem = navItems.item(y);
          if (!navItem) continue;

          if (navItem.classList.contains("active")) navItem.classList.remove("active");
          if (navItem.getAttribute("href").trim().substr(1) === closestToZeroElementId) {
            navItem.classList.add("active");
          }
        }
      } else if (minimum === 1) {
        for (var z = 0; z < navItems.length; z++) {
          if (navItems.item(z).classList.contains("active")) {
            navItems.item(z).classList.remove("active");
          }
        }
      }
    }

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        setTimeout(function () {
          trackElement("H2", "jatsParser__nav-link");
          trackElement("H3", "jatsParser__subnav-link");
          ticking = false;
        }, 500);
        ticking = true;
      }
    });

    function sectionTitlePos(sectionTitles, headingLevel) {
      var closestToZeroElement = null;
      var minimum = 1;
      for (var i = 0; i < sectionTitles.length; i++) {
        var sectionTitle = sectionTitles.item(i);
        if (!sectionTitle) continue;
        if (sectionTitle.tagName === headingLevel) {
          var rect = sectionTitle.getBoundingClientRect();
          if (rect.top >= 1) continue;
          if (minimum === 1 || rect.top > minimum) {
            closestToZeroElement = sectionTitle;
            minimum = rect.top;
          }
        }
      }
      return [closestToZeroElement, minimum];
    }
  })();

  // -------------------------------
  // Accordion for small screens
  // -------------------------------
  (function () {
    var widthMarkerClass = "jatsparser__article-mobile-view";
    var hideElClass = "jatsParser__hide";
    var hideSectionContentClass = "jatsParser__hide-content";

    function accordionEventResize() {
      var articleWrapperEl = document.getElementById("jatsParserFullText");
      if (!articleWrapperEl) return;
      var widthLimit = 992;

      var headings = document.querySelectorAll("h2.article-section-title");
      if (!headings) return;

      if (window.innerWidth < widthLimit && !articleWrapperEl.classList.contains(widthMarkerClass)) {
        articleWrapperEl.classList.add(widthMarkerClass);
        headings.forEach(h => {
          if (!h.classList.contains(hideSectionContentClass)) toggleElementRecursively(h);
        });
      } else if (window.innerWidth >= widthLimit && articleWrapperEl.classList.contains(widthMarkerClass)) {
        articleWrapperEl.classList.remove(widthMarkerClass);
        headings.forEach(h => {
          if (h.classList.contains(hideSectionContentClass)) toggleElementRecursively(h);
        });
      }
    }

    function accordionClick() {
      var articleWrapperEl = document.getElementById("jatsParserFullText");
      if (!articleWrapperEl) return;

      var els = document.querySelectorAll("." + widthMarkerClass + " h2.article-section-title");
      if (els.length === 0) return;

      els.forEach(el => {
        if (!el.onclick) {
          el.onclick = function () {
            toggleElementRecursively(el);
            if (!el.classList.contains(hideSectionContentClass)) el.scrollIntoView();
          };
        }
      });
    }

    function toggleElementRecursively(sectionTitleEl) {
      if (!sectionTitleEl) return;
      sectionTitleEl.classList.toggle(hideSectionContentClass);

      var nextSibling = sectionTitleEl.nextElementSibling;
      while (nextSibling && nextSibling.tagName !== "H2") {
        nextSibling.classList.toggle(hideElClass);
        nextSibling = nextSibling.nextElementSibling;
      }
    }

    accordionEventResize();
    accordionClick();
    window.addEventListener("resize", function () {
      accordionEventResize();
      accordionClick();
    });
  })();

});

// ✅ Add CSS styles for enhanced image handling
function addImageStyles() {
  if (document.getElementById('jats-image-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'jats-image-styles';
  style.textContent = `
    /* Enhanced image styles */
    .jats-figure, .jats-graphic, .processed-image {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1rem auto;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s ease;
    }
    
    .jats-figure:hover, .jats-graphic:hover {
      transform: scale(1.02);
    }
    
    .jats-figure-container {
      margin: 2rem 0;
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
      text-align: center;
    }
    
    .figure-label {
      font-weight: bold;
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    
    .figure-caption {
      font-style: italic;
      color: #666;
      margin-top: 1rem;
      font-size: 0.9rem;
      line-height: 1.4;
    }
    
    .base64-image {
      border: 2px dashed #ccc;
      padding: 0.5rem;
    }
    
    .image-placeholder {
      background: #f5f5f5;
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      margin: 1rem auto;
      color: #666;
    }
    
    .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    
    .placeholder-icon {
      font-size: 2rem;
      opacity: 0.5;
    }
    
    .placeholder-text {
      font-weight: bold;
    }
    
    .placeholder-path {
      font-size: 0.8rem;
      opacity: 0.7;
      word-break: break-all;
    }
    
    /* Enhanced modal styles for images */
    .jatsParser__modal img {
      max-width: 90vw;
      max-height: 80vh;
      object-fit: contain;
    }
    
    .jatsParser__modal figure {
      margin: 0;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      max-width: 95vw;
      max-height: 90vh;
      overflow: auto;
    }
    
    /* Expand button styling */
    .jatsParser__expand {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.7);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px;
      cursor: pointer;
      font-size: 16px;
      z-index: 10;
      transition: background 0.2s ease;
    }
    
    .jatsParser__expand:hover {
      background: rgba(0,0,0,0.9);
    }
    
    figure {
      position: relative;
    }
    
    /* Loading animation for images */
    img.processed-image {
      transition: opacity 0.3s ease;
    }
    
    img.processed-image:not([src]) {
      opacity: 0.5;
    }
  `;
  document.head.appendChild(style);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    JATSParser,
    ImageProcessor,
    FigureModal,
    addImageStyles
  };
}

// Also export for ES6 modules
export { addImageStyles, FigureModal, ImageProcessor, JATSParser };
