// Import the JATS Parser Plugin
import { JATSParser } from './jatsParser';
import './JatsParser.css';

// ✅ Preprocessing function to fix common DOI formatting issues
export const preprocessDOISpacing = (content) => {
  if (!content) return "";
  
  console.log("🔧 Preprocessing DOI spacing issues...");
  
  let result = content;
  
  // Fix specific DOI concatenation issues
  const doiSpacingFixes = [
    // Add space between DOI and common suffixes
    { pattern: /(10\.\d{4,9}\/[A-Za-z0-9.\-_]+)(Original|Article|Research|Review|Study|Paper|Abstract)/g, replacement: '$1 $2' },
    // Add space between DOI and asterisks
    { pattern: /(10\.\d{4,9}\/[A-Za-z0-9.\-_]+)(\*+)/g, replacement: '$1 $2' },
    // Add space between numbers and uppercase letters (common metadata issue)
    { pattern: /(\d)([A-Z][a-z]+)/g, replacement: '$1 $2' },
    // Fix repeated journal names without spaces
    { pattern: /(Investigation\.)(?=Int\.)/g, replacement: '$1 ' },
  ];
  
  doiSpacingFixes.forEach(({ pattern, replacement }, index) => {
    const beforeCount = (result.match(pattern) || []).length;
    result = result.replace(pattern, replacement);
    const afterCount = (result.match(pattern) || []).length;
    
    if (beforeCount > afterCount) {
      console.log(`✅ Applied spacing fix ${index + 1}: ${beforeCount - afterCount} replacements`);
    }
  });
  
  return result;
};

// ✅ Parse JATS XML into structured HTML using the plugin
export const parseXMLToHTML = (xmlString) => {
  try {
    xmlString = fixMultilineCitations(xmlString);

    const parser = new JATSParser();
    let parsedHTML = parser.parse(xmlString);

        parsedHTML = replaceReferencesInHTML(parsedHTML);

    // IMPORTANT: Apply DOI spacing preprocessing BEFORE other processing
    parsedHTML = preprocessDOISpacing(parsedHTML);

    // Fix spacing in metadata and text
    parsedHTML = fixSpacingInMetadata(parsedHTML);

    // Your other processing
    parsedHTML = cleanCitations(parsedHTML);
    parsedHTML = fixDOILinks(parsedHTML);
    parsedHTML = linkifyURLs(parsedHTML);

    const html = `<div class="paper-preview">${parsedHTML}</div>`;
    return html;
  } catch (error) {
    console.error("Error parsing JATS XML:", error);
    return "<p>Invalid XML file</p>";
  }
};

// ✅ ENHANCED DOI link detection with suffix support - IMPROVED VERSION
export const fixDOILinks = (htmlContent) => {
  if (!htmlContent) return "";

  console.log("🔍 Processing DOI links with suffix support...");
  
  // Enhanced DOI regex that handles suffixes, special characters, and concatenated text
  // This regex is more permissive and handles DOIs with various suffixes including text concatenation
  const doiRegex = /(10\.\d{4,9}\/[A-Za-z0-9.\-_()\/:\[\]<>]+)([A-Za-z]*)/gi;
  
  let result = htmlContent;
  let convertedCount = 0;

  // Split content by HTML tags to process only text content safely
  const parts = result.split(/(<[^>]*>)/);
  
  for (let i = 0; i < parts.length; i++) {
    // Only process text parts (even indices after split)
    if (i % 2 === 0 && parts[i]) {
      parts[i] = parts[i].replace(doiRegex, (match, doiPart, suffix) => {
        console.log(`🔍 Found potential DOI: "${match}" (DOI: "${doiPart}", Suffix: "${suffix}")`);
        
        // Check if this text is already part of a link by looking at surrounding HTML
        const beforeText = parts.slice(0, i).join('');
        const isAlreadyLinked = isPartOfExistingLink(beforeText, match);
        
        if (isAlreadyLinked) {
          return match;
        }
        
        const cleanDoi = cleanDOIString(doiPart);
        if (cleanDoi && isValidDOI(cleanDoi)) {
          convertedCount++;
          console.log(`Converting DOI with suffix: ${match} -> ${cleanDoi} (suffix "${suffix}" removed)`);
          
          // Return the clean DOI as a link, plus any remaining suffix text
          const remainingSuffix = suffix && !['original', 'article', 'research', 'review', 'study', 'paper', 'abstract', 'introduction', 'conclusion', 'references'].includes(suffix.toLowerCase()) ? suffix : '';
          
          return `<a href="https://doi.org/${cleanDoi}" target="_blank" rel="noopener noreferrer" class="doi-link">${cleanDoi}</a>${remainingSuffix}`;
        }
        return match;
      });
    }
  }

  result = parts.join('');
  console.log(`✅ Converted ${convertedCount} DOI texts to links (with suffix support)`);
  return result;
};

