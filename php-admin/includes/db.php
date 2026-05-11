<?php
declare(strict_types=1);

/**
 * PDO connection, single source of truth. Every admin page calls db() and
 * reuses the same connection. Never open a raw mysqli anywhere else.
 */

function env(string $key, ?string $default = null): ?string {
    static $loaded = false;
    if (!$loaded) {
        $loaded = true;
        $envPath = __DIR__ . '/../.env';
        if (is_readable($envPath)) {
            foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                if (str_starts_with(trim($line), '#')) continue;
                if (!str_contains($line, '=')) continue;
                [$k, $v] = array_map('trim', explode('=', $line, 2));
                $v = trim($v, "\"' \t");
                if ($k !== '' && getenv($k) === false) {
                    putenv("$k=$v");
                    $_ENV[$k] = $v;
                }
            }
        }
    }
    $v = getenv($key);
    return $v === false ? $default : $v;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $host = env('MYSQL_HOST');
    $port = env('MYSQL_PORT', '3306');
    $name = env('MYSQL_DATABASE');
    $user = env('MYSQL_USER');
    $pass = env('MYSQL_PASSWORD');

    if (!$host || !$name || !$user || $pass === null) {
        http_response_code(500);
        exit('DB not configured');
    }

    $dsn = "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}
