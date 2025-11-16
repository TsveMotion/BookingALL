<?php
/**
 * GlamBooking Shortcode
 * Usage: [glambooking business="123" service="facials" theme="minimal"]
 */

if (!defined('ABSPATH')) {
    exit;
}

function glambooking_shortcode($atts) {
    $atts = shortcode_atts([
        'business' => '',
        'service' => '',
        'theme' => 'default',
        'height' => '600px',
    ], $atts, 'glambooking');
    
    $api_client = new GlamBooking_API_Client();
    
    if (!$api_client->has_credentials()) {
        if (current_user_can('manage_options')) {
            return '<div class="glambooking-error">
                <p>GlamBooking is not configured. Please <a href="' . admin_url('admin.php?page=glambooking-settings') . '">configure your API keys</a>.</p>
            </div>';
        }
        return '';
    }
    
    $business_id = $atts['business'];
    if (empty($business_id) && class_exists('GlamBooking_Auth')) {
        $business_id = GlamBooking_Auth::get_business_id();
    }
    
    if (empty($business_id)) {
        return '<div class="glambooking-error"><p>Business ID is required.</p></div>';
    }
    
    // Build iframe URL
    $iframe_url = 'https://book.glambooking.co.uk/business/' . urlencode($business_id);
    
    $params = [];
    if (!empty($atts['service'])) {
        $params['service'] = $atts['service'];
    }
    if (!empty($atts['theme'])) {
        $params['theme'] = $atts['theme'];
    }
    
    if (!empty($params)) {
        $iframe_url .= '?' . http_build_query($params);
    }
    
    $output = '<div class="glambooking-widget" data-business="' . esc_attr($business_id) . '">';
    $output .= '<iframe 
        src="' . esc_url($iframe_url) . '" 
        width="100%" 
        height="' . esc_attr($atts['height']) . '" 
        frameborder="0" 
        style="border: none; border-radius: 8px;"
        title="GlamBooking Appointment System"
    ></iframe>';
    $output .= '</div>';
    
    return $output;
}

add_shortcode('glambooking', 'glambooking_shortcode');
