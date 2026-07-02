<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();

// Stat queries — all cheap single-row counts
$stats = [];

$stats['listings'] = (int)db()->query("SELECT COUNT(*) FROM listings")->fetchColumn();
$stats['available'] = (int)db()->query("SELECT COUNT(*) FROM listings WHERE status='available'")->fetchColumn();
$stats['leads_new'] = (int)db()->query("SELECT COUNT(*) FROM leads WHERE status='new'")->fetchColumn();
$stats['leads_form'] = (int)db()->query("SELECT COUNT(*) FROM leads WHERE source='form'")->fetchColumn();
$stats['tours']    = (int)db()->query("SELECT COUNT(*) FROM tour_requests WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)")->fetchColumn();
$stats['posts']    = (int)db()->query("SELECT COUNT(*) FROM posts")->fetchColumn();

// Recent leads (last 8)
$recent_leads = db()->query(
    "SELECT full_name, source, status, email, phone, created_at
       FROM leads ORDER BY created_at DESC LIMIT 8"
)->fetchAll();

// Recent listings (last 5)
$recent_listings = db()->query(
    "SELECT id, title, city, price_ngn, status, featured, date_posted
       FROM listings ORDER BY date_posted DESC LIMIT 5"
)->fetchAll();

render_header('Dashboard');
?>

<!-- Stat cards -->
<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-icon stat-icon-navy">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 9.75L12 3l9 6.75V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z"/>
            </svg>
        </div>
        <div class="stat-value"><?= $stats['listings'] ?></div>
        <div class="stat-label">Total Listings</div>
    </div>

    <div class="stat-card">
        <div class="stat-icon stat-icon-green">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
        </div>
        <div class="stat-value"><?= $stats['available'] ?></div>
        <div class="stat-label">Available Now</div>
    </div>

    <div class="stat-card">
        <div class="stat-icon stat-icon-gold">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"/>
            </svg>
        </div>
        <div class="stat-value"><?= $stats['leads_new'] ?></div>
        <div class="stat-label">New Leads</div>
    </div>

    <div class="stat-card">
        <div class="stat-icon stat-icon-blue">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
        </div>
        <div class="stat-value"><?= $stats['leads_form'] ?></div>
        <div class="stat-label">Contact Forms</div>
    </div>

    <div class="stat-card">
        <div class="stat-icon stat-icon-navy">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25"/>
            </svg>
        </div>
        <div class="stat-value"><?= $stats['tours'] ?></div>
        <div class="stat-label">Tours (30 days)</div>
    </div>

    <div class="stat-card">
        <div class="stat-icon stat-icon-gold">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5M6 7.5h3v3H6v-3z"/>
            </svg>
        </div>
        <div class="stat-value"><?= $stats['posts'] ?></div>
        <div class="stat-label">Blog Posts</div>
    </div>
</div>

<!-- Quick actions -->
<div style="display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap">
    <a href="/listing-edit.php" class="btn btn-primary">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        New Listing
    </a>
    <a href="/post-edit.php" class="btn btn-gold">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        New Blog Post
    </a>
    <a href="/leads.php" class="btn">View All Leads</a>
    <a href="/tours.php" class="btn">View Tour Requests</a>
</div>

<div class="dashboard-grid">

    <!-- Recent leads -->
    <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <h2 style="margin:0">Recent Leads</h2>
            <a href="/leads.php" class="btn btn-sm">View all</a>
        </div>
        <div class="table-wrap">
            <table class="dash-leads-tbl">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th>When</th>
                    </tr>
                </thead>
                <tbody>
                <?php if ($recent_leads): ?>
                    <?php foreach ($recent_leads as $l): ?>
                    <tr>
                        <td>
                            <div style="font-weight:600;color:var(--text)"><?= e($l['full_name']) ?></div>
                            <div class="td-sub"><?= e($l['email'] ?? $l['phone'] ?? '—') ?></div>
                        </td>
                        <td><span class="badge badge-<?= e($l['source']) ?>"><?= e($l['source']) ?></span></td>
                        <td><span class="badge badge-<?= e($l['status']) ?>"><?= e($l['status']) ?></span></td>
                        <td class="muted"><?= e(substr((string)$l['created_at'], 0, 10)) ?></td>
                    </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr><td colspan="4">
                        <div class="empty-state" style="padding:32px">
                            <div class="empty-icon">📭</div>
                            <p>No leads yet</p>
                        </div>
                    </td></tr>
                <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Recent listings -->
    <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <h2 style="margin:0">Recent Listings</h2>
            <a href="/listing-edit.php" class="btn btn-sm">+ Add</a>
        </div>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Property</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                <?php if ($recent_listings): ?>
                    <?php foreach ($recent_listings as $l): ?>
                    <tr>
                        <td>
                            <a href="/listing-edit.php?id=<?= (int)$l['id'] ?>" class="td-title"><?= e($l['title']) ?></a>
                            <div class="td-sub"><?= e($l['city']) ?> · ₦<?= number_format((int)$l['price_ngn']) ?></div>
                        </td>
                        <td><span class="badge badge-<?= e($l['status']) ?>"><?= e($l['status']) ?></span></td>
                    </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr><td colspan="2">
                        <div class="empty-state" style="padding:32px">
                            <div class="empty-icon">🏠</div>
                            <p>No listings yet</p>
                        </div>
                    </td></tr>
                <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

</div>

<?php render_footer(); ?>
