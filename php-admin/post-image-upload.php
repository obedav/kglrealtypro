<?php
declare(strict_types=1);

// AJAX endpoint — upload one image for inline insertion into blog content.
// Returns JSON: {"url":"..."} on success or {"error":"..."} on failure.

require_once __DIR__ . '/includes/layout.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

// Manual CSRF check (no redirect, just JSON error).
session_start_secure();
$sent = $_POST['_csrf'] ?? '';
$have = $_SESSION['_csrf'] ?? '';
if (!is_string($sent) || $sent === '' || !hash_equals($have, $sent)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Session expired — refresh and try again']);
    exit;
}

header('Content-Type: application/json');

$file = $_FILES['image'] ?? null;
if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
    echo json_encode(['error' => 'No file received']);
    exit;
}

$phpErrMsgs = [
    UPLOAD_ERR_INI_SIZE   => 'Exceeds server upload limit',
    UPLOAD_ERR_FORM_SIZE  => 'Exceeds form size limit',
    UPLOAD_ERR_PARTIAL    => 'Partially uploaded — try again',
    UPLOAD_ERR_NO_TMP_DIR => 'Server temp directory missing',
    UPLOAD_ERR_CANT_WRITE => 'Server cannot write file',
];

if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['error' => $phpErrMsgs[$file['error']] ?? 'Upload error ' . $file['error']]);
    exit;
}

if ($file['size'] > 8 * 1024 * 1024) {
    echo json_encode(['error' => 'File must be under 8 MB']);
    exit;
}

$allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
$mime    = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
if (!array_key_exists($mime, $allowed)) {
    echo json_encode(['error' => 'Only JPEG, PNG, WebP or GIF accepted']);
    exit;
}

$uploadDir = __DIR__ . '/uploads/';
$scheme    = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$baseUrl   = $scheme . '://' . $_SERVER['HTTP_HOST'] . '/uploads/';

if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
    echo json_encode(['error' => 'Could not create uploads/ directory — check cPanel permissions']);
    exit;
}

$filename = uniqid('post-inline-', true) . '.' . $allowed[$mime];
if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
    echo json_encode(['error' => 'Could not save file — check uploads/ folder permissions']);
    exit;
}

echo json_encode(['url' => $baseUrl . $filename]);
