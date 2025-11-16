<?php
/**
 * GlamBooking API Client
 * Handles all API communication with GlamBooking backend
 */

if (!defined('ABSPATH')) {
    exit;
}

class GlamBooking_API_Client {
    
    private $api_url;
    private $public_key;
    private $secret_key;
    private $business_id;
    private $token;
    
    public function __construct() {
        $this->api_url = GLAMBOOKING_API_URL;
        $keys = get_option('glambooking_api_keys', []);
        $this->public_key = $keys['public_key'] ?? '';
        $this->secret_key = $keys['secret_key'] ?? '';
        $this->business_id = $keys['business_id'] ?? '';
    }
    
    /**
     * Authenticate with GlamBooking API
     */
    public function authenticate() {
        $response = wp_remote_post($this->api_url . '/wordpress/auth', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode([
                'publicKey' => $this->public_key,
                'secretKey' => $this->secret_key,
                'businessId' => $this->business_id,
            ]),
            'timeout' => 15,
        ]);
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['authenticated']) && $body['authenticated']) {
            $this->token = $body['token'];
            set_transient('glambooking_auth_token', $this->token, 23 * HOUR_IN_SECONDS);
            return true;
        }
        
        return false;
    }
    
    /**
     * Get authentication token
     */
    private function get_token() {
        if ($this->token) {
            return $this->token;
        }
        
        $cached_token = get_transient('glambooking_auth_token');
        if ($cached_token) {
            $this->token = $cached_token;
            return $this->token;
        }
        
        if ($this->authenticate()) {
            return $this->token;
        }
        
        return false;
    }
    
    /**
     * Make authenticated API request
     */
    private function request($endpoint, $method = 'GET', $data = null) {
        $token = $this->get_token();
        
        if (!$token) {
            return new WP_Error('auth_failed', 'Failed to authenticate with GlamBooking API');
        }
        
        $args = [
            'method' => $method,
            'headers' => [
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json',
            ],
            'timeout' => 15,
        ];
        
        if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
            $args['body'] = json_encode($data);
        }
        
        $url = $this->api_url . $endpoint;
        if ($method === 'GET' && $data) {
            $url .= '?' . http_build_query($data);
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = wp_remote_retrieve_body($response);
        $status_code = wp_remote_retrieve_response_code($response);
        
        if ($status_code >= 400) {
            return new WP_Error('api_error', 'API request failed', ['status' => $status_code]);
        }
        
        return json_decode($body, true);
    }
    
    /**
     * Get bookings
     */
    public function get_bookings($limit = 50) {
        return $this->request('/wordpress/bookings', 'GET', [
            'businessId' => $this->business_id,
            'limit' => $limit,
        ]);
    }
    
    /**
     * Get analytics
     */
    public function get_analytics() {
        return $this->request('/wordpress/analytics', 'GET', [
            'businessId' => $this->business_id,
        ]);
    }
    
    /**
     * Get services
     */
    public function get_services() {
        return $this->request('/wordpress/services', 'GET', [
            'businessId' => $this->business_id,
        ]);
    }
    
    /**
     * Get business details
     */
    public function get_business() {
        return $this->request('/wordpress/business/' . $this->business_id, 'GET');
    }
    
    /**
     * Check if credentials are configured
     */
    public function has_credentials() {
        return !empty($this->public_key) && !empty($this->secret_key) && !empty($this->business_id);
    }
    
    /**
     * Verify credentials
     */
    public function verify_credentials() {
        return $this->authenticate();
    }
}