// ✅ Check if DOI is already part of an existing link
const isPartOfExistingLink = (precedingHTML, doiText) => {
  // Check if the preceding HTML ends with an unclosed <a> tag
  const openLinkRegex = /<a\b[^>]*>(?!.*<\/a>)[^<]*$/i;
  return openLinkRegex.test(precedingHTML);
};

// ✅ ENHANCED: Clean and extract valid DOI portion with suffix support
const cleanDOIString = (doi) => {
  if (!doi) return '';

  console.log(`🧹 Cleaning DOI: "${doi}"`);

  // Remove any doi.org prefix
  let normalized = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim();
  
  // Handle specific problematic suffixes like "Original", "Article", etc.
  // These are likely formatting artifacts, not part of the DOI
  normalized = normalized.replace(/(Original|Article|Research|Review|Study|Paper|Abstract|Introduction|Conclusion|References)$/i, '');
  
  // Remove common trailing punctuation but preserve DOI suffixes
  // Be more careful about what we consider "trailing punctuation"
  normalized = normalized.replace(/[,;:!\?\s]+$/, ''); // Remove common sentence endings
  normalized = normalized.replace(/\.+$/, ''); // Remove trailing dots (but preserve dots in suffixes)
  
  // Handle parentheses more carefully - only remove if they seem unbalanced
  const openParens = (normalized.match(/\(/g) || []).length;
  const closeParens = (normalized.match(/\)/g) || []).length;
  if (openParens < closeParens) {
    normalized = normalized.replace(/\)+$/, ''); // Remove trailing closing parens
  }
  
  // Remove any trailing alphabetic suffixes that don't look like valid DOI parts
  // This handles cases like "10.1234/example.2023SomeText" -> "10.1234/example.2023"
  normalized = normalized.replace(/([0-9])([A-Za-z]{3,})$/, '$1');
  
  // Basic validation - must start with 10. followed by digits, then a slash
  if (!/^10\.\d+\//.test(normalized)) {
    console.log(`❌ Invalid DOI format: "${normalized}"`);
    return '';
  }
  
  // Enhanced pattern for DOI extraction with suffix support
  // This pattern is more permissive and handles various DOI suffixes
  const match = normalized.match(/^(10\.\d{4,9}\/[A-Za-z0-9.\-_()\/:\[\]<>]+(?:\.[A-Za-z0-9\-_]+)*)/);
  
  const result = match ? match[1] : normalized;
  console.log(`✅ Cleaned DOI result: "${result}"`);
  return result;
};

// ✅ ENHANCED DOI validation with suffix support
export const isValidDOI = (doi) => {
  if (!doi) return false;
  
  const clean = cleanDOIString(doi);
  
  // More comprehensive DOI regex that handles suffixes and special characters
  const doiPattern = /^10\.\d{4,9}\/[A-Za-z0-9.\-_()\/:\[\]<>]+(?:\.[A-Za-z0-9\-_]+)*$/i;
  
  const isValid = doiPattern.test(clean) && clean.length > 7;
  console.log(`🔍 DOI validation: "${clean}" -> ${isValid}`);
  return isValid;
};

