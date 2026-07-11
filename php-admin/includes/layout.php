<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';

function e(mixed $v): string {
    return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8');
}

function flash(?string $set = null): ?string {
    session_start_secure();
    if ($set !== null) {
        $_SESSION['_flash'] = $set;
        return null;
    }
    $msg = $_SESSION['_flash'] ?? null;
    unset($_SESSION['_flash']);
    return $msg;
}

function active(string $path): string {
    $current = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
    return $current === $path ? 'nav-active' : '';
}

function render_header(string $title): void {
    $admin = current_admin();
    $msg   = flash();
    $initials = $admin ? implode('', array_map(fn($w) => $w[0], array_slice(explode(' ', $admin['full_name']), 0, 2))) : 'KG';
    ?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title><?= e($title) ?> — KGL Admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">
    <style>
    /* ── Reset & base ─────────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
        --navy:       #0B1E3D;
        --navy-light: #112649;
        --navy-muted: #1e3460;
        --gold:       #C9A84C;
        --gold-light: #e8c97a;
        --bg:         #F0F2F7;
        --surface:    #FFFFFF;
        --surface-2:  #F8F9FC;
        --border:     #E4E8F0;
        --text:       #0F172A;
        --text-2:     #334155;
        --muted:      #64748B;
        --success-bg: #ECFDF5;
        --success:    #059669;
        --success-border: #A7F3D0;
        --danger-bg:  #FEF2F2;
        --danger:     #DC2626;
        --danger-border: #FECACA;
        --warning-bg: #FFFBEB;
        --warning:    #D97706;
        --sidebar-w:  240px;
        --topbar-h:   64px;
        --radius:     10px;
        --radius-lg:  14px;
        --shadow-sm:  0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
        --shadow:     0 4px 12px rgba(0,0,0,.08);
        --shadow-lg:  0 8px 24px rgba(0,0,0,.10);
        --transition: 150ms cubic-bezier(.4,0,.2,1);
    }

    html { height: 100%; }

    body {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: var(--text);
        background: var(--bg);
        min-height: 100%;
    }

    /* ── Sidebar ──────────────────────────────────────────────────── */
    .sidebar {
        position: fixed;
        top: 0; left: 0; bottom: 0;
        width: var(--sidebar-w);
        background: var(--navy);
        display: flex;
        flex-direction: column;
        z-index: 100;
        overflow: hidden;
        overflow-x: visible;
    }

    .sidebar-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 20px 20px 16px;
        border-bottom: 1px solid rgba(255,255,255,.07);
    }

    .sidebar-logo {
        width: 36px; height: 36px;
        background: linear-gradient(135deg, var(--gold), var(--gold-light));
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        font-family: 'DM Serif Display', serif;
        font-size: 16px;
        font-weight: 700;
        color: var(--navy);
        flex-shrink: 0;
    }

    .sidebar-brand-text {
        display: flex; flex-direction: column;
    }

    .sidebar-brand-name {
        font-size: 13px;
        font-weight: 700;
        color: #fff;
        letter-spacing: .02em;
        line-height: 1.2;
    }

    .sidebar-brand-sub {
        font-size: 10px;
        color: rgba(255,255,255,.4);
        letter-spacing: .05em;
        text-transform: uppercase;
        line-height: 1.2;
    }

    .sidebar-nav {
        flex: 1;
        padding: 12px 10px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow-y: auto;
    }

    .nav-label {
        font-size: 10px;
        font-weight: 600;
        color: rgba(255,255,255,.3);
        letter-spacing: .1em;
        text-transform: uppercase;
        padding: 10px 10px 4px;
        margin-top: 4px;
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 12px;
        border-radius: 8px;
        color: rgba(255,255,255,.65);
        text-decoration: none;
        font-size: 13.5px;
        font-weight: 500;
        transition: background var(--transition), color var(--transition);
        position: relative;
    }

    .nav-link:hover {
        background: rgba(255,255,255,.07);
        color: #fff;
    }

    .nav-link.nav-active {
        background: rgba(201,168,76,.15);
        color: var(--gold-light);
    }

    .nav-link.nav-active .nav-icon { color: var(--gold); }

    .nav-icon {
        width: 18px; height: 18px;
        flex-shrink: 0;
        opacity: .8;
    }

    .nav-link.nav-active .nav-icon { opacity: 1; }

    .sidebar-footer {
        padding: 14px 10px;
        border-top: 1px solid rgba(255,255,255,.07);
    }

    .user-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(255,255,255,.05);
    }

    .user-avatar {
        width: 32px; height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--gold), var(--gold-light));
        color: var(--navy);
        font-size: 12px;
        font-weight: 700;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        letter-spacing: .05em;
    }

    .user-info { flex: 1; min-width: 0; }

    .user-name {
        font-size: 12.5px;
        font-weight: 600;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.2;
    }

    .user-role {
        font-size: 11px;
        color: rgba(255,255,255,.4);
        line-height: 1.2;
    }

    .logout-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        color: rgba(255,255,255,.35);
        transition: color var(--transition);
        display: flex;
        border-radius: 4px;
    }

    .logout-btn:hover { color: var(--danger); }

    /* ── Page wrapper ─────────────────────────────────────────────── */
    .page-wrap {
        margin-left: var(--sidebar-w);
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    /* ── Topbar ───────────────────────────────────────────────────── */
    .topbar {
        height: var(--topbar-h);
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        padding: 0 28px;
        gap: 12px;
        position: sticky;
        top: 0;
        z-index: 50;
    }

    .topbar-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text);
        flex: 1;
    }

    .topbar-time {
        font-size: 12px;
        color: var(--muted);
    }

    /* ── Main content ─────────────────────────────────────────────── */
    .main {
        flex: 1;
        padding: 28px;
        max-width: 1200px;
        width: 100%;
    }

    /* ── Flash messages ───────────────────────────────────────────── */
    .flash {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        border-radius: var(--radius);
        margin-bottom: 20px;
        font-size: 13.5px;
        font-weight: 500;
        background: var(--success-bg);
        color: var(--success);
        border: 1px solid var(--success-border);
    }

    .flash-error {
        background: var(--danger-bg);
        color: var(--danger);
        border-color: var(--danger-border);
    }

    /* ── Page header ──────────────────────────────────────────────── */
    .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
        gap: 16px;
        flex-wrap: wrap;
    }

    .page-title {
        font-size: 22px;
        font-weight: 700;
        color: var(--text);
        font-family: 'DM Serif Display', serif;
        line-height: 1.2;
    }

    .page-count {
        font-size: 13px;
        color: var(--muted);
        font-weight: 400;
        font-family: 'Inter', sans-serif;
        margin-top: 2px;
    }

    h2 {
        font-size: 15px;
        font-weight: 600;
        color: var(--text-2);
        margin: 24px 0 12px;
    }

    /* ── Stat cards ───────────────────────────────────────────────── */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
        gap: 16px;
        margin-bottom: 28px;
    }

    .stat-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 20px;
        box-shadow: var(--shadow-sm);
        transition: box-shadow var(--transition), transform var(--transition);
    }

    .stat-card:hover {
        box-shadow: var(--shadow);
        transform: translateY(-1px);
    }

    .stat-icon {
        width: 40px; height: 40px;
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 14px;
    }

    .stat-icon-navy  { background: rgba(11,30,61,.08); color: var(--navy); }
    .stat-icon-gold  { background: rgba(201,168,76,.12); color: #9d7a28; }
    .stat-icon-green { background: rgba(5,150,105,.1); color: #059669; }
    .stat-icon-blue  { background: rgba(59,130,246,.1); color: #2563EB; }

    .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--text);
        line-height: 1;
        font-family: 'DM Serif Display', serif;
    }

    .stat-label {
        font-size: 12px;
        color: var(--muted);
        margin-top: 4px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: .06em;
    }

    /* ── Cards ────────────────────────────────────────────────────── */
    .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: var(--shadow-sm);
    }

    /* ── Tables ───────────────────────────────────────────────────── */
    .table-wrap {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
    }

    table { width: 100%; border-collapse: collapse; }

    thead th {
        background: var(--surface-2);
        padding: 11px 16px;
        text-align: left;
        font-size: 11.5px;
        font-weight: 600;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: .07em;
        border-bottom: 1px solid var(--border);
        white-space: nowrap;
    }

    tbody td {
        padding: 13px 16px;
        font-size: 13.5px;
        color: var(--text-2);
        border-bottom: 1px solid var(--border);
        vertical-align: middle;
    }

    tbody tr:last-child td { border-bottom: none; }

    tbody tr {
        transition: background var(--transition);
    }

    tbody tr:hover { background: var(--surface-2); }

    .td-title {
        font-weight: 600;
        color: var(--text);
        text-decoration: none;
        transition: color var(--transition);
    }
    .td-title:hover { color: var(--gold); }

    .td-sub {
        font-size: 12px;
        color: var(--muted);
        margin-top: 2px;
    }

    .muted { color: var(--muted); font-size: 13px; }

    /* ── Buttons ──────────────────────────────────────────────────── */
    .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text-2);
        font-size: 13.5px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        text-decoration: none;
        transition: all var(--transition);
        white-space: nowrap;
    }

    .btn:hover {
        border-color: #c4cad6;
        background: var(--surface-2);
        box-shadow: var(--shadow-sm);
    }

    .btn-primary {
        background: var(--navy);
        color: #fff;
        border-color: var(--navy);
    }

    .btn-primary:hover {
        background: var(--navy-light);
        border-color: var(--navy-light);
        box-shadow: 0 4px 12px rgba(11,30,61,.25);
    }

    .btn-gold {
        background: var(--gold);
        color: var(--navy);
        border-color: var(--gold);
        font-weight: 600;
    }

    .btn-gold:hover {
        background: var(--gold-light);
        border-color: var(--gold-light);
        box-shadow: 0 4px 12px rgba(201,168,76,.3);
    }

    .btn-danger {
        background: var(--danger-bg);
        color: var(--danger);
        border-color: #fecaca;
    }

    .btn-danger:hover {
        background: var(--danger);
        color: #fff;
        border-color: var(--danger);
    }

    .btn-sm {
        padding: 5px 11px;
        font-size: 12.5px;
        border-radius: 6px;
    }

    /* ── Badges ───────────────────────────────────────────────────── */
    .badge {
        display: inline-flex;
        align-items: center;
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 11.5px;
        font-weight: 600;
        letter-spacing: .02em;
        white-space: nowrap;
    }

    .badge-available  { background: #ECFDF5; color: #065F46; }
    .badge-sold       { background: #F0FDF4; color: #166534; border: 1px solid #bbf7d0; }
    .badge-pending    { background: #FFFBEB; color: #92400E; }
    .badge-off_market { background: #F1F5F9; color: #475569; }

    .badge-form       { background: #DBEAFE; color: #1D4ED8; }
    .badge-concierge  { background: #F3E8FF; color: #6D28D9; }
    .badge-whatsapp   { background: #DCFCE7; color: #166534; }
    .badge-phone      { background: #FEF9C3; color: #854D0E; }
    .badge-referral   { background: #FEE2E2; color: #991B1B; }

    .badge-new        { background: #DBEAFE; color: #1E40AF; }
    .badge-qualified  { background: #EDE9FE; color: #5B21B6; }
    .badge-contacted  { background: #FEF9C3; color: #92400E; }
    .badge-tour_booked{ background: #ECFDF5; color: #065F46; }
    .badge-won        { background: #F0FDF4; color: #166534; }
    .badge-lost       { background: #FEF2F2; color: #991B1B; }

    /* ── Forms ────────────────────────────────────────────────────── */
    label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-2);
        margin: 16px 0 5px;
    }

    label span.hint {
        font-size: 12px;
        font-weight: 400;
        color: var(--muted);
        display: block;
        margin-top: 2px;
    }

    input[type=text],
    input[type=number],
    input[type=password],
    input[type=email],
    select,
    textarea {
        width: 100%;
        padding: 9px 12px;
        border: 1px solid var(--border);
        border-radius: 8px;
        font: inherit;
        font-size: 13.5px;
        background: var(--surface);
        color: var(--text);
        transition: border-color var(--transition), box-shadow var(--transition);
        outline: none;
    }

    input[type=text]:focus,
    input[type=number]:focus,
    input[type=password]:focus,
    input[type=email]:focus,
    select:focus,
    textarea:focus {
        border-color: var(--navy);
        box-shadow: 0 0 0 3px rgba(11,30,61,.08);
    }

    textarea { min-height: 120px; resize: vertical; line-height: 1.6; }

    input[type=checkbox] {
        width: 16px; height: 16px;
        accent-color: var(--navy);
        cursor: pointer;
        margin-right: 6px;
    }

    .check-label {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        font-size: 13.5px;
        font-weight: 500;
        margin: 10px 0;
        color: var(--text-2);
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .form-row-3 {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 20px;
    }

    .form-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid var(--border);
    }

    .form-actions .spacer { flex: 1; }

    /* keep old .row alias so existing pages don't break */
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

    /* ── Error card ───────────────────────────────────────────────── */
    .error-card {
        background: var(--danger-bg);
        border: 1px solid var(--danger-border);
        color: var(--danger);
        border-radius: var(--radius);
        padding: 14px 18px;
        margin-bottom: 20px;
        font-size: 13.5px;
    }

    .error-card ul { margin: 6px 0 0 18px; }
    .error-card li { margin-bottom: 3px; }

    /* ── Empty state ──────────────────────────────────────────────── */
    .empty-state {
        text-align: center;
        padding: 56px 24px;
        color: var(--muted);
    }

    .empty-icon {
        font-size: 40px;
        margin-bottom: 12px;
        opacity: .5;
    }

    .empty-state p {
        font-size: 14px;
        margin-bottom: 16px;
    }

    /* ── Hamburger / mobile sidebar toggle ───────────────────────── */
    .hamburger {
        display: none;
        align-items: center;
        justify-content: center;
        width: 36px; height: 36px;
        border: none;
        background: transparent;
        border-radius: 8px;
        cursor: pointer;
        color: var(--text-2);
        flex-shrink: 0;
        transition: background var(--transition);
    }
    .hamburger:hover { background: var(--surface-2); }

    /* ── Sidebar overlay (mobile) ─────────────────────────────────── */
    .sidebar-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.48);
        z-index: 99;
        backdrop-filter: blur(2px);
    }
    .sidebar-overlay.active { display: block; }

    /* ── Dashboard two-column grid ────────────────────────────────── */
    .dashboard-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 24px;
        align-items: start;
    }

    /* ── Responsive: tablet (≤ 1024px) ───────────────────────────── */
    @media (max-width: 1024px) {
        .dashboard-grid { grid-template-columns: 1fr; }
        .stats-grid { grid-template-columns: repeat(3, 1fr); }
    }

    /* ── Responsive: mobile (≤ 768px) ────────────────────────────── */
    @media (max-width: 768px) {
        /* Sidebar hides off-screen; slides in when .sidebar-open */
        .sidebar {
            transform: translateX(-100%);
            transition: transform 240ms cubic-bezier(.4,0,.2,1);
            z-index: 200;
        }
        .sidebar.sidebar-open {
            transform: translateX(0);
            box-shadow: 6px 0 32px rgba(0,0,0,.28);
        }

        /* Content fills the viewport */
        .page-wrap { margin-left: 0; }

        /* Topbar */
        .topbar { padding: 0 16px; gap: 8px; }
        .topbar-time { display: none; }
        .hamburger { display: flex; }

        /* Main padding */
        .main { padding: 16px; }

        /* Form grids collapse to single column */
        .form-row,
        .form-row-3,
        .row { grid-template-columns: 1fr; gap: 0; }

        /* Tables scroll horizontally — never clip */
        .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        table { min-width: 560px; }

        /* Dashboard mini-tables: naturally sized — no forced min-width */
        .dashboard-grid table { min-width: 0; }

        /* Dashboard leads table: collapse to Name + Status on mobile */
        .dash-leads-tbl th:nth-child(2),
        .dash-leads-tbl td:nth-child(2),
        .dash-leads-tbl th:nth-child(4),
        .dash-leads-tbl td:nth-child(4) { display: none; }

        /* Stats: 2 columns */
        .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }

        /* Dashboard panels stack */
        .dashboard-grid { grid-template-columns: 1fr; }

        /* Typography */
        .page-title { font-size: 19px; }
        .page-header { gap: 12px; }

        /* Cards */
        .card { padding: 16px; }

        /* Buttons wrap in form-actions */
        .form-actions { flex-wrap: wrap; }
    }

    /* ── Responsive: small phones (≤ 420px) ──────────────────────── */
    @media (max-width: 420px) {
        .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
        .stat-card { padding: 14px; }
        .stat-value { font-size: 22px; }
        .stat-icon { width: 34px; height: 34px; margin-bottom: 10px; }
    }
    </style>
</head>
<body>

<!-- ── Mobile sidebar overlay ──────────────────────────────────────── -->
<div class="sidebar-overlay" id="sidebarOverlay"></div>

<!-- ── Sidebar ─────────────────────────────────────────────────────── -->
<aside class="sidebar" id="mainSidebar">
    <div class="sidebar-brand">
        <div class="sidebar-logo">K</div>
        <div class="sidebar-brand-text">
            <span class="sidebar-brand-name">KGL Realty Pro</span>
            <span class="sidebar-brand-sub">Admin Console</span>
        </div>
    </div>

    <nav class="sidebar-nav">
        <span class="nav-label">Overview</span>

        <a href="/" class="nav-link <?= active('/') ?>">
            <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
            </svg>
            Dashboard
        </a>

        <span class="nav-label">Content</span>

        <a href="/listings.php" class="nav-link <?= active('/listings.php') ?>">
            <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 9.75L12 3l9 6.75V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 21V12h6v9"/>
            </svg>
            Listings
        </a>

        <a href="/posts.php" class="nav-link <?= active('/posts.php') ?>">
            <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"/>
            </svg>
            Blog / Insights
        </a>

        <a href="/investments.php" class="nav-link <?= active('/investments.php') ?>">
            <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
            </svg>
            Investments
        </a>

        <span class="nav-label">CRM</span>

        <a href="/leads.php" class="nav-link <?= active('/leads.php') ?>">
            <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
            </svg>
            Leads
        </a>

        <a href="/tours.php" class="nav-link <?= active('/tours.php') ?>">
            <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5"/>
            </svg>
            Tour Requests
        </a>

        <a href="/handoffs.php" class="nav-link <?= active('/handoffs.php') ?>">
            <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
            </svg>
            Handoffs
        </a>
    </nav>

    <?php if ($admin): ?>
    <div class="sidebar-footer">
        <div class="user-card">
            <div class="user-avatar"><?= e(strtoupper($initials)) ?></div>
            <div class="user-info">
                <div class="user-name"><?= e($admin['full_name']) ?></div>
                <div class="user-role">Super Admin</div>
            </div>
            <form action="/logout.php" method="post" style="display:contents">
                <?= csrf_field() ?>
                <button class="logout-btn" title="Log out" type="submit">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
                    </svg>
                </button>
            </form>
        </div>
    </div>
    <?php endif; ?>
</aside>

<!-- ── Page wrapper ─────────────────────────────────────────────────── -->
<div class="page-wrap">
    <div class="topbar">
        <button class="hamburger" id="hamburgerBtn" aria-label="Toggle menu">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
            </svg>
        </button>
        <span class="topbar-title"><?= e($title) ?></span>
        <span class="topbar-time" id="clock"></span>
    </div>
    <div class="main">
        <?php if ($msg): ?>
            <div class="flash">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <?= e($msg) ?>
            </div>
        <?php endif; ?>
    <?php
}

function render_footer(): void { ?>
    </div><!-- /.main -->
</div><!-- /.page-wrap -->

<script>
(function(){
    /* ── Clock ── */
    const el = document.getElementById('clock');
    if (el) {
        const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        function pad(n){ return String(n).padStart(2,'0'); }
        function tick(){
            const d = new Date();
            el.textContent = days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()]
                + ' · ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
        }
        tick(); setInterval(tick, 30000);
    }

    /* ── Mobile sidebar toggle ── */
    const btn     = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('mainSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!btn || !sidebar || !overlay) return;

    function openSidebar() {
        sidebar.classList.add('sidebar-open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
        sidebar.classList.remove('sidebar-open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    btn.addEventListener('click', function() {
        sidebar.classList.contains('sidebar-open') ? closeSidebar() : openSidebar();
    });
    overlay.addEventListener('click', closeSidebar);

    /* Close when a nav link is tapped on mobile */
    sidebar.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) closeSidebar();
        });
    });
})();
</script>
</body></html>
<?php }
