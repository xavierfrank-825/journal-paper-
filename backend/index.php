<?php
// backend/index.php

include_once 'config/cors.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Test database connection
include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo json_encode(array(
        "message" => "Paper Publication System API is running",
        "database" => "Connected successfully",
        "timestamp" => date('Y-m-d H:i:s')
    ));
} else {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Database connection failed",
        "timestamp" => date('Y-m-d H:i:s')
    ));
}
?>