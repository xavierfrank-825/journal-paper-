<?php
session_start();
header("Content-Type: application/json");

// Allow CORS if frontend runs separately
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Credentials: true");

if (isset($_SESSION['user'])) {
    echo json_encode([
        "success" => true,
        "user" => $_SESSION['user']  // should contain id, email, role
    ]);
} else {
    echo json_encode([
        "success" => false,
        "user" => null
    ]);
}
?>
