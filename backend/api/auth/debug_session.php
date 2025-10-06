<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

include_once '../../config/cors.php';

session_start();

echo json_encode(array(
    "session_id" => session_id(),
    "session_data" => $_SESSION,
    "session_save_path" => session_save_path(),
    "session_name" => session_name(),
    "cookies_received" => $_COOKIE,
    "headers" => getallheaders(),
    "session_cookie_params" => session_get_cookie_params()
));
?>