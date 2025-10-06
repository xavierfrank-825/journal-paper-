<?php
// api/papers/view.php
$allowed_origin = "http://localhost:3000";
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: $allowed_origin");
}
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once '../../config/database.php';

try {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing id']);
        exit;
    }

    $dbObj = new Database();
    $db = $dbObj->getConnection();

    $stmt = $db->prepare("SELECT html_content FROM papers WHERE id = :id LIMIT 1");
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Paper not found']);
        exit;
    }

    $html = $row['html_content'];

    // Base URL for making relative URLs absolute
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $base = $scheme . '://' . $host;

    libxml_use_internal_errors(true);
    $doc = new DOMDocument();
    $doc->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

    $imgs = $doc->getElementsByTagName('img');
    for ($i = $imgs->length - 1; $i >= 0; $i--) {
        $img = $imgs->item($i);
        $src = $img->getAttribute('src');
        if ($src && !preg_match('#^https?://#i', $src)) {
            $img->setAttribute('src', rtrim($base, '/') . '/' . ltrim($src, '/'));
        }
        if (!$img->hasAttribute('loading')) $img->setAttribute('loading', 'lazy');
    }

    $anchors = $doc->getElementsByTagName('a');
    for ($i = $anchors->length - 1; $i >= 0; $i--) {
        $a = $anchors->item($i);
        $href = $a->getAttribute('href');
        if ($href && !preg_match('#^(mailto:|tel:|#|https?://)#i', $href)) {
            $a->setAttribute('href', rtrim($base, '/') . '/' . ltrim($href, '/'));
        }
        $a->setAttribute('target', '_blank');
        $a->setAttribute('rel', 'noopener noreferrer');
    }

    $fixed = $doc->saveHTML();

    echo json_encode(['success' => true, 'html' => $fixed]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'DB error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
