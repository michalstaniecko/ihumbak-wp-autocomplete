<?php
/**
 * Plugin Name: IHumbak WP Autocomplete
 * Plugin URI: https://github.com/michalstaniecko/ihumbak-wp-autocomplete
 * Description: AI-powered autocomplete for WordPress post editor using OpenAI
 * Version: 1.0.0
 * Author: Michal Staniecko
 * Text Domain: ihumbak-wp-autocomplete
 * Domain Path: /languages
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('IHUMBAK_WP_AUTOCOMPLETE_VERSION', '1.0.0');
define('IHUMBAK_WP_AUTOCOMPLETE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('IHUMBAK_WP_AUTOCOMPLETE_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main plugin class
 */
class IHumbak_WP_Autocomplete {
    
    private static $instance = null;
    
    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        add_action('admin_menu', array($this, 'add_settings_page'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('add_meta_boxes', array($this, 'add_ai_prompt_meta_box'));
        add_action('save_post', array($this, 'save_ai_prompt'));
        add_action('enqueue_block_assets', array($this, 'enqueue_editor_assets'));
        add_action('wp_ajax_ihumbak_get_completion', array($this, 'handle_completion_request'));
        add_action('wp_ajax_ihumbak_test_api_key', array($this, 'handle_test_api_key'));
    }
    
    /**
     * Add settings page to WordPress admin
     */
    public function add_settings_page() {
        add_options_page(
            __('IHumbak Autocomplete Settings', 'ihumbak-wp-autocomplete'),
            __('IHumbak Autocomplete', 'ihumbak-wp-autocomplete'),
            'manage_options',
            'ihumbak-wp-autocomplete',
            array($this, 'render_settings_page')
        );
    }
    
    /**
     * Register plugin settings
     */
    public function register_settings() {
        register_setting('ihumbak_wp_autocomplete_settings', 'ihumbak_openai_api_key', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => ''
        ));
        
        register_setting('ihumbak_wp_autocomplete_settings', 'ihumbak_openai_model', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'gpt-3.5-turbo'
        ));
        
        add_settings_section(
            'ihumbak_wp_autocomplete_main',
            __('OpenAI Settings', 'ihumbak-wp-autocomplete'),
            array($this, 'render_settings_section'),
            'ihumbak-wp-autocomplete'
        );
        
        add_settings_field(
            'ihumbak_openai_api_key',
            __('OpenAI API Key', 'ihumbak-wp-autocomplete'),
            array($this, 'render_api_key_field'),
            'ihumbak-wp-autocomplete',
            'ihumbak_wp_autocomplete_main'
        );
        
