<?php
// backend/api/auth/logout.php

ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', 'false');
ini_set('session.cookie_httponly', 'true');

include_once '../../config/cors.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Destroy session
$_SESSION = array();

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

session_destroy();

http_response_code(200);
echo json_encode(array(
    "message" => "Logged out successfully"
));
?>