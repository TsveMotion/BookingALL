<?php
/**
 * GlamBooking Bookings Page
 */

if (!defined('ABSPATH')) {
    exit;
}

function glambooking_bookings_page() {
    $api_client = new GlamBooking_API_Client();
    
    if (!$api_client->has_credentials()) {
        ?>
        <div class="wrap">
            <h1><?php _e('Bookings', 'glambooking'); ?></h1>
            <p><?php _e('Please connect your GlamBooking account first.', 'glambooking'); ?></p>
            <a href="<?php echo admin_url('admin.php?page=glambooking-settings'); ?>" class="button button-primary">
                <?php _e('Connect Account', 'glambooking'); ?>
            </a>
        </div>
        <?php
        return;
    }
    
    $bookings_data = $api_client->get_bookings(100);
    $bookings = $bookings_data['bookings'] ?? [];
    
    // Filter by status
    $status_filter = isset($_GET['status']) ? sanitize_text_field($_GET['status']) : 'all';
    if ($status_filter !== 'all') {
        $bookings = array_filter($bookings, function($booking) use ($status_filter) {
            return strtolower($booking['status']) === strtolower($status_filter);
        });
    }
    
    ?>
    <div class="wrap glambooking-bookings">
        <h1><?php _e('Bookings', 'glambooking'); ?></h1>
        
        <!-- Filter Tabs -->
        <ul class="subsubsub">
            <li>
                <a href="<?php echo admin_url('admin.php?page=glambooking-bookings&status=all'); ?>" 
                   class="<?php echo $status_filter === 'all' ? 'current' : ''; ?>">
                    <?php _e('All', 'glambooking'); ?> <span class="count">(<?php echo count($bookings_data['bookings'] ?? []); ?>)</span>
                </a> |
            </li>
            <li>
                <a href="<?php echo admin_url('admin.php?page=glambooking-bookings&status=pending'); ?>" 
                   class="<?php echo $status_filter === 'pending' ? 'current' : ''; ?>">
                    <?php _e('Pending', 'glambooking'); ?>
                </a> |
            </li>
            <li>
                <a href="<?php echo admin_url('admin.php?page=glambooking-bookings&status=confirmed'); ?>" 
                   class="<?php echo $status_filter === 'confirmed' ? 'current' : ''; ?>">
                    <?php _e('Confirmed', 'glambooking'); ?>
                </a> |
            </li>
            <li>
                <a href="<?php echo admin_url('admin.php?page=glambooking-bookings&status=completed'); ?>" 
                   class="<?php echo $status_filter === 'completed' ? 'current' : ''; ?>">
                    <?php _e('Completed', 'glambooking'); ?>
                </a> |
            </li>
            <li>
                <a href="<?php echo admin_url('admin.php?page=glambooking-bookings&status=cancelled'); ?>" 
                   class="<?php echo $status_filter === 'cancelled' ? 'current' : ''; ?>">
                    <?php _e('Cancelled', 'glambooking'); ?>
                </a>
            </li>
        </ul>
        
        <br class="clear">
        
        <?php if (empty($bookings)): ?>
            <div class="glambooking-empty-state">
                <p><?php _e('No bookings found', 'glambooking'); ?></p>
            </div>
        <?php else: ?>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th><?php _e('ID', 'glambooking'); ?></th>
                        <th><?php _e('Date & Time', 'glambooking'); ?></th>
                        <th><?php _e('Client', 'glambooking'); ?></th>
                        <th><?php _e('Contact', 'glambooking'); ?></th>
                        <th><?php _e('Service', 'glambooking'); ?></th>
                        <th><?php _e('Duration', 'glambooking'); ?></th>
                        <th><?php _e('Status', 'glambooking'); ?></th>
                        <th><?php _e('Price', 'glambooking'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($bookings as $booking): ?>
                    <tr>
                        <td><strong>#<?php echo esc_html($booking['id']); ?></strong></td>
                        <td>
                            <?php echo date('M j, Y', strtotime($booking['startTime'])); ?><br>
                            <small><?php echo date('g:i A', strtotime($booking['startTime'])); ?></small>
                        </td>
                        <td>
                            <strong><?php echo esc_html($booking['client']['firstName'] . ' ' . $booking['client']['lastName']); ?></strong>
                        </td>
                        <td>
                            <?php echo esc_html($booking['client']['email']); ?><br>
                            <small><?php echo esc_html($booking['client']['phone'] ?? '-'); ?></small>
                        </td>
                        <td><?php echo esc_html($booking['service']['name']); ?></td>
                        <td><?php echo esc_html($booking['service']['duration']); ?> min</td>
                        <td>
                            <span class="glambooking-status glambooking-status-<?php echo strtolower($booking['status']); ?>">
                                <?php echo esc_html($booking['status']); ?>
                            </span>
                        </td>
                        <td><strong>£<?php echo number_format($booking['totalPrice'], 2); ?></strong></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
        
        <div class="glambooking-footer-actions">
            <a href="https://beauticians.glambooking.co.uk/dashboard/bookings" target="_blank" class="button">
                <?php _e('Manage in Full Dashboard', 'glambooking'); ?> →
            </a>
        </div>
    </div>
    <?php
}
