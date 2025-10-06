<?php
// backend/api/auth/register.php

include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../classes/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->email) && !empty($data->password)) {
    
    $user->username = $data->username;
    $user->email = $data->email;
    $user->password = $data->password;
    $user->role = isset($data->role) ? $data->role : 'user';
    
    // Check if user already exists
    if ($user->usernameExists()) {
        http_response_code(400);
        echo json_encode(array("message" => "Username already exists"));
    } else if ($user->emailExists()) {
        http_response_code(400);
        echo json_encode(array("message" => "Email already exists"));
    } else if ($user->register()) {
        http_response_code(201);
        echo json_encode(array("message" => "User registered successfully"));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Registration failed"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "All fields are required"));
}
?>