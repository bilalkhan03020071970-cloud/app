<?php
header('Content-Type: application/json');
session_start();

$plan_id = isset($_GET['plan_id']) ? (int)$_GET['plan_id'] : 1;

$plans = [
    1 => ['name' => 'Starter Trial', 'price' => 499, 'videos' => 20],
    2 => ['name' => 'Pro Creator', 'price' => 899, 'videos' => 50],
    3 => ['name' => 'Enterprise', 'price' => 1799, 'videos' => 250],
];

if (!isset($plans[$plan_id])) {
    $plan_id = 2;
}

$selectedPlan = $plans[$plan_id];
$order_id = 'CR_' . strtoupper(bin2hex(random_bytes(4))) . '_' . time();

// Store pending order in session
$_SESSION['current_order'] = [
    'order_id' => $order_id,
    'plan' => $selectedPlan['name'],
    'price' => $selectedPlan['price'],
    'status' => 'pending'
];

// Return UPI link or payment URL
$upi_id = "crremover@upi";
$pay_url = "upi://pay?pa={$upi_id}&pn=CRRemover&am={$selectedPlan['price']}&cu=INR&tn={$order_id}";

echo json_encode([
    'status' => 'success',
    'order_id' => $order_id,
    'plan_name' => $selectedPlan['name'],
    'amount' => $selectedPlan['price'],
    'pay_url' => $pay_url
]);
