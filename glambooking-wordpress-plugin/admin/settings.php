<?php
/**
 * GlamBooking Settings Page
 */

if (!defined('ABSPATH')) {
    exit;
}

function glambooking_settings_page() {
    
    // Handle form submission
    if (isset($_POST['glambooking_save_settings']) && check_admin_referer('glambooking_settings')) {
        $public_key = sanitize_text_field($_POST['public_key']);
        $secret_key = sanitize_text_field($_POST['secret_key']);
        $business_id = sanitize_text_field($_POST['business_id']);
        
        GlamBooking_Auth::save_credentials($public_key, $secret_key, $business_id);
        
        // Test connection
        $api_client = new GlamBooking_API_Client();
        if ($api_client->verify_credentials()) {
            echo '<div class="notice notice-success"><p>Connection successful! Your GlamBooking account is now connected.</p></div>';
        } else {
            echo '<div class="notice notice-error"><p>Connection failed. Please check your credentials.</p></div>';
        }
    }
    
    // Handle disconnect
    if (isset($_POST['glambooking_disconnect']) && check_admin_referer('glambooking_disconnect')) {
        GlamBooking_Auth::clear_credentials();
        echo '<div class="notice notice-success"><p>Disconnected from GlamBooking.</p></div>';
    }
    
    $keys = get_option('glambooking_api_keys', []);
    $is_connected = !empty($keys['public_key']) && !empty($keys['secret_key']);
    
    ?>
    <div class="wrap glambooking-settings">
        <h1><?php _e('GlamBooking Settings', 'glambooking'); ?></h1>
        
        <?php if (!$is_connected): ?>
        
        <div class="glambooking-card">
            <h2><?php _e('Connect Your GlamBooking Account', 'glambooking'); ?></h2>
            <p><?php _e('Enter your API credentials from GlamBooking dashboard to connect your account.', 'glambooking'); ?></p>
            
            <div class="glambooking-instructions">
                <h3><?php _e('How to get your API keys:', 'glambooking'); ?></h3>
                <ol>
                    <li><?php _e('Log in to your GlamBooking dashboard', 'glambooking'); ?></li>
                    <li><?php _e('Go to Settings → WordPress Integration', 'glambooking'); ?></li>
                    <li><?php _e('Generate or copy your API keys', 'glambooking'); ?></li>
                    <li><?php _e('Paste them below', 'glambooking'); ?></li>
                </ol>
                <p><strong><?php _e('Note:', 'glambooking'); ?></strong> <?php _e('WordPress integration is only available for PRO plan members.', 'glambooking'); ?></p>
            </div>
            
            <form method="post" action="">
                <?php wp_nonce_field('glambooking_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="public_key"><?php _e('Public Key', 'glambooking'); ?></label>
                        </th>
                        <td>
                            <input type="text" 
                                   id="public_key" 
                                   name="public_key" 
                                   class="regular-text" 
                                   value="<?php echo esc_attr($keys['public_key'] ?? ''); ?>" 
                                   placeholder="pk_..." 
                                   required>
                            <p class="description"><?php _e('Your GlamBooking public API key', 'glambooking'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="secret_key"><?php _e('Secret Key', 'glambooking'); ?></label>
                        </th>
                        <td>
                            <input type="password" 
                                   id="secret_key" 
                                   name="secret_key" 
                                   class="regular-text" 
                                   value="<?php echo esc_attr($keys['secret_key'] ?? ''); ?>" 
                                   placeholder="sk_..." 
                                   required>
                            <p class="description"><?php _e('Your GlamBooking secret API key (keep this private)', 'glambooking'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="business_id"><?php _e('Business ID', 'glambooking'); ?></label>
                        </th>
                        <td>
                            <input type="text" 
                                   id="business_id" 
                                   name="business_id" 
                                   class="regular-text" 
                                   value="<?php echo esc_attr($keys['business_id'] ?? ''); ?>" 
                                   placeholder="123" 
                                   required>
                            <p class="description"><?php _e('Your GlamBooking business ID', 'glambooking'); ?></p>
                        </td>
                    </tr>
                </table>
                
                <p class="submit">
                    <button type="submit" name="glambooking_save_settings" class="button button-primary">
                        <?php _e('Connect Account', 'glambooking'); ?>
                    </button>
                </p>
            </form>
        </div>
        
        <?php else: ?>
        
        <div class="glambooking-card glambooking-connected">
            <div class="glambooking-status">
                <span class="dashicons dashicons-yes-alt"></span>
                <h2><?php _e('Connected to GlamBooking', 'glambooking'); ?></h2>
            </div>
            
            <table class="form-table">
                <tr>
                    <th scope="row"><?php _e('Business ID', 'glambooking'); ?></th>
                    <td><code><?php echo esc_html($keys['business_id']); ?></code></td>
                </tr>
                <tr>
                    <th scope="row"><?php _e('Public Key', 'glambooking'); ?></th>
                    <td><code><?php echo esc_html(substr($keys['public_key'], 0, 20) . '...'); ?></code></td>
                </tr>
            </table>
            
            <form method="post" action="">
                <?php wp_nonce_field('glambooking_disconnect'); ?>
                <p class="submit">
                    <button type="submit" name="glambooking_disconnect" class="button button-secondary">
                        <?php _e('Disconnect Account', 'glambooking'); ?>
                    </button>
                </p>
            </form>
        </div>
        
        <div class="glambooking-card">
            <h2><?php _e('How to Use', 'glambooking'); ?></h2>
            
            <h3><?php _e('Shortcode', 'glambooking'); ?></h3>
            <p><?php _e('Add this shortcode to any page or post:', 'glambooking'); ?></p>
            <code class="glambooking-code">[glambooking business="<?php echo esc_attr($keys['business_id']); ?>"]</code>
            
            <h3><?php _e('Optional Parameters:', 'glambooking'); ?></h3>
            <ul>
                <li><code>service</code> - <?php _e('Pre-select a service category', 'glambooking'); ?></li>
                <li><code>theme</code> - <?php _e('Widget theme (default, minimal, dark)', 'glambooking'); ?></li>
                <li><code>height</code> - <?php _e('Widget height (e.g., 600px)', 'glambooking'); ?></li>
            </ul>
            
            <h3><?php _e('Example:', 'glambooking'); ?></h3>
            <code class="glambooking-code">[glambooking business="<?php echo esc_attr($keys['business_id']); ?>" service="facials" theme="minimal"]</code>
            
            <h3><?php _e('Elementor', 'glambooking'); ?></h3>
            <p><?php _e('Search for "GlamBooking" in the Elementor widget panel and drag it to your page.', 'glambooking'); ?></p>
            
            <h3><?php _e('Gutenberg', 'glambooking'); ?></h3>
            <p><?php _e('Click the "+" button in the editor and search for "GlamBooking" to add the booking block.', 'glambooking'); ?></p>
        </div>
        
        <?php endif; ?>
        
        <div class="glambooking-footer">
            <p><?php _e('Built by', 'glambooking'); ?> <a href="https://glambooking.co.uk" target="_blank">Glambooking.co.uk</a></p>
        </div>
    </div>
    <?php
}