// ✅ Alternative approach with even more aggressive suffix support
export const fixDOILinksAlternative = (htmlContent) => {
  if (!htmlContent) return "";

  console.log("🔄 Alternative DOI processing with enhanced suffix support...");
  
  // Ultra-comprehensive DOI regex with multiple suffix patterns
  const doiPatterns = [
    // Standard pattern with suffixes
    /(10\.\d{4,9}\/[A-Za-z0-9.\-_()\/:\[\]<>]+(?:\.[A-Za-z0-9\-_]+)*)/gi,
    // Pattern for DOIs with special suffixes like .v1, .r2, etc.
    /(10\.\d{4,9}\/[A-Za-z0-9.\-_()\/]+(?:\.[vr]\d+)?(?:\.[A-Za-z0-9\-_]+)*)/gi,
    // Pattern for DOIs with timestamp or version suffixes
    /(10\.\d{4,9}\/[A-Za-z0-9.\-_()\/]+(?:\.\d{8})?(?:\.[A-Za-z0-9\-_]+)*)/gi
  ];
  
  let result = htmlContent;
  let convertedCount = 0;

  // Split content by HTML tags to process only text content
  const parts = result.split(/(<[^>]*>)/);
  
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0 && parts[i]) {
      // Apply each DOI pattern
      doiPatterns.forEach((pattern, patternIndex) => {
        parts[i] = parts[i].replace(pattern, (match) => {
          // Skip if already processed
          if (match.includes('href="https://doi.org/')) {
            return match;
          }
          
          const cleanDoi = cleanDOIString(match);
          if (cleanDoi && isValidDOI(cleanDoi)) {
            convertedCount++;
            console.log(`Pattern ${patternIndex + 1} - Converting DOI: ${match} -> ${cleanDoi}`);
            return `<a href="https://doi.org/${cleanDoi}" target="_blank" rel="noopener noreferrer" class="doi-link">${cleanDoi}</a>`;
          }
          return match;
        });
      });
    }
  }

  result = parts.join('');
  console.log(`✅ Alternative method converted ${convertedCount} DOI texts to links`);
  return result;
};

