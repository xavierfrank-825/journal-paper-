<?php
// backend/api/papers/delete.php

include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../classes/Paper.php';

header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Authentication required"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit();
}

if (empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["message" => "Paper ID required"]);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$paper = new Paper($db);

$paper->id = intval($_GET['id']);

if ($paper->delete()) {
    echo json_encode(["message" => "Paper deleted successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to delete paper"]);
}