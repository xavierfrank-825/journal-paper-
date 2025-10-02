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
        /* Your existing CSS stays here — unchanged */
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
        .figure, .table {
            margin: 20px 0;
            text-align: center;
        }
        .figure img {
            max-width: 100%;
            height: auto;
        }
        caption {
            font-style: italic;
            margin-top: 8px;
            color: #555;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
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
                case 'article': $html .= '<article>'; break;
                case 'title': $html .= '<h1>'; break;
                case 'abstract': $html .= '<div class="abstract"><h2>Abstract</h2>'; break;
                case 'keywords': $html .= '<div class="keywords"><strong>Keywords:</strong> '; break;
                case 'author': $html .= '<div class="author">'; break;
                case 'section': $html .= '<section>'; break;
                case 'heading':
                case 'h1': $html .= '<h2>'; break;
                case 'h2': $html .= '<h3>'; break;
                case 'paragraph':
                case 'p': $html .= '<p>'; break;
                case 'figure': $html .= '<div class="figure">'; break;
                case 'img':
                    $src = $node->getAttribute("src");
                    $alt = $node->getAttribute("alt") ?: "Figure";
                    $html .= '<img src="' . htmlspecialchars($src) . '" alt="' . htmlspecialchars($alt) . '">';
                    break;
                case 'caption': $html .= '<caption>'; break;
                case 'table': $html .= '<table>'; break;
                case 'row':
                case 'tr': $html .= '<tr>'; break;
                case 'cell':
                case 'td': $html .= '<td>'; break;
                case 'header':
                case 'th': $html .= '<th>'; break;
                case 'list':
                case 'ul': $html .= '<ul>'; break;
                case 'item':
                case 'li': $html .= '<li>'; break;
                case 'reference': $html .= '<div class="reference">'; break;
                case 'references': $html .= '<h2>References</h2><div class="references">'; break;
                case 'equation': $html .= '<div class="equation">'; break;
                case 'sup': $html .= '<sup>'; break;
                case 'sub': $html .= '<sub>'; break;
                case 'bold':
                case 'b': $html .= '<strong>'; break;
                case 'italic':
                case 'i': $html .= '<em>'; break;
                default: break;
            }

            foreach ($node->childNodes as $child) {
                $html .= self::parseNode($child);
            }

            switch ($tagName) {
                case 'paper':
                case 'article': $html .= '</article>'; break;
                case 'title': $html .= '</h1>'; break;
                case 'abstract':
                case 'keywords':
                case 'author':
                case 'figure':
                case 'references':
                case 'reference':
                case 'equation': $html .= '</div>'; break;
                case 'section': $html .= '</section>'; break;
                case 'heading':
                case 'h1': $html .= '</h2>'; break;
                case 'h2': $html .= '</h3>'; break;
                case 'paragraph':
                case 'p': $html .= '</p>'; break;
                case 'table': $html .= '</table>'; break;
                case 'row':
                case 'tr': $html .= '</tr>'; break;
                case 'cell':
                case 'td': $html .= '</td>'; break;
                case 'header':
                case 'th': $html .= '</th>'; break;
                case 'list':
                case 'ul': $html .= '</ul>'; break;
                case 'item':
                case 'li': $html .= '</li>'; break;
                case 'caption': $html .= '</caption>'; break;
                case 'sup': $html .= '</sup>'; break;
                case 'sub': $html .= '</sub>'; break;
                case 'bold':
                case 'b': $html .= '</strong>'; break;
                case 'italic':
                case 'i': $html .= '</em>'; break;
                default: break;
            }
        }

        return $html;
    }

    private static function fixBrokenCitations($text) {
        // 🧠 Fix 3-line broken citations like:
        // (
        // Kalra et al., 2023
        // )
        $text = preg_replace('/\(\s*\n\s*([^()\n]+?\s+et al\.,?\s*\d{4})\s*\n\s*\)/', '$1', $text);

        // 🧠 Fix 2-line broken citations like:
        // (Kalra et al., 2023
        // )
        $text = preg_replace('/\(\s*([^()\n]+?\s+et al\.,?\s*\d{4})\s*\n*\s*\)/', '$1', $text);

        // 🧹 Optional: Remove remaining ( ... ) patterns safely
        $text = preg_replace('/\(\s*([^\n()]{5,100}?)\s*\)/', '$1', $text);

        return $text;
    }
}

?>
