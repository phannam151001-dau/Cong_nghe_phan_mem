<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

$isLocal = in_array($_SERVER['SERVER_NAME'] ?? 'localhost', ['localhost', '127.0.0.1'], true);

if ($isLocal) {
    $servername = '127.0.0.1';
    $username = 'root';
    $password = '0828937914n';
    $dbname = 'san_co_pro';
} else {
    $servername = 'sql205.infinityfree.com';
    $username = 'if0_43025028';
    $password = '0828937914n';
    $dbname = 'if0_43025028_san_co_pro';
}

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("MYSQL ERROR: " . $conn->connect_errno . " - " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");  