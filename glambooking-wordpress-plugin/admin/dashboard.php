<?php
/**
 * GlamBooking Dashboard Page
 */

if (!defined('ABSPATH')) {
    exit;
}

function glambooking_dashboard_page() {
    $api_client = new GlamBooking_API_Client();
    
    if (!$api_client->has_credentials()) {
        ?>
        <div class="wrap glambooking-dashboard">
            <h1><?php _e('GlamBooking Dashboard', 'glambooking'); ?></h1>
            <div class="glambooking-welcome">
                <h2><?php _e('Welcome to GlamBooking', 'glambooking'); ?></h2>
                <p><?php _e('Connect your GlamBooking account to start managing bookings from WordPress.', 'glambooking'); ?></p>
                <a href="<?php echo admin_url('admin.php?page=glambooking-settings'); ?>" class="button button-primary">
                    <?php _e('Connect Account', 'glambooking'); ?>
                </a>
            </div>
        </div>
        <?php
        return;
    }
    
    // Fetch analytics
    $analytics_data = $api_client->get_analytics();
    $analytics = $analytics_data['analytics'] ?? [];
    
    // Fetch recent bookings
    $bookings_data = $api_client->get_bookings(5);
    $bookings = $bookings_data['bookings'] ?? [];
    
    ?>
    <div class="wrap glambooking-dashboard">
        <h1><?php _e('GlamBooking Dashboard', 'glambooking'); ?></h1>
        
        <!-- Stats Grid -->
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
                    <div class="stat-label"><?php _e('Upcoming', 'glambooking'); ?></div>
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
        
        <!-- Recent Bookings -->
        <div class="glambooking-card">
            <div class="card-header">
                <h2><?php _e('Recent Bookings', 'glambooking'); ?></h2>
                <a href="<?php echo admin_url('admin.php?page=glambooking-bookings'); ?>" class="button button-secondary">
                    <?php _e('View All', 'glambooking'); ?>
                </a>
            </div>
            
            <?php if (empty($bookings)): ?>
                <p class="glambooking-empty"><?php _e('No bookings yet', 'glambooking'); ?></p>
            <?php else: ?>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th><?php _e('Date & Time', 'glambooking'); ?></th>
                            <th><?php _e('Client', 'glambooking'); ?></th>
                            <th><?php _e('Service', 'glambooking'); ?></th>
                            <th><?php _e('Status', 'glambooking'); ?></th>
                            <th><?php _e('Price', 'glambooking'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($bookings as $booking): ?>
                        <tr>
                            <td>
                                <?php echo date('M j, Y', strtotime($booking['startTime'])); ?><br>
                                <small><?php echo date('g:i A', strtotime($booking['startTime'])); ?></small>
                            </td>
                            <td>
                                <?php echo esc_html($booking['client']['firstName'] . ' ' . $booking['client']['lastName']); ?><br>
                                <small><?php echo esc_html($booking['client']['email']); ?></small>
                            </td>
                            <td><?php echo esc_html($booking['service']['name']); ?></td>
                            <td>
                                <span class="glambooking-status glambooking-status-<?php echo strtolower($booking['status']); ?>">
                                    <?php echo esc_html($booking['status']); ?>
                                </span>
                            </td>
                            <td>£<?php echo number_format($booking['totalPrice'], 2); ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
        
        <!-- Quick Actions -->
        <div class="glambooking-card">
            <h2><?php _e('Quick Actions', 'glambooking'); ?></h2>
            <div class="glambooking-quick-actions">
                <a href="<?php echo admin_url('admin.php?page=glambooking-bookings'); ?>" class="button">
                    📅 <?php _e('View All Bookings', 'glambooking'); ?>
                </a>
                <a href="<?php echo admin_url('admin.php?page=glambooking-analytics'); ?>" class="button">
                    📊 <?php _e('View Analytics', 'glambooking'); ?>
                </a>
                <a href="https://beauticians.glambooking.co.uk/dashboard" target="_blank" class="button">
                    🚀 <?php _e('Open Full Dashboard', 'glambooking'); ?>
                </a>
            </div>
        </div>
    </div>
    <?php
}
