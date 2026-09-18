<?php
header('Content-Type: application/json');
session_start();

$action = $_POST['action'] ?? '';
$phone = $_POST['phone'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($phone) || empty($password)) {
    echo json_encode(['success' => false, 'msg' => 'Please provide phone and password']);
    exit;
}

if (!preg_match('/^[0-9]{10}$/', $phone)) {
    echo json_encode(['success' => false, 'msg' => 'Invalid 10-digit phone number']);
    exit;
}

// User session storage
$_SESSION['user_phone'] = $phone;
$_SESSION['logged_in'] = true;

// Check if user has active subscription (in production, check MySQL DB)
$is_paid = isset($_SESSION['is_paid']) ? (int)$_SESSION['is_paid'] : 0;

echo json_encode([
    'success' => true,
    'msg' => ($action === 'register') ? 'Account registered successfully!' : 'Login successful!',
    'phone' => $phone,
    'is_paid' => $is_paid
]);
