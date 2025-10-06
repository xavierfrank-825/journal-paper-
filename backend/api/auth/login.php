<?php
// backend/api/auth/login.php

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once '../../config/cors.php';

try {
    include_once '../../config/database.php';
    include_once '../../classes/User.php';
    
    session_start();
    
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        http_response_code(500);
        echo json_encode(array("message" => "Database connection failed"));
        exit();
    }
    
    $user = new User($db);
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid JSON data"));
        exit();
    }
    
    if (!isset($data->username) || !isset($data->password)) {
        http_response_code(400);
        echo json_encode(array("message" => "Username and password are required"));
        exit();
    }
    
    if (empty(trim($data->username)) || empty(trim($data->password))) {
        http_response_code(400);
        echo json_encode(array("message" => "Username and password cannot be empty"));
        exit();
    }
    
    if ($user->login(trim($data->username), trim($data->password))) {
        // Store user info in session
        $_SESSION['user_id'] = $user->id;
        $_SESSION['username'] = $user->username;
        $_SESSION['role'] = $user->role;
        
        http_response_code(200);
        echo json_encode(array(
            "message" => "Login successful",
            "user" => array(
                "id" => $user->id,
                "username" => $user->username,
                "email" => $user->email,
                "role" => $user->role
            )
        ));
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Invalid username or password"));
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Server error: " . $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ));
}
?>