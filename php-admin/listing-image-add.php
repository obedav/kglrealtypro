<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();
require_csrf();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

$listingId = (int)($_POST['listing_id'] ?? 0);
if ($listingId <= 0) { http_response_code(400); exit('bad input'); }

$alt     = trim((string)($_POST['alt']     ?? ''));
$caption = trim((string)($_POST['caption'] ?? ''));

function next_image_position(int $listingId): int {
    $stmt = db()->prepare(
        'SELECT COALESCE(MAX(position), -1) + 1 AS next FROM listing_images WHERE listing_id = ?'
    );
    $stmt->execute([$listingId]);
    return (int)$stmt->fetchColumn();
}

function save_image(int $listingId, string $url, ?string $alt, ?string $caption): void {
    $pos = next_image_position($listingId);
    db()->prepare(
        'INSERT INTO listing_images (listing_id, url, alt, caption, position) VALUES (?, ?, ?, ?, ?)'
    )->execute([$listingId, $url, $alt ?: null, $caption ?: null, $pos]);
}

// ── File upload path ─────────────────────────────────────────────────────────
if (!empty($_FILES['images']['name'][0])) {
    $allowed   = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    $uploadDir = __DIR__ . '/uploads/';
    $scheme    = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $baseUrl   = $scheme . '://' . $_SERVER['HTTP_HOST'] . '/uploads/';
    $added     = 0;
    $uploadErrs = [];

    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        flash('Could not create uploads/ directory — check cPanel folder permissions.');
        header("Location: /listing-edit.php?id=$listingId#images"); exit;
    }

    $phpErrMsgs = [
        UPLOAD_ERR_INI_SIZE   => 'exceeds server upload limit',
        UPLOAD_ERR_FORM_SIZE  => 'exceeds form size limit',
        UPLOAD_ERR_PARTIAL    => 'was only partially uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'server temp directory missing',
        UPLOAD_ERR_CANT_WRITE => 'server could not write file',
    ];

    $fileCount = count($_FILES['images']['name']);
    for ($i = 0; $i < $fileCount; $i++) {
        $name    = $_FILES['images']['name'][$i];
        $tmpName = $_FILES['images']['tmp_name'][$i];
        $errCode = (int)$_FILES['images']['error'][$i];
        $size    = (int)$_FILES['images']['size'][$i];

        if ($errCode === UPLOAD_ERR_NO_FILE) continue;

        if ($errCode !== UPLOAD_ERR_OK) {
            $uploadErrs[] = "$name: " . ($phpErrMsgs[$errCode] ?? "error $errCode");
            continue;
        }
        if ($size > 8 * 1024 * 1024) {
            $uploadErrs[] = "$name: must be under 8 MB";
            continue;
        }

        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($tmpName);
        if (!array_key_exists($mime, $allowed)) {
            $uploadErrs[] = "$name: only JPEG, PNG, WebP or GIF accepted";
            continue;
        }

        $filename = uniqid('prop-', true) . '.' . $allowed[$mime];
        if (!move_uploaded_file($tmpName, $uploadDir . $filename)) {
            $uploadErrs[] = "$name: could not save — check permissions on uploads/";
            continue;
        }

        save_image($listingId, $baseUrl . $filename, $alt ?: null, $caption ?: null);
        $added++;
    }

    if ($uploadErrs) {
        $msg = count($uploadErrs) === 1
            ? 'Upload error: ' . $uploadErrs[0]
            : count($uploadErrs) . ' files failed: ' . implode('; ', $uploadErrs);
        flash($added > 0 ? "$added image(s) added. $msg" : $msg);
    } else {
        flash($added === 1 ? 'Image added.' : "$added images added.");
    }

    header("Location: /listing-edit.php?id=$listingId#images"); exit;
}

// ── URL paste path ───────────────────────────────────────────────────────────
$url = trim((string)($_POST['url'] ?? ''));
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    flash('Please choose a file to upload or paste a valid image URL.');
    header("Location: /listing-edit.php?id=$listingId#images"); exit;
}

save_image($listingId, $url, $alt ?: null, $caption ?: null);
flash('Image added.');
header("Location: /listing-edit.php?id=$listingId#images");
