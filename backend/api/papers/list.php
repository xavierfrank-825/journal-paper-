<?php
// backend/api/papers/list.php

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once '../../config/cors.php';

try {
    include_once '../../config/database.php';
    include_once '../../classes/Paper.php';
    
    session_start();
    
    // Check if user is authenticated
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(array("message" => "Authentication required"));
        exit();
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        http_response_code(500);
        echo json_encode(array("message" => "Database connection failed"));
        exit();
    }
    
    $paper = new Paper($db);
    $stmt = $paper->readAll();
    $papers = array();

    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $paper_item = array(
            "id" => $row['id'],
            "title" => $row['title'],
            "filename" => $row['filename'],
            "uploaded_by" => $row['uploaded_by_name'],
            "created_at" => $row['created_at'],
            "status" => $row['status']
        );
        
        array_push($papers, $paper_item);
    }
    
    http_response_code(200);
    echo json_encode($papers);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Server error: " . $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ));
}
?>