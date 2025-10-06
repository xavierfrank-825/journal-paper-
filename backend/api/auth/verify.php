<?php
// backend/api/auth/verify.php

include_once '../../config/cors.php';

session_start();

if (isset($_SESSION['user_id'])) {
    http_response_code(200);
    echo json_encode(array(
        "authenticated" => true,
        "user" => array(
            "id" => $_SESSION['user_id'],
            "username" => $_SESSION['username'],
            "role" => $_SESSION['role']
        )
    ));
} else {
    http_response_code(401);
    echo json_encode(array(
        "authenticated" => false,
        "message" => "Not authenticated"
    ));
}
?>