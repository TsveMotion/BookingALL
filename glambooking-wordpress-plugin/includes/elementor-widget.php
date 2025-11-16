<?php
/**
 * GlamBooking Elementor Widget
 * Drag-and-drop booking widget for Elementor
 */

if (!defined('ABSPATH')) {
    exit;
}

class GlamBooking_Elementor_Widget extends \Elementor\Widget_Base {
    
    public function get_name() {
        return 'glambooking_widget';
    }
    
    public function get_title() {
        return __('GlamBooking', 'glambooking');
    }
    
    public function get_icon() {
        return 'eicon-calendar';
    }
    
    public function get_categories() {
        return ['general'];
    }
    
    public function get_keywords() {
        return ['booking', 'appointment', 'calendar', 'glambooking', 'beautician', 'salon'];
    }
    
    protected function register_controls() {
        
        // Content Section
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Settings', 'glambooking'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );
        
        $default_business_id = '';
        if (class_exists('GlamBooking_Auth')) {
            $default_business_id = GlamBooking_Auth::get_business_id();
        }
        
        $this->add_control(
            'business_id',
            [
                'label' => __('Business ID', 'glambooking'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => $default_business_id,
                'description' => __('Leave empty to use default business ID from settings', 'glambooking'),
            ]
        );
        
        $this->add_control(
            'service',
            [
                'label' => __('Pre-select Service', 'glambooking'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => '',
                'description' => __('Optional: Pre-select a specific service category', 'glambooking'),
            ]
        );
        
        $this->add_control(
            'theme',
            [
                'label' => __('Theme', 'glambooking'),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'default',
                'options' => [
                    'default' => __('Default', 'glambooking'),
                    'minimal' => __('Minimal', 'glambooking'),
                    'dark' => __('Dark', 'glambooking'),
                ],
            ]
        );
        
        $this->add_control(
            'height',
            [
                'label' => __('Height', 'glambooking'),
                'type' => \Elementor\Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 400,
                        'max' => 1200,
                        'step' => 50,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 600,
                ],
            ]
        );
        
        $this->end_controls_section();
        
        // Style Section
        $this->start_controls_section(
            'style_section',
            [
                'label' => __('Style', 'glambooking'),
                'tab' => \Elementor\Controls_Manager::TAB_STYLE,
            ]
        );
        
        $this->add_control(
            'border_radius',
            [
                'label' => __('Border Radius', 'glambooking'),
                'type' => \Elementor\Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 50,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 8,
                ],
                'selectors' => [
                    '{{WRAPPER}} .glambooking-widget iframe' => 'border-radius: {{SIZE}}{{UNIT}};',
                ],
            ]
        );
        
        $this->end_controls_section();
    }
    
    protected function render() {
        $settings = $this->get_settings_for_display();
        
        $business_id = $settings['business_id'];
        if (empty($business_id) && class_exists('GlamBooking_Auth')) {
            $business_id = GlamBooking_Auth::get_business_id();
        }
        
        if (empty($business_id)) {
            echo '<div class="glambooking-error"><p>' . __('Business ID is required', 'glambooking') . '</p></div>';
            return;
        }
        
        $iframe_url = 'https://book.glambooking.co.uk/business/' . urlencode($business_id);
        
        $params = [];
        if (!empty($settings['service'])) {
            $params['service'] = $settings['service'];
        }
        if (!empty($settings['theme'])) {
            $params['theme'] = $settings['theme'];
        }
        
        if (!empty($params)) {
            $iframe_url .= '?' . http_build_query($params);
        }
        
        $height = $settings['height']['size'] . 'px';
        
        echo '<div class="glambooking-widget" data-business="' . esc_attr($business_id) . '">';
        echo '<iframe 
            src="' . esc_url($iframe_url) . '" 
            width="100%" 
            height="' . esc_attr($height) . '" 
            frameborder="0" 
            style="border: none;"
            title="GlamBooking Appointment System"
        ></iframe>';
        echo '</div>';
    }
}
