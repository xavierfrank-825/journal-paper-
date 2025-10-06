<?php
// backend/api/papers/upload.php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../classes/Paper.php';
include_once '../../classes/XMLParser.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

try {
    // Authentication
    if (!isset($_SESSION['user_id'])) {
        http_response_code(403);
        echo json_encode(["message" => "Authentication required"]);
        exit();
    }
    if ($_SESSION['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Admin access required"]);
        exit();
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["message" => "Only POST method allowed"]);
        exit();
    }

    // Check uploaded file
    if (!isset($_FILES['xmlFile'])) {
        http_response_code(400);
        echo json_encode([
            "message" => "XML file not found in request",
            "received_files" => array_keys($_FILES)
        ]);
        exit();
    }

    // Get title and volume from POST data
    if (!isset($_POST['title']) || empty(trim($_POST['title']))) {
        http_response_code(400);
        echo json_encode(["message" => "Title is required"]);
        exit();
    }

    if (!isset($_POST['volume']) || empty(trim($_POST['volume']))) {
        http_response_code(400);
        echo json_encode(["message" => "Volume is required"]);
        exit();
    }

    $title = trim($_POST['title']);
    $volume = trim($_POST['volume']);

    $file = $_FILES['xmlFile'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["message" => "File upload error", "error_code" => $file['error']]);
        exit();
    }

    $filename = $file['name'];
    $tmpPath = $file['tmp_name'];
    $fileSize = $file['size'];

    if (strtolower(pathinfo($filename, PATHINFO_EXTENSION)) !== 'xml') {
        http_response_code(400);
        echo json_encode(["message" => "Only XML files are allowed"]);
        exit();
    }

    $xmlContent = file_get_contents($tmpPath);
    if (!$xmlContent) {
        http_response_code(500);
        echo json_encode(["message" => "Failed to read XML file"]);
        exit();
    }

    // Validate XML
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    if (!$dom->loadXML($xmlContent)) {
        $errors = array_map(fn($e) => trim($e->message), libxml_get_errors());
        http_response_code(400);
        echo json_encode(["message" => "Invalid XML", "xml_errors" => $errors]);
        exit();
    }

    // Convert XML to HTML
    $htmlContent = CustomXMLParser::xmlToHtml($xmlContent);
    if (empty($htmlContent)) {
        http_response_code(500);
        echo json_encode(["message" => "Failed to convert XML to HTML"]);
        exit();
    }

    // Upload file
    $uploadDir = __DIR__ . '/../../uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
    $uniqueFilename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);
    $uploadPath = $uploadDir . $uniqueFilename;
    if (!move_uploaded_file($tmpPath, $uploadPath)) {
        http_response_code(500);
        echo json_encode(["message" => "Failed to save uploaded file"]);
        exit();
    }

    // Save in database
    $db = (new Database())->getConnection();
    $paper = new Paper($db);
    $paper->title = $title;
    $paper->volume = $volume;
    $paper->filename = $uniqueFilename;
    $paper->xml_content = $xmlContent;
    $paper->html_content = $htmlContent;
    $paper->user_id = $_SESSION['user_id']; // Correct property name
    $paper->status = 'pending';

    if ($paper->create()) {
        http_response_code(201);
        echo json_encode([
            "message" => "Paper uploaded successfully",
            "title" => $title,
            "volume" => $volume,
            "filename" => $uniqueFilename,
            "file_size" => $fileSize
        ]);
    } else {
        if (file_exists($uploadPath)) unlink($uploadPath);
        http_response_code(500);
        echo json_encode(["message" => "Failed to save paper to database"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Server error: " . $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ]);
}
?>