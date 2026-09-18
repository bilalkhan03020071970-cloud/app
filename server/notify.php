<?php
header('Content-Type: application/json');

// TELEGRAM BOT CONFIGURATION (Optional - Replace with your own Bot Token & Chat ID)
$BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN";
$CHAT_ID = "YOUR_TELEGRAM_CHAT_ID";

$fileName = isset($_POST['file_name']) ? htmlspecialchars($_POST['file_name']) : 'Unknown File';
$fileSize = isset($_POST['file_size']) ? htmlspecialchars($_POST['file_size']) : '0';
$userIp = $_SERVER['REMOTE_ADDR'] ?? 'Unknown IP';
$timestamp = date('Y-m-d H:i:s');

// Prepare Telegram message
$message = "🚨 *CR-Remover: New Video Queued!*\n\n"
         . "📁 *File:* `{$fileName}`\n"
         . "📊 *Size:* {$fileSize} MB\n"
         . "🌐 *Visitor IP:* `{$userIp}`\n"
         . "⏰ *Time:* {$timestamp}\n"
         . "⚡ *Action:* User started AI Deep Clean";

if ($BOT_TOKEN !== "YOUR_TELEGRAM_BOT_TOKEN" && !empty($CHAT_ID)) {
    $url = "https://api.telegram.org/bot{$BOT_TOKEN}/sendMessage";
    $data = [
        'chat_id' => $CHAT_ID,
        'text' => $message,
        'parse_mode' => 'Markdown'
    ];

    $options = [
        'http' => [
            'method'  => 'POST',
            'header'  => 'Content-Type: application/x-www-form-urlencoded',
            'content' => http_build_query($data),
            'timeout' => 5
        ]
    ];
    $context  = stream_context_create($options);
    @file_get_contents($url, false, $context);
}

// Return success response
echo json_encode([
    'status' => 'success',
    'logged' => true,
    'file' => $fileName,
    'size' => $fileSize
]);