        add_settings_field(
            'ihumbak_openai_model',
            __('OpenAI Model', 'ihumbak-wp-autocomplete'),
            array($this, 'render_model_field'),
            'ihumbak-wp-autocomplete',
            'ihumbak_wp_autocomplete_main'
        );
    }
    
    /**
     * Render settings section
     */
    public function render_settings_section() {
        echo '<p>' . esc_html__('Configure OpenAI integration for autocomplete functionality.', 'ihumbak-wp-autocomplete') . '</p>';
    }
    
    /**
     * Render API key field
     */
    public function render_api_key_field() {
        $api_key = get_option('ihumbak_openai_api_key', '');
        echo '<input type="text" id="ihumbak_openai_api_key" name="ihumbak_openai_api_key" value="' . esc_attr($api_key) . '" class="regular-text" />';
        echo ' <button type="button" id="ihumbak_test_api_key" class="button button-secondary">' . esc_html__('Test API Key', 'ihumbak-wp-autocomplete') . '</button>';
        echo '<span id="ihumbak_test_result" style="margin-left: 10px;"></span>';
        echo '<p class="description">' . esc_html__('Enter your OpenAI API key. Click "Test API Key" to verify it works.', 'ihumbak-wp-autocomplete') . '</p>';
    }
    
    /**
     * Render model selection field
     */
    public function render_model_field() {
        $model = get_option('ihumbak_openai_model', 'gpt-3.5-turbo');
        $models = array(
            'gpt-3.5-turbo' => 'GPT-3.5 Turbo',
            'gpt-4' => 'GPT-4',
            'gpt-4-turbo-preview' => 'GPT-4 Turbo',
        );
        
        echo '<select name="ihumbak_openai_model">';
        foreach ($models as $value => $label) {
            echo '<option value="' . esc_attr($value) . '" ' . selected($model, $value, false) . '>' . esc_html($label) . '</option>';
        }
        echo '</select>';
        echo '<p class="description">' . esc_html__('Select the OpenAI model to use for completions.', 'ihumbak-wp-autocomplete') . '</p>';
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        if (isset($_GET['settings-updated'])) {
            add_settings_error(
                'ihumbak_wp_autocomplete_messages',
                'ihumbak_wp_autocomplete_message',
                __('Settings Saved', 'ihumbak-wp-autocomplete'),
                'updated'
            );
        }
        
        settings_errors('ihumbak_wp_autocomplete_messages');
        
        // Enqueue scripts for test button
        wp_enqueue_script('jquery');
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <form action="options.php" method="post">
                <?php
                settings_fields('ihumbak_wp_autocomplete_settings');
                do_settings_sections('ihumbak-wp-autocomplete');
                submit_button(__('Save Settings', 'ihumbak-wp-autocomplete'));
                ?>
            </form>
        </div>
        <script type="text/javascript">
        jQuery(document).ready(function($) {
            $('#ihumbak_test_api_key').on('click', function() {
                var button = $(this);
                var apiKey = $('#ihumbak_openai_api_key').val();
                var resultSpan = $('#ihumbak_test_result');
                
                if (!apiKey) {
                    resultSpan.html('<span style="color: red;">⚠ Please enter an API key first</span>');
                    return;
                }
                
                button.prop('disabled', true);
                resultSpan.html('<span style="color: #666;">⏳ Testing...</span>');
                
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'ihumbak_test_api_key',
                        nonce: '<?php echo wp_create_nonce('ihumbak_test_api_key'); ?>',
                        api_key: apiKey
                    },
                    success: function(response) {
                        button.prop('disabled', false);
                        if (response.success) {
                            resultSpan.html('<span style="color: green;">✓ API key is valid!</span>');
                        } else {
                            resultSpan.html('<span style="color: red;">✗ ' + response.data + '</span>');
                        }
                    },
                    error: function() {
                        button.prop('disabled', false);
                        resultSpan.html('<span style="color: red;">✗ Request failed</span>');
                    }
                });
            });
        });
        </script>
        <?php
    }
    
    /**
     * Add meta box for AI prompt
     */
    public function add_ai_prompt_meta_box() {
        add_meta_box(
            'ihumbak_ai_prompt',
            __('AI Autocomplete Instructions', 'ihumbak-wp-autocomplete'),
            array($this, 'render_ai_prompt_meta_box'),
            'post',
            'side',
            'default'
        );
    }
    
    /**
     * Render AI prompt meta box
     */
    public function render_ai_prompt_meta_box($post) {
        wp_nonce_field('ihumbak_ai_prompt_nonce', 'ihumbak_ai_prompt_nonce_field');
        $prompt = get_post_meta($post->ID, '_ihumbak_ai_prompt', true);
        ?>
        <textarea id="ihumbak_ai_prompt" name="ihumbak_ai_prompt" rows="4" style="width: 100%;" placeholder="<?php esc_attr_e('Enter a brief description for AI to guide the autocomplete...', 'ihumbak-wp-autocomplete'); ?>"><?php echo esc_textarea($prompt); ?></textarea>
        <p class="description"><?php esc_html_e('This prompt will help the AI understand the context of your post for better suggestions.', 'ihumbak-wp-autocomplete'); ?></p>
        <?php
    }
    
    /**
     * Save AI prompt meta box data
     */
    public function save_ai_prompt($post_id) {
        if (!isset($_POST['ihumbak_ai_prompt_nonce_field'])) {
            return;
        }
        
        if (!wp_verify_nonce($_POST['ihumbak_ai_prompt_nonce_field'], 'ihumbak_ai_prompt_nonce')) {
            return;
        }
        
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
        
        if (isset($_POST['ihumbak_ai_prompt'])) {
            update_post_meta($post_id, '_ihumbak_ai_prompt', sanitize_textarea_field($_POST['ihumbak_ai_prompt']));
        }
    }
    
    /**
     * Enqueue editor assets
     */
    public function enqueue_editor_assets() {
        // Only enqueue on post editor screens in admin
        if (!is_admin()) {
            return;
        }
        
        $screen = get_current_screen();
        if (!$screen || 'post' !== $screen->post_type) {
            return;
        }
        
        wp_enqueue_style(
            'ihumbak-autocomplete-css',
            IHUMBAK_WP_AUTOCOMPLETE_PLUGIN_URL . 'assets/css/autocomplete.css',
            array(),
            IHUMBAK_WP_AUTOCOMPLETE_VERSION
        );
        
        wp_enqueue_script(
            'ihumbak-autocomplete-js',
            IHUMBAK_WP_AUTOCOMPLETE_PLUGIN_URL . 'assets/js/autocomplete.js',
            array('jquery'),
            IHUMBAK_WP_AUTOCOMPLETE_VERSION,
            true
        );
        
        wp_localize_script('ihumbak-autocomplete-js', 'ihumbakAutocomplete', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('ihumbak_autocomplete_nonce')
        ));
    }
    
    /**
     * Handle AJAX completion request
     */
    public function handle_completion_request() {
        check_ajax_referer('ihumbak_autocomplete_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Unauthorized');
            return;
        }
        
        $text = isset($_POST['text']) ? sanitize_textarea_field($_POST['text']) : '';
        $prompt = isset($_POST['prompt']) ? sanitize_textarea_field($_POST['prompt']) : '';
        
        if (empty($text)) {
            wp_send_json_error('No text provided');
            return;
        }
        
        $api_key = get_option('ihumbak_openai_api_key', '');
        if (empty($api_key)) {
            wp_send_json_error('OpenAI API key not configured');
            return;
        }
        
        $model = get_option('ihumbak_openai_model', 'gpt-3.5-turbo');
        
        $completion = $this->get_openai_completion($text, $prompt, $api_key, $model);
        
        if (is_wp_error($completion)) {
            wp_send_json_error($completion->get_error_message());
        } else {
            wp_send_json_success(array('suggestion' => $completion));
        }
    }
    
    /**
     * Get completion from OpenAI API
     */
    private function get_openai_completion($text, $prompt, $api_key, $model) {
        $system_message = 'You are a helpful writing assistant. Continue the text naturally and coherently. Provide only the continuation, not the full text. Keep the continuation concise (1-2 sentences).';
        
        if (!empty($prompt)) {
            $system_message .= ' Context: ' . $prompt;
        }
        
        $body = array(
            'model' => $model,
            'messages' => array(
                array(
                    'role' => 'system',
                    'content' => $system_message
                ),
                array(
                    'role' => 'user',
                    'content' => 'Continue this text: ' . $text
                )
            ),
            'max_tokens' => 100,
            'temperature' => 0.7
        );
        
        $response = wp_remote_post('https://api.openai.com/v1/chat/completions', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode($body),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['error'])) {
            return new WP_Error('openai_error', $body['error']['message']);
        }
        
        if (isset($body['choices'][0]['message']['content'])) {
            return trim($body['choices'][0]['message']['content']);
        }
        
        return new WP_Error('openai_error', 'Unexpected response from OpenAI');
    }
    
    /**
     * Handle API key test request
     */
    public function handle_test_api_key() {
        check_ajax_referer('ihumbak_test_api_key', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
            return;
        }
        
        $api_key = isset($_POST['api_key']) ? sanitize_text_field($_POST['api_key']) : '';
        
        if (empty($api_key)) {
            wp_send_json_error('No API key provided');
            return;
        }
        
        // Test with a simple completion request
        $test_body = array(
            'model' => 'gpt-3.5-turbo',
            'messages' => array(
                array(
                    'role' => 'user',
                    'content' => 'Say "test successful" if you can read this.'
                )
            ),
            'max_tokens' => 10
        );
        
        $response = wp_remote_post('https://api.openai.com/v1/chat/completions', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode($test_body),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error('Connection error: ' . $response->get_error_message());
            return;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if ($response_code !== 200) {
            if (isset($body['error']['message'])) {
                wp_send_json_error('API Error: ' . $body['error']['message']);
            } else {
                wp_send_json_error('API returned error code: ' . $response_code);
            }
            return;
        }
        
        if (isset($body['choices'][0]['message']['content'])) {
            wp_send_json_success('API key is valid and working');
        } else {
            wp_send_json_error('Unexpected response from OpenAI');
        }
    }
}

// Initialize the plugin
function ihumbak_wp_autocomplete_init() {
    IHumbak_WP_Autocomplete::get_instance();
}
add_action('plugins_loaded', 'ihumbak_wp_autocomplete_init');
