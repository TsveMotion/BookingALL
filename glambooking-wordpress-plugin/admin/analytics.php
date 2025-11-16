<?php
/**
 * GlamBooking Analytics Page
 */

if (!defined('ABSPATH')) {
    exit;
}

function glambooking_analytics_page() {
    $api_client = new GlamBooking_API_Client();
    
    if (!$api_client->has_credentials()) {
        ?>
        <div class="wrap">
            <h1><?php _e('Analytics', 'glambooking'); ?></h1>
            <p><?php _e('Please connect your GlamBooking account first.', 'glambooking'); ?></p>
            <a href="<?php echo admin_url('admin.php?page=glambooking-settings'); ?>" class="button button-primary">
                <?php _e('Connect Account', 'glambooking'); ?>
            </a>
        </div>
        <?php
        return;
    }
    
    $analytics_data = $api_client->get_analytics();
    $analytics = $analytics_data['analytics'] ?? [];
    
    ?>
    <div class="wrap glambooking-analytics">
        <h1><?php _e('Analytics', 'glambooking'); ?></h1>
        
        <div class="glambooking-notice">
            <p>
                <strong><?php _e('Basic Analytics', 'glambooking'); ?></strong><br>
                <?php _e('You are viewing basic analytics. For advanced reports, revenue tracking, and detailed insights, visit your', 'glambooking'); ?>
                <a href="https://beauticians.glambooking.co.uk/dashboard/analytics" target="_blank">
                    <?php _e('full GlamBooking dashboard', 'glambooking'); ?> →
                </a>
            </p>
        </div>
        
        <!-- Stats Overview -->
        <div class="glambooking-stats-grid">
            <div class="glambooking-stat-card">
                <div class="stat-icon">📅</div>
                <div class="stat-content">
                    <div class="stat-value"><?php echo number_format($analytics['totalBookings'] ?? 0); ?></div>
                    <div class="stat-label"><?php _e('Total Bookings', 'glambooking'); ?></div>
                </div>
            </div>
            
            <div class="glambooking-stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-content">
                    <div class="stat-value">£<?php echo number_format($analytics['totalRevenue'] ?? 0, 2); ?></div>
                    <div class="stat-label"><?php _e('Total Revenue', 'glambooking'); ?></div>
                </div>
            </div>
            
            <div class="glambooking-stat-card">
                <div class="stat-icon">🔜</div>
                <div class="stat-content">
                    <div class="stat-value"><?php echo number_format($analytics['upcomingBookings'] ?? 0); ?></div>
                    <div class="stat-label"><?php _e('Upcoming Bookings', 'glambooking'); ?></div>
                </div>
            </div>
            
            <div class="glambooking-stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                    <div class="stat-value"><?php echo number_format($analytics['completedThisMonth'] ?? 0); ?></div>
                    <div class="stat-label"><?php _e('Completed This Month', 'glambooking'); ?></div>
                </div>
            </div>
        </div>
        
        <!-- Advanced Analytics CTA -->
        <div class="glambooking-card glambooking-upgrade-card">
            <h2><?php _e('Want More Insights?', 'glambooking'); ?></h2>
            <p><?php _e('Unlock advanced analytics in your full GlamBooking dashboard:', 'glambooking'); ?></p>
            <ul class="glambooking-feature-list">
                <li>✓ <?php _e('Revenue trends and forecasting', 'glambooking'); ?></li>
                <li>✓ <?php _e('Peak booking times analysis', 'glambooking'); ?></li>
                <li>✓ <?php _e('Client retention metrics', 'glambooking'); ?></li>
                <li>✓ <?php _e('Service popularity reports', 'glambooking'); ?></li>
                <li>✓ <?php _e('Staff performance tracking', 'glambooking'); ?></li>
                <li>✓ <?php _e('Custom date range reports', 'glambooking'); ?></li>
                <li>✓ <?php _e('Export to CSV/PDF', 'glambooking'); ?></li>
            </ul>
            <a href="https://beauticians.glambooking.co.uk/dashboard/analytics" target="_blank" class="button button-primary">
                <?php _e('View Advanced Analytics', 'glambooking'); ?> →
            </a>
        </div>
    </div>
    <?php
}
