# IHumbak WP Autocomplete

AI-powered autocomplete plugin for WordPress post editor using OpenAI.

## Description

This WordPress plugin provides intelligent text autocomplete suggestions while writing posts, similar to code autocomplete in modern IDEs. It uses OpenAI's language models to predict and suggest the next part of your text.

## Features

- **AI-Powered Suggestions**: Get intelligent text completions using OpenAI's GPT models
- **Settings Page**: Configure your OpenAI API key and select the model (GPT-3.5 Turbo, GPT-4, GPT-4 Turbo)
- **API Key Testing**: Built-in test button to validate your OpenAI API key before use
- **Debug Logging**: Console logging to help diagnose issues with autocomplete functionality
- **AI Prompt Field**: Add context-specific instructions in each post to guide the AI
- **Keyboard Controls**:
  - **ESC**: Cancel/dismiss the current suggestion
  - **Right Arrow (→)**: Accept the suggestion and insert it into your text
- **Automatic Triggering**: Suggestions appear automatically after you stop typing (1.5 second delay)
- **Works with Classic Editor**: Full support for WordPress classic editor
- **Block Editor Support**: Compatible with Gutenberg block editor

## Installation

### Download Pre-built Plugin

Download the latest plugin package from [GitHub Actions](https://github.com/michalstaniecko/ihumbak-wp-autocomplete/actions) - see [DOWNLOAD.md](DOWNLOAD.md) for detailed instructions.

### Manual Installation

1. Upload the plugin files to the `/wp-content/plugins/ihumbak-wp-autocomplete` directory, or install the plugin through the WordPress plugins screen directly
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Go to Settings → IHumbak Autocomplete to configure the plugin
4. Enter your OpenAI API key and select your preferred model

## Configuration

### Settings Page

Navigate to **Settings → IHumbak Autocomplete** in your WordPress admin panel.

**Required Settings:**
- **OpenAI API Key**: Your OpenAI API key (get one at https://platform.openai.com/api-keys)
  - Click the **"Test API Key"** button after entering your key to verify it works correctly
  - The test will confirm your key is valid and has available credits
- **OpenAI Model**: Select which GPT model to use:
  - GPT-3.5 Turbo (faster, cheaper)
  - GPT-4 (more accurate)
  - GPT-4 Turbo (balance of speed and accuracy)

### Post Editor

When editing a post, you'll see a new meta box called **AI Autocomplete Instructions** in the sidebar.

Use this field to provide context-specific guidance to the AI, such as:
- The tone of your writing (professional, casual, technical)
- The target audience
- Specific topics or keywords to focus on
- Any special instructions for the writing style

## Usage

1. Start writing your post in the WordPress editor
2. After you stop typing for 1.5 seconds, the plugin will automatically request a suggestion from OpenAI
3. The suggestion will appear as grayed-out italic text
4. **Press the Right Arrow key (→)** to accept the suggestion
5. **Press ESC** to dismiss the suggestion
6. Continue writing as normal

## Requirements

- WordPress 5.0 or higher
- PHP 7.2 or higher
- OpenAI API key
- Active internet connection for API requests

## API Usage and Costs

This plugin makes requests to the OpenAI API, which may incur costs based on your usage and the model you select. Please review OpenAI's pricing at https://openai.com/pricing

Each autocomplete request sends approximately 500 characters of context and requests up to 100 tokens in response.

## Privacy and Data

- The plugin sends the last 500 characters of your post content to OpenAI's API to generate suggestions
- Any AI prompt you enter is also sent to provide context
- No data is stored on external servers beyond what OpenAI retains according to their privacy policy
- Review OpenAI's privacy policy at https://openai.com/privacy

## Troubleshooting

### Suggestions are not appearing

1. **Test your API key**: Go to Settings → IHumbak Autocomplete and click the "Test API Key" button to verify it's working
2. **Check browser console**: Open your browser's Developer Tools (F12) and check the Console tab for error messages from "IHumbak Autocomplete"
3. Ensure you've written at least 10 characters in your post
4. Verify your API key has available credits at https://platform.openai.com/account/usage
5. Make sure you're editing a post (not a page or custom post type)
6. Wait 1.5 seconds after typing for the autocomplete to trigger

### Debugging Steps

The plugin now includes console logging to help diagnose issues:

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Start typing in the post editor
4. Look for messages starting with "IHumbak Autocomplete:"
   - Plugin initialization messages
   - Editor type detection
   - AJAX request details
   - API responses
   - Any error messages

### API Errors

If you see errors related to the API:
- Use the "Test API Key" button in Settings → IHumbak Autocomplete to verify your key
- Check that your OpenAI account has available credits
- Ensure the selected model is available to your account (some models require special access)
- Try switching to a different model (e.g., GPT-3.5 Turbo is available to all users)

### Common Error Messages

- **"OpenAI API key not configured"**: You need to enter your API key in the plugin settings
- **"No text provided"**: Write at least 10 characters before autocomplete will trigger
- **"Unauthorized"** or **"Invalid Authentication"**: Your API key is incorrect or expired
- **"Insufficient quota"**: Your OpenAI account is out of credits
- **"Model not found"**: The selected model is not available to your account

## Development

### File Structure

```
ihumbak-wp-autocomplete/
├── ihumbak-wp-autocomplete.php  # Main plugin file
├── assets/
│   ├── js/
│   │   └── autocomplete.js      # JavaScript for autocomplete functionality
│   └── css/
│       └── autocomplete.css     # Styles for suggestions
└── README.md
```

### Hooks and Filters

The plugin uses standard WordPress hooks:
- `admin_menu` - Add settings page
- `admin_init` - Register settings
- `add_meta_boxes` - Add AI prompt meta box
- `save_post` - Save AI prompt data
- `admin_enqueue_scripts` - Load assets
- `wp_ajax_ihumbak_get_completion` - Handle AJAX requests

## Changelog

### 1.0.0
- Initial release
- OpenAI integration with multiple model support
- Classic editor support
- Block editor (Gutenberg) support
- Settings page for configuration
- AI prompt meta box for per-post context
- Keyboard shortcuts (ESC to cancel, Right Arrow to accept)

## License

This plugin is open source and available under the GPL v2 or later license.

## Support

For issues, feature requests, or contributions, please visit:
https://github.com/michalstaniecko/ihumbak-wp-autocomplete

## Credits

Developed by Michal Staniecko