<?php
// backend/classes/XMLParser.php

class CustomXMLParser {

    public static function xmlToHtml($xmlContent) {
        try {
            $dom = new DOMDocument();
            $dom->preserveWhiteSpace = false;
            $dom->formatOutput = true;
            $dom->loadXML($xmlContent);

            $html = self::parseNode($dom->documentElement);

            return '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Research Paper</title>
    <style>
        body {
            font-family: "Times New Roman", serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .paper-container {
            background: white;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 8px;
        }
        h1 { 
            color: #2c3e50; 
            border-bottom: 3px solid #3498db; 
            padding-bottom: 10px; 
            text-align: center;
        }
        h2 { 
            color: #34495e; 
            margin-top: 30px;
            border-left: 4px solid #3498db;
            padding-left: 15px;
        }
        h3 { color: #5a6c7d; }
        .abstract {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 5px solid #3498db;
        }
        .keywords {
            background: #e8f4fd;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .author {
            text-align: center;
            font-style: italic;
            margin: 10px 0;
            color: #7f8c8d;
        }
        .reference {
            margin-bottom: 10px;
            padding-left: 20px;
            text-indent: -20px;
        }
        .figure, .table-wrap {
            margin: 30px 0;
            text-align: center;
            page-break-inside: avoid;
        }
        .figure img, .inline-graphic {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .inline-graphic {
            display: inline-block;
            vertical-align: middle;
            max-height: 1.5em;
        }
        .figure-caption, .table-caption {
            font-style: italic;
            margin-top: 12px;
            color: #555;
            font-size: 0.95em;
            text-align: center;
            padding: 0 20px;
        }
        .figure-label {
            font-weight: bold;
            color: #2c3e50;
        }
        caption {
            font-style: italic;
            margin-top: 8px;
            color: #555;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px auto;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #3498db;
            color: white;
        }
        .equation {
            text-align: center;
            margin: 15px 0;
            font-style: italic;
        }
        .img-error {
            background: #fee;
            padding: 10px;
            border: 1px solid #fcc;
            border-radius: 4px;
            color: #c33;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="paper-container">' . $html . '</div>
</body>
</html>';
        } catch (Exception $e) {
            return '<html><body><h1>Error parsing XML</h1><p>' . htmlspecialchars($e->getMessage()) . '</p></body></html>';
        }
    }

    private static function parseNode($node) {
        $html = '';

        if ($node->nodeType == XML_TEXT_NODE) {
            $text = trim($node->textContent);
            $cleaned = self::fixBrokenCitations($text);
            return htmlspecialchars($cleaned);
        }

        if ($node->nodeType == XML_ELEMENT_NODE) {
            $tagName = strtolower($node->nodeName);

            switch ($tagName) {
                case 'paper':
                case 'article': 
                    $html .= '<article>'; 
                    break;
                    
                case 'title': 
                    $html .= '<h1>'; 
                    break;
                    
                case 'abstract': 
                    $html .= '<div class="abstract"><h2>Abstract</h2>'; 
                    break;
                    
                case 'keywords': 
                    $html .= '<div class="keywords"><strong>Keywords:</strong> '; 
                    break;
                    
                case 'author': 
                    $html .= '<div class="author">'; 
                    break;
                    
                case 'section': 
                    $html .= '<section>'; 
                    break;
                    
                case 'heading':
                case 'h1': 
                    $html .= '<h2>'; 
                    break;
                    
                case 'h2': 
                    $html .= '<h3>'; 
                    break;
                    
                case 'paragraph':
                case 'p': 
                    $html .= '<p>'; 
                    break;

                // 🖼️ JATS Figure with Caption
                case 'fig':
                    $html .= '<div class="figure">';
                    // Look for label (e.g., "Figure 1")
                    $label = '';
                    $caption = '';
                    foreach ($node->childNodes as $child) {
                        if ($child->nodeName === 'label') {
                            $label = trim($child->textContent);
                        } elseif ($child->nodeName === 'caption') {
                            $caption = trim($child->textContent);
                        }
                    }
                    break;

                // 🖼️ JATS Graphic Tag (main image reference)
                case 'graphic':
                    $imageUrl = self::extractImageUrl($node);
                    if ($imageUrl) {
                        $alt = $node->getAttribute('alt') ?: 'Research figure';
                        $html .= '<img src="' . htmlspecialchars($imageUrl) . '" alt="' . htmlspecialchars($alt) . '" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=&quot;img-error&quot;>Image failed to load: ' . htmlspecialchars($imageUrl) . '</div>\'">';
                    }
                    return $html; // Don't process children for graphic tags

                // 🖼️ JATS Inline Graphic (small inline images)
                case 'inline-graphic':
                    $imageUrl = self::extractImageUrl($node);
                    if ($imageUrl) {
                        $alt = $node->getAttribute('alt') ?: 'inline graphic';
                        $html .= '<img class="inline-graphic" src="' . htmlspecialchars($imageUrl) . '" alt="' . htmlspecialchars($alt) . '" loading="lazy">';
                    }
                    return $html;

                // Standard img tag (fallback)
                case 'img':
                    $src = $node->getAttribute("src");
                    $alt = $node->getAttribute("alt") ?: "Figure";
                    if ($src) {
                        $html .= '<img src="' . htmlspecialchars($src) . '" alt="' . htmlspecialchars($alt) . '" loading="lazy">';
                    }
                    break;

                case 'caption': 
                    $html .= '<div class="figure-caption">'; 
                    break;
                    
                case 'label':
                    $html .= '<span class="figure-label">';
                    break;

                case 'table-wrap':
                    $html .= '<div class="table-wrap">';
                    break;

                case 'table': 
                    $html .= '<table>'; 
                    break;
                    
                case 'thead':
                    $html .= '<thead>';
                    break;

                case 'tbody':
                    $html .= '<tbody>';
                    break;

                case 'row':
                case 'tr': 
                    $html .= '<tr>'; 
                    break;
                    
                case 'cell':
                case 'td': 
                    $html .= '<td>'; 
                    break;
                    
                case 'header':
                case 'th': 
                    $html .= '<th>'; 
                    break;
                    
                case 'list':
                case 'ul': 
                    $html .= '<ul>'; 
                    break;
                    
                case 'item':
                case 'li': 
                    $html .= '<li>'; 
                    break;
                    
                case 'reference': 
                    $html .= '<div class="reference">'; 
                    break;
                    
                case 'references':
                case 'ref-list': 
                    $html .= '<h2>References</h2><div class="references">'; 
                    break;
                    
                case 'equation':
                case 'disp-formula': 
                    $html .= '<div class="equation">'; 
                    break;
                    
                case 'sup': 
                    $html .= '<sup>'; 
                    break;
                    
                case 'sub': 
                    $html .= '<sub>'; 
                    break;
                    
                case 'bold':
                case 'b': 
                    $html .= '<strong>'; 
                    break;
                    
                case 'italic':
                case 'i': 
                    $html .= '<em>'; 
                    break;
                    
                default: 
                    break;
            }

            // Process child nodes
            foreach ($node->childNodes as $child) {
                $html .= self::parseNode($child);
            }

            // Closing tags
            switch ($tagName) {
                case 'paper':
                case 'article': 
                    $html .= '</article>'; 
                    break;
                    
                case 'title': 
                    $html .= '</h1>'; 
                    break;
                    
                case 'abstract':
                case 'keywords':
                case 'author':
                case 'references':
                case 'ref-list':
                case 'reference':
                case 'equation':
                case 'disp-formula':
                    $html .= '</div>'; 
                    break;

                case 'fig':
                case 'table-wrap':
                    $html .= '</div>';
                    break;

                case 'caption':
                    $html .= '</div>';
                    break;

                case 'label':
                    $html .= '</span> ';
                    break;
                    
                case 'section': 
                    $html .= '</section>'; 
                    break;
                    
                case 'heading':
                case 'h1': 
                    $html .= '</h2>'; 
                    break;
                    
                case 'h2': 
                    $html .= '</h3>'; 
                    break;
                    
                case 'paragraph':
                case 'p': 
                    $html .= '</p>'; 
                    break;
                    
                case 'table': 
                    $html .= '</table>'; 
                    break;

                case 'thead':
                    $html .= '</thead>';
                    break;

                case 'tbody':
                    $html .= '</tbody>';
                    break;
                    
                case 'row':
                case 'tr': 
                    $html .= '</tr>'; 
                    break;
                    
                case 'cell':
                case 'td': 
                    $html .= '</td>'; 
                    break;
                    
                case 'header':
                case 'th': 
                    $html .= '</th>'; 
                    break;
                    
                case 'list':
                case 'ul': 
                    $html .= '</ul>'; 
                    break;
                    
                case 'item':
                case 'li': 
                    $html .= '</li>'; 
                    break;
                    
                case 'sup': 
                    $html .= '</sup>'; 
                    break;
                    
                case 'sub': 
                    $html .= '</sub>'; 
                    break;
                    
                case 'bold':
                case 'b': 
                    $html .= '</strong>'; 
                    break;
                    
                case 'italic':
                case 'i': 
                    $html .= '</em>'; 
                    break;
                    
                default: 
                    break;
            }
        }

        return $html;
    }

    /**
     * Extract image URL from JATS XML graphic elements
     * Handles xlink:href and href attributes
     */
    private static function extractImageUrl($node) {
        // Try xlink:href first (JATS standard)
        $xlinkHref = $node->getAttributeNS('http://www.w3.org/1999/xlink', 'href');
        if (!empty($xlinkHref)) {
            return self::normalizeImageUrl($xlinkHref);
        }

        // Try regular href attribute
        $href = $node->getAttribute('href');
        if (!empty($href)) {
            return self::normalizeImageUrl($href);
        }

        // Try xlink:href without namespace (some parsers strip it)
        $xlinkHrefAlt = $node->getAttribute('xlink:href');
        if (!empty($xlinkHrefAlt)) {
            return self::normalizeImageUrl($xlinkHrefAlt);
        }

        // Try src attribute as fallback
        $src = $node->getAttribute('src');
        if (!empty($src)) {
            return self::normalizeImageUrl($src);
        }

        return null;
    }

    /**
     * Normalize image URLs - handle both full URLs and relative paths
     */
    private static function normalizeImageUrl($url) {
        $url = trim($url);
        
        // If it's already a full URL (http/https), return as is
        if (preg_match('/^https?:\/\//i', $url)) {
            return $url;
        }

        // If it starts with //, add https:
        if (strpos($url, '//') === 0) {
            return 'https:' . $url;
        }

        // If it's a relative path but looks like an S3 URL pattern, construct full URL
        if (strpos($url, 'jourdata.s3') !== false || strpos($url, '.amazonaws.com') !== false) {
            if (strpos($url, 'https://') !== 0) {
                return 'https://' . ltrim($url, '/');
            }
        }

        // Return as is - might be handled by frontend or base href
        return $url;
    }

    /**
     * Fix broken citations in text
     */
    private static function fixBrokenCitations($text) {
        // Fix 3-line broken citations
        $text = preg_replace('/\(\s*\n\s*([^()\n]+?\s+et al\.,?\s*\d{4})\s*\n\s*\)/', '$1', $text);

        // Fix 2-line broken citations
        $text = preg_replace('/\(\s*([^()\n]+?\s+et al\.,?\s*\d{4})\s*\n*\s*\)/', '$1', $text);

        // Remove remaining ( ... ) patterns safely
        $text = preg_replace('/\(\s*([^\n()]{5,100}?)\s*\)/', '$1', $text);

        return $text;
    }
}

?>