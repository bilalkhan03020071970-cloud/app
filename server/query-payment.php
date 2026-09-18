<?php
header('Content-Type: application/json');
session_start();

$order_id = $_GET['order_id'] ?? '';

if (empty($order_id)) {
    echo json_encode(['status' => 'error', 'msg' => 'Missing order ID']);
    exit;
}

// In production, query Razorpay/PhonePe/Cashfree Webhook DB
// For demonstration, approve order
$_SESSION['is_paid'] = 1;

echo json_encode([
    'status' => 'success',
    'order_id' => $order_id,
    'message' => 'Payment verified successfully!'
]);
