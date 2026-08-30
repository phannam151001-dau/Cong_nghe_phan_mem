<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
session_start();

header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'loggedIn' => !empty($_SESSION['logged_in']),
    'userId' => !empty($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null,
    'userName' => !empty($_SESSION['user_name']) ? $_SESSION['user_name'] : '',
    'userRole' => !empty($_SESSION['user_role']) ? $_SESSION['user_role'] : 'user'
], JSON_UNESCAPED_UNICODE);