// ✅ URL linkification - Enhanced version
export const linkifyURLs = (htmlContent) => {
  if (!htmlContent) return "";

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // More comprehensive URL regex
  const urlRegex = /(https?:\/\/[^\s<>()[\]{}'"]+)(?![^<]*>)/gi;
  const textNodes = getTextNodes(tempDiv);

  textNodes.forEach(node => {
    const text = node.textContent;
    if (urlRegex.test(text) && !isInsideLink(node)) {
      const parent = node.parentNode;
      const wrapper = document.createElement('span');
      wrapper.innerHTML = text.replace(urlRegex, (url) => {
        // Don't convert DOI links that are already processed
        if (url.includes('doi.org')) {
          return url;
        }
        // Clean URL of trailing punctuation
        const cleanUrl = url.replace(/[.,;:!\?\s]+$/, '');
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="url-link">${cleanUrl}</a>`;
      });
      parent.insertBefore(wrapper, node);
      parent.removeChild(node);
    }
  });

  return tempDiv.innerHTML;
};

// ✅ Extract all DOIs from content - Enhanced version with suffix support
export const extractDOIs = (content) => {
  if (!content) return [];
  
  console.log("🔍 Extracting DOIs with suffix support...");
  
  // Multiple comprehensive regex patterns for different DOI formats
  const patterns = [
    // Standard DOI with suffixes
    /(10\.\d{4,9}\/[A-Za-z0-9.\-_()\/:\[\]<>]+(?:\.[A-Za-z0-9\-_]+)*)/gi,
    // DOI with version/revision suffixes
    /(10\.\d{4,9}\/[A-Za-z0-9.\-_()\/]+(?:\.[vr]\d+)?)/gi,
    // DOI with date/timestamp suffixes
    /(10\.\d{4,9}\/[A-Za-z0-9.\-_()\/]+(?:\.\d{6,8})?)/gi,
    // Simple word boundary pattern
    /\b(10\.\d{4,9}\/[^\s<>()[\]{}'".,;:!?]+)/gi
  ];
  
  const allMatches = new Set();
  
  patterns.forEach((pattern, index) => {
    const matches = content.match(pattern) || [];
    console.log(`Pattern ${index + 1} found ${matches.length} matches:`, matches);
    matches.forEach(match => allMatches.add(match));
  });
  
  const validDOIs = Array.from(allMatches)
    .map(match => {
      const cleaned = cleanDOIString(match);
      console.log(`Processing: "${match}" -> "${cleaned}"`);
      return cleaned;
    })
    .filter(Boolean)
    .filter(doi => {
      const isValid = isValidDOI(doi) && doi.length >= 7;
      console.log(`Validation: "${doi}" -> ${isValid}`);
      return isValid;
    });
  
  console.log(`✅ Final valid DOIs found: ${validDOIs.length}`, validDOIs);
  return validDOIs;
};

// ✅ Brute force DOI linking for stubborn cases with suffix support
export const bruteForceDOILinking = (htmlContent) => {
  if (!htmlContent) return "";
  console.log("💪 Brute force DOI linking with suffix support...");
  
  let result = htmlContent;
  
  // Ultra-comprehensive brute force patterns
  const bruteForcePatterns = [
    // Very permissive pattern that catches almost anything DOI-like
    /(10\.\d+\/[A-Za-z0-9.\-_()\/:\[\]<>]+)/g,
    // Pattern specifically for suffixed DOIs
    /(10\.\d+\/[^<>\s]+)/g
  ];
  
  bruteForcePatterns.forEach((pattern, index) => {
    result = result.replace(pattern, (match) => {
      // Skip if already a link
      if (result.includes(`href="https://doi.org/${match}"`) || 
          match.includes('<a ') || match.includes('</a>')) {
        return match;
      }
      
      const cleanDoi = cleanDOIString(match);
      if (cleanDoi && cleanDoi.length >= 7) {
        // Additional validation to avoid false positives
        if (/^10\.\d{4,9}\//.test(cleanDoi)) {
          console.log(`✅ Brute force pattern ${index + 1} converting: ${match} -> ${cleanDoi}`);
          return `<a href="https://doi.org/${cleanDoi}" target="_blank" rel="noopener noreferrer" class="doi-link">${cleanDoi}</a>`;
        }
      }
      return match;
    });
  });
  
  return result;
};

// ✅ Specific DOI targeting for known problematic DOIs
export const targetSpecificDOIs = (htmlContent, specificDOIs = []) => {
  if (!htmlContent) return "";
  
  let result = htmlContent;
  
  // Add some common problematic DOI patterns with text suffixes
  const commonProblematicPatterns = [
    { doi: "10.5530/ijpi.20250299", patterns: ["10.5530/ijpi.20250299Original", "10.5530/ijpi.20250299Article"] },
    // Add more specific DOI patterns here as needed
  ];
  
  const allTargetDOIs = [...specificDOIs];
  
  // Handle specific patterns with suffixes
  commonProblematicPatterns.forEach(({ doi, patterns }) => {
    patterns.forEach(pattern => {
      if (result.includes(pattern) && !result.includes(`href="https://doi.org/${doi}"`)) {
        const escapedPattern = escapeRegExp(pattern);
        const regex = new RegExp(`\\b${escapedPattern}\\b`, 'g');
        result = result.replace(regex, `<a href="https://doi.org/${doi}" target="_blank" rel="noopener noreferrer" class="doi-link">${doi}</a>`);
        console.log(`✅ Targeted specific DOI pattern: ${pattern} -> ${doi}`);
      }
    });
  });
  
  // Handle regular DOI targeting
  allTargetDOIs.forEach(doi => {
    const escapedDOI = escapeRegExp(doi);
    const regex = new RegExp(`\\b${escapedDOI}\\b`, 'g');
    
    if (result.includes(doi) && !result.includes(`href="https://doi.org/${doi}"`)) {
      result = result.replace(regex, `<a href="https://doi.org/${doi}" target="_blank" rel="noopener noreferrer" class="doi-link">${doi}</a>`);
      console.log(`✅ Targeted specific DOI: ${doi}`);
    }
  });
  
  return result;
};

// ✅ Main content linking function - Enhanced version with comprehensive DOI handling
export const linkifyContent = (content) => {
  console.log("🚀 Starting enhanced content linkification...");
  console.log("Input preview:", content.substring(0, 200));
  
  // STEP 0: Preprocess to fix spacing and formatting issues
  let updated = preprocessDOISpacing(content);
  console.log("After preprocessing:", updated.substring(0, 200));
  
  // First, extract and log all potential DOIs for debugging
  const allDOIs = extractDOIs(updated);
  console.log("🔍 Found potential DOIs:", allDOIs);
  
  // Apply multiple DOI linking strategies in sequence
  console.log("📝 Step 1: Standard DOI linking...");
  updated = fixDOILinks(updated);
  
  // Check if DOI links were created
  const hasDoiLinks = updated.includes('doi-link');
  console.log(`DOI links created in step 1: ${hasDoiLinks}`);
  
  if (!hasDoiLinks) {
    console.log("📝 Step 2: Alternative DOI linking method...");
    updated = fixDOILinksAlternative(updated);
  }
  
  // If still no DOI links, try brute force
  if (!updated.includes('doi-link')) {
    console.log("📝 Step 3: Brute force DOI linking...");
    updated = bruteForceDOILinking(updated);
  }
  
  // Target specific problematic DOIs
  console.log("📝 Step 4: Targeting specific DOIs...");
  updated = targetSpecificDOIs(updated, allDOIs);
  
  // Apply URL linking
  console.log("📝 Step 5: URL linking...");
  updated = linkifyURLs(updated);
  
  // Ensure styles are applied
  addDOIStyles();
  
  console.log("✅ Enhanced content linkification complete");
  console.log("Output preview:", updated.substring(0, 200));
  console.log(`Final DOI links created: ${updated.includes('doi-link')}`);
  
  return updated;
};

// ✅ Get all text nodes (non-whitespace) - Enhanced version
function getTextNodes(el) {
  const nodes = [];
  const walker = document.createTreeWalker(
    el, 
    NodeFilter.SHOW_TEXT, 
    {
      acceptNode: function(node) {
        // Only accept text nodes with meaningful content
        if (node.textContent.trim() && node.textContent.length > 0) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      }
    }, 
    false
  );
  
  let node;
  while ((node = walker.nextNode())) {
    nodes.push(node);
  }
  return nodes;
}

// ✅ Check if a text node is inside an <a> tag
function isInsideLink(node) {
  let parent = node.parentNode;
  while (parent && parent !== document) {
    if (parent.tagName && parent.tagName.toLowerCase() === 'a') {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
}

// ✅ Legacy linkifyDOI (for plain text content) - Enhanced version
export const linkifyDOI = (content) => {
  if (!content) return '';
  
  const containsHTML = /<[^>]+>/.test(content);
  if (containsHTML) {
    return linkifyContent(content);
  }
  
  // Enhanced DOI regex for plain text with suffix support
  const doiRegex = /(10\.\d{4,9}\/[A-Za-z0-9.\-_()\/:\[\]<>]+(?:\.[A-Za-z0-9\-_]+)*)/gi;
  return content.replace(doiRegex, (match) => {
    const clean = cleanDOIString(match);
    if (clean && isValidDOI(clean)) {
      return `<a href="https://doi.org/${clean}" target="_blank" rel="noopener noreferrer" class="doi-link">${clean}</a>`;
    }
    return match;
  });
};

// ✅ Download HTML helper
export const downloadHTML = (htmlContent, filename = "paper.html") => {
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ✅ Citation cleaning - Enhanced version
export const cleanCitations = (htmlContent) => {
  if (!htmlContent) return "";

  // Add space after period if missing and followed by uppercase letter or digit (common in journal abbreviations)
  htmlContent = htmlContent.replace(/\.([A-Z0-9])/g, '. $1');

  // Your existing cleaning logic here
  return htmlContent
    .replace(/\(\s*\n\s*([A-Z][^\n]+?,\s*\d{4})\s*\n\s*\)/g, "$1")
    .replace(/\(\s*([A-Z][^()]+?,\s*\d{4})\s*\)/g, "$1")
    .replace(/\s+\)/g, ")")
    .replace(/\(\s+/g, "(")
    .replace(/(\d{4})\s+\)/g, "$1")
    .replace(/\)\s*\./g, ".")
    .replace(/^\(\s*/gm, "")
    .replace(/\s*\)$/gm, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/\s{2,}/g, " ");
};

// ✅ Fix multiline citations
export const fixMultilineCitations = (content) => {
  if (!content) return "";
  let s = content;
  s = s.replace(/\(\s*\n\s*([^()\n]+?\s+et al\.,?\s*\d{4})\s*\n\s*\)/g, "$1");
  s = s.replace(/\(\s*([^()\n]+?\s+et al\.,?\s*\d{4})\s*\n*\s*\)/g, "$1");
  s = s.replace(/\(\s*([^\n()]+?)\s*\)/g, "$1");
  return s;
};

// ✅ Force DOI linking (fallback) - Enhanced version
export const forceDOILinking = (htmlContent) => {
  if (!htmlContent) return "";
  console.log("🔥 Force DOI linking with comprehensive approach...");
  
  return linkifyContent(htmlContent);
};

// ✅ Enhanced CSS for DOI + URL links
const addDOIStyles = () => {
  if (typeof document === 'undefined') return;
  
  // Check if styles already exist
  if (document.getElementById('doi-link-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'doi-link-styles';
  style.textContent = `
    .doi-link {
      color: #0066cc !important;
      text-decoration: underline !important;
      cursor: pointer !important;
      font-weight: 500;
      border-bottom: 1px dotted #0066cc;
      transition: all 0.2s ease;
    }
    .doi-link:hover {
      color: #004499 !important;
      background-color: #f0f8ff !important;
      border-bottom: 1px solid #004499;
    }
    .url-link {
      color: #0066cc !important;
      text-decoration: underline !important;
      cursor: pointer !important;
      transition: all 0.2s ease;
    }
    .url-link:hover {
      color: #004499 !important;
      background-color: #f0f8ff !important;
    }
  `;
  document.head.appendChild(style);
};

// Initialize styles when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addDOIStyles);
  } else {
    addDOIStyles();
  }
}

// ✅ Utility to escape regex special characters
const escapeRegExp = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// ✅ Debug function to test DOI detection with enhanced logging
export const debugDOIDetection = (content) => {
  console.log("🔍 Debug: Enhanced DOI detection testing");
  console.log("Input content:", content.substring(0, 500) + "...");
  
  // Test multiple patterns
  const patterns = [
    { name: "Standard", regex: /(10\.\d{4,9}\/[A-Za-z0-9.\-_()\/:\[\]<>]+(?:\.[A-Za-z0-9\-_]+)*)/gi },
    { name: "Word Boundary", regex: /\b(10\.\d{4,9}\/[^\s<>()[\]{}'".,;:!?]+)/gi },
    { name: "Simple", regex: /(10\.\d+\/[A-Za-z0-9.\-_()\/]+)/gi }
  ];
  
  patterns.forEach(({ name, regex }) => {
    const matches = content.match(regex) || [];
    console.log(`${name} pattern found:`, matches);
    
    matches.forEach(match => {
      const clean = cleanDOIString(match);
      const isValid = isValidDOI(clean);
      console.log(`  "${match}" -> "${clean}" -> Valid: ${isValid}`);
    });
  });
  
  return extractDOIs(content);
};

export const fixSpacingInMetadata = (htmlContent) => {
  if (!htmlContent) return "";

  // Insert a space between repeated journal names (e.g. when the same phrase repeats without space)
  htmlContent = htmlContent.replace(/(Int\. J\. Pharm\. Investigation\.)(?=Int\. J\. Pharm\. Investigation\.)/g, '$1 ');

  // Insert space after known metadata endings if directly followed by a capital letter or number
  htmlContent = htmlContent.replace(/([a-z0-9])([A-Z0-9])/g, '$1 $2');

  // Insert spaces after period before uppercase letter or digit (general fix)
  htmlContent = htmlContent.replace(/\.([A-Z0-9])/g, '. $1');

  // SPECIFIC FIX: Add space between DOI and text like "Original", "Article", etc.
  htmlContent = htmlContent.replace(/(10\.\d{4,9}\/[A-Za-z0-9.\-_]+)([A-Z][a-z]+)/g, '$1 $2');

  // Add line breaks or double newlines after certain keywords or punctuation (optional)
  htmlContent = htmlContent.replace(/(India)(?=[A-Z])/g, '$1\n'); // Example for country name

  return htmlContent;
};


const formatReferencesBlock = (rawRefs) => {
  if (!rawRefs) return "";

  // Heuristic split: look for 4-digit year as start of a new reference
  const parts = rawRefs.trim().split(/ (?=\d{4}[\s\.])/g);

  const listItems = parts.map(ref => `<li>${ref.trim()}</li>`).join("\n");

  return `<ol class="references-list">\n${listItems}\n</ol>`;
};

// Function: Replace raw references block in parsedHTML with formatted ones
const replaceReferencesInHTML = (html) => {
  // You need a reliable pattern or marker to locate where references start.
  // Suppose your parsed HTML has a heading like <h2>REFERENCES</h2> followed by a <div> or <p> containing the block
  // Adjust selectors / regex as per your output.

  // Option A: Use DOM parsing
  try {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Example: find <h2>REFERENCES</h2> then next sibling
    const headings = temp.querySelectorAll('h2, h3, h4');
    for (let h of headings) {
      if (h.textContent.trim().toUpperCase().includes("REFERENCES")) {
        let refNode = h.nextElementSibling;
        if (refNode) {
          const rawText = refNode.textContent;
          const formatted = formatReferencesBlock(rawText);
          // Replace the node content
          const wrapper = document.createElement('div');
          wrapper.innerHTML = formatted;
          h.parentNode.replaceChild(wrapper, refNode);
        }
        break;
      }
    }
    return temp.innerHTML;
  } catch (e) {
    console.error("Failed to replace references via DOM:", e);
    return html;
  }
};

