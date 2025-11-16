<?php
/**
 * Plugin Name: GlamBooking - WordPress Integration
 * Plugin URI: https://book.glambooking.co.uk/wordpress
 * Description: Embed GlamBooking appointment system into your WordPress site with Elementor, Gutenberg, and shortcode support.
 * Version: 1.0.0
 * Author: Glambooking.co.uk
 * Author URI: https://glambooking.co.uk
 * Text Domain: glambooking
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('GLAMBOOKING_VERSION', '1.0.0');
define('GLAMBOOKING_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('GLAMBOOKING_PLUGIN_URL', plugin_dir_url(__FILE__));
define('GLAMBOOKING_API_URL', 'https://api.glambooking.co.uk/api');

// Autoloader
spl_autoload_register(function ($class) {
    $prefix = 'GlamBooking\\';
    $base_dir = GLAMBOOKING_PLUGIN_DIR . 'includes/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

// Initialize plugin
class GlamBooking_Plugin {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->includes();
        $this->init_hooks();
    }
    
    private function includes() {
        // Load core classes first
        require_once GLAMBOOKING_PLUGIN_DIR . 'includes/api-client.php';
        require_once GLAMBOOKING_PLUGIN_DIR . 'includes/auth.php';
        
        // Load public functionality
        require_once GLAMBOOKING_PLUGIN_DIR . 'public/shortcode.php';
        
        // Admin pages
        if (is_admin()) {
            require_once GLAMBOOKING_PLUGIN_DIR . 'admin/dashboard.php';
            require_once GLAMBOOKING_PLUGIN_DIR . 'admin/bookings.php';
            require_once GLAMBOOKING_PLUGIN_DIR . 'admin/analytics.php';
            require_once GLAMBOOKING_PLUGIN_DIR . 'admin/settings.php';
        }
        
        // Elementor and Gutenberg loaded via hooks (not here)
    }
    
    private function init_hooks() {
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);
        
        add_action('plugins_loaded', [$this, 'load_textdomain']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_public_assets']);
        
        // Elementor init
        add_action('elementor/widgets/register', [$this, 'register_elementor_widgets']);
        
        // Gutenberg init
        add_action('init', [$this, 'register_gutenberg_blocks']);
    }
    
    public function activate() {
        // Set default options
        if (!get_option('glambooking_api_keys')) {
            add_option('glambooking_api_keys', [
                'public_key' => '',
                'secret_key' => '',
                'business_id' => '',
            ]);
        }
        
        flush_rewrite_rules();
    }
    
    public function deactivate() {
        flush_rewrite_rules();
    }
    
    public function load_textdomain() {
        load_plugin_textdomain('glambooking', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    public function add_admin_menu() {
        add_menu_page(
            __('GlamBooking', 'glambooking'),
            __('GlamBooking', 'glambooking'),
            'manage_options',
            'glambooking',
            'glambooking_dashboard_page',
            'dashicons-calendar-alt',
            30
        );
        
        add_submenu_page(
            'glambooking',
            __('Dashboard', 'glambooking'),
            __('Dashboard', 'glambooking'),
            'manage_options',
            'glambooking',
            'glambooking_dashboard_page'
        );
        
        add_submenu_page(
            'glambooking',
            __('Bookings', 'glambooking'),
            __('Bookings', 'glambooking'),
            'manage_options',
            'glambooking-bookings',
            'glambooking_bookings_page'
        );
        
        add_submenu_page(
            'glambooking',
            __('Analytics', 'glambooking'),
            __('Analytics', 'glambooking'),
            'manage_options',
            'glambooking-analytics',
            'glambooking_analytics_page'
        );
        
        add_submenu_page(
            'glambooking',
            __('Settings', 'glambooking'),
            __('Settings', 'glambooking'),
            'manage_options',
            'glambooking-settings',
            'glambooking_settings_page'
        );
    }
    
    public function enqueue_admin_assets($hook) {
        if (strpos($hook, 'glambooking') === false) {
            return;
        }
        
        wp_enqueue_style(
            'glambooking-admin',
            GLAMBOOKING_PLUGIN_URL . 'admin/css/admin.css',
            [],
            GLAMBOOKING_VERSION
        );
        
        wp_enqueue_script(
            'glambooking-admin',
            GLAMBOOKING_PLUGIN_URL . 'admin/js/admin.js',
            ['jquery'],
            GLAMBOOKING_VERSION,
            true
        );
        
        wp_localize_script('glambooking-admin', 'glamBookingAdmin', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('glambooking_nonce'),
            'apiUrl' => GLAMBOOKING_API_URL,
        ]);
    }
    
    public function enqueue_public_assets() {
        wp_enqueue_style(
            'glambooking-public',
            GLAMBOOKING_PLUGIN_URL . 'public/css/public.css',
            [],
            GLAMBOOKING_VERSION
        );
        
        wp_enqueue_script(
            'glambooking-public',
            GLAMBOOKING_PLUGIN_URL . 'public/js/booking-widget.js',
            ['jquery'],
            GLAMBOOKING_VERSION,
            true
        );
    }
    
    public function register_elementor_widgets($widgets_manager) {
        if (!class_exists('GlamBooking_Elementor_Widget')) {
            require_once GLAMBOOKING_PLUGIN_DIR . 'includes/elementor-widget.php';
        }
        $widgets_manager->register(new \GlamBooking_Elementor_Widget());
    }
    
    public function register_gutenberg_blocks() {
        if (!function_exists('register_block_type')) {
            return;
        }
        
        if (!function_exists('glambooking_register_block')) {
            require_once GLAMBOOKING_PLUGIN_DIR . 'includes/gutenberg-block.php';
        }
    }
}

// Initialize the plugin
function glambooking_init() {
    return GlamBooking_Plugin::get_instance();
}

glambooking_init();
