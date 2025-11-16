<?php
/**
 * GlamBooking Gutenberg Block
 */

if (!defined('ABSPATH')) {
    exit;
}

function glambooking_register_block() {
    
    // Register block script
    wp_register_script(
        'glambooking-block-editor',
        GLAMBOOKING_PLUGIN_URL . 'includes/block.js',
        ['wp-blocks', 'wp-element', 'wp-components', 'wp-editor'],
        GLAMBOOKING_VERSION
    );
    
    // Register block
    register_block_type('glambooking/booking-widget', [
        'editor_script' => 'glambooking-block-editor',
        'render_callback' => 'glambooking_block_render',
        'attributes' => [
            'businessId' => [
                'type' => 'string',
                'default' => '',
            ],
            'service' => [
                'type' => 'string',
                'default' => '',
            ],
            'theme' => [
                'type' => 'string',
                'default' => 'default',
            ],
            'height' => [
                'type' => 'number',
                'default' => 600,
            ],
        ],
    ]);
}

function glambooking_block_render($attributes) {
    $business_id = $attributes['businessId'];
    if (empty($business_id) && class_exists('GlamBooking_Auth')) {
        $business_id = GlamBooking_Auth::get_business_id();
    }
    
    if (empty($business_id)) {
        return '<div class="glambooking-error"><p>Business ID is required</p></div>';
    }
    
    return glambooking_shortcode([
        'business' => $business_id,
        'service' => $attributes['service'],
        'theme' => $attributes['theme'],
        'height' => $attributes['height'] . 'px',
    ]);
}

add_action('init', 'glambooking_register_block');
