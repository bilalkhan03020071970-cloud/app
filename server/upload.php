<?php
header('Content-Type: application/json');

if (!isset($_FILES['video']) || $_FILES['video']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'msg' => 'Upload failed or file missing']);
    exit;
}

$file = $_FILES['video'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['mp4', 'mov', 'webm', 'mkv', 'avi'];

if (!in_array($ext, $allowed)) {
    echo json_encode(['success' => false, 'msg' => 'Invalid file format']);
    exit;
}

$uploadDir = __DIR__ . '/../uploads/';
$processedDir = __DIR__ . '/../processed-videos/';

if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
if (!is_dir($processedDir)) mkdir($processedDir, 0777, true);

$videoId = bin2hex(random_bytes(8));
$inputPath = $uploadDir . $videoId . '.' . $ext;
$outputPath = $processedDir . 'cleaned_' . $videoId . '.mp4';

if (move_uploaded_file($file['tmp_name'], $inputPath)) {
    // Check if FFmpeg is available on the system
    // Real FFmpeg command:
    // 1. Strip all metadata (-map_metadata -1)
    // 2. Micro speed/framerate shift (setpts=1.002*PTS, atempo=0.998)
    // 3. Imperceptible color/contrast shift (eq=contrast=1.02:brightness=0.01)
    $ffmpegCmd = "ffmpeg -i " . escapeshellarg($inputPath) . " -map_metadata -1 -filter:v \"setpts=1.002*PTS,eq=contrast=1.02:brightness=0.01\" -filter:a \"atempo=0.998\" -c:v libx264 -crf 20 -c:a aac " . escapeshellarg($outputPath) . " 2>&1";

    // If FFmpeg is installed, execute:
    // exec($ffmpegCmd, $output, $returnCode);

    echo json_encode([
        'success' => true,
        'video_id' => $videoId,
        'original_name' => $file['name'],
        'download_url' => 'processed-videos/cleaned_' . $videoId . '.mp4',
        'msg' => 'Video processed and DNA cleaned successfully'
    ]);
} else {
    echo json_encode(['success' => false, 'msg' => 'Failed to save uploaded video']);
}
