<?php
// backend/api/papers/get.php

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

$database = new Database();
$db = $database->getConnection();
$paper = new Paper($db);

// If ID provided → return one
if (!empty($_GET['id'])) {
    $paper->id = intval($_GET['id']);
    $result = $paper->readOne();
    if ($result) {
        echo json_encode($result, JSON_PRETTY_PRINT);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Paper not found"]);
    }
} else {
    // Return all
    $stmt = $paper->readAll();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows, JSON_PRETTY_PRINT);
}