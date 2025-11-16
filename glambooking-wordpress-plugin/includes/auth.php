<?php
/**
 * GlamBooking Authentication Helper
 */

if (!defined('ABSPATH')) {
    exit;
}

class GlamBooking_Auth {
    
    /**
     * Check if user is authenticated with GlamBooking
     */
    public static function is_authenticated() {
        $api_client = new GlamBooking_API_Client();
        return $api_client->has_credentials() && $api_client->verify_credentials();
    }
    
    /**
     * Get current business ID
     */
    public static function get_business_id() {
        $keys = get_option('glambooking_api_keys', []);
        return $keys['business_id'] ?? '';
    }
    
    /**
     * Save API credentials
     */
    public static function save_credentials($public_key, $secret_key, $business_id) {
        update_option('glambooking_api_keys', [
            'public_key' => sanitize_text_field($public_key),
            'secret_key' => sanitize_text_field($secret_key),
            'business_id' => sanitize_text_field($business_id),
        ]);
        
        // Clear cached token
        delete_transient('glambooking_auth_token');
    }
    
    /**
     * Clear credentials
     */
    public static function clear_credentials() {
        delete_option('glambooking_api_keys');
        delete_transient('glambooking_auth_token');
    }
}
