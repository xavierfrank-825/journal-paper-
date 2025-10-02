<?php
// api/auth/read.php

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
include_once '../../classes/Paper.php';

try {
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $per_page = isset($_GET['per_page']) ? max(1, (int)$_GET['per_page']) : 20;
    $offset = ($page - 1) * $per_page;

    $dbObj = new Database();
    $db = $dbObj->getConnection();

    // get total count
    $countStmt = $db->query("SELECT COUNT(*) AS cnt FROM papers");
    $total = (int)$countStmt->fetchColumn();

    // fetch only html_content
    $stmt = $db->prepare("
        SELECT html_content
        FROM papers
        ORDER BY id DESC
        LIMIT :limit OFFSET :offset
    ");
    $stmt->bindValue(':limit', $per_page, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $total_pages = ($per_page > 0) ? (int)ceil($total / $per_page) : 0;

    echo json_encode([
        "success" => true,
        "count" => count($rows),
        "total" => $total,
        "page" => $page,
        "per_page" => $per_page,
        "total_pages" => $total_pages,
        "data" => $rows
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB error: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
