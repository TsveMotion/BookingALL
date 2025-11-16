/**
 * GlamBooking WordPress Plugin - Admin JavaScript
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        
        // Test API connection
        $('#glambooking-test-connection').on('click', function(e) {
            e.preventDefault();
            
            const $button = $(this);
            const $status = $('#glambooking-connection-status');
            
            $button.prop('disabled', true).text('Testing...');
            $status.html('<span class="spinner is-active"></span>');
            
            $.ajax({
                url: glamBookingAdmin.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'glambooking_test_connection',
                    nonce: glamBookingAdmin.nonce,
                },
                success: function(response) {
                    if (response.success) {
                        $status.html('<span class="dashicons dashicons-yes-alt" style="color: #46b450;"></span> Connected');
                    } else {
                        $status.html('<span class="dashicons dashicons-warning" style="color: #dc3232;"></span> Connection failed');
                    }
                },
                error: function() {
                    $status.html('<span class="dashicons dashicons-warning" style="color: #dc3232;"></span> Error');
                },
                complete: function() {
                    $button.prop('disabled', false).text('Test Connection');
                }
            });
        });
        
        // Auto-refresh dashboard stats every 30 seconds
        if ($('.glambooking-dashboard').length) {
            setInterval(function() {
                refreshDashboardStats();
            }, 30000);
        }
        
        function refreshDashboardStats() {
            $.ajax({
                url: glamBookingAdmin.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'glambooking_refresh_stats',
                    nonce: glamBookingAdmin.nonce,
                },
                success: function(response) {
                    if (response.success && response.data) {
                        updateDashboardStats(response.data);
                    }
                }
            });
        }
        
        function updateDashboardStats(data) {
            if (data.totalBookings) {
                $('.stat-value').eq(0).text(data.totalBookings.toLocaleString());
            }
            if (data.totalRevenue) {
                $('.stat-value').eq(1).text('£' + parseFloat(data.totalRevenue).toFixed(2));
            }
            if (data.upcomingBookings) {
                $('.stat-value').eq(2).text(data.upcomingBookings.toLocaleString());
            }
            if (data.completedThisMonth) {
                $('.stat-value').eq(3).text(data.completedThisMonth.toLocaleString());
            }
        }
        
        // Copy to clipboard functionality
        $('.glambooking-copy-code').on('click', function(e) {
            e.preventDefault();
            
            const $button = $(this);
            const textToCopy = $button.data('copy');
            
            navigator.clipboard.writeText(textToCopy).then(function() {
                const originalText = $button.text();
                $button.text('Copied!');
                
                setTimeout(function() {
                    $button.text(originalText);
                }, 2000);
            });
        });
        
    });
    
})(jQuery);
