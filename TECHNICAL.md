# IHumbak WP Autocomplete - Technical Documentation

## Architecture Overview

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     WordPress Admin                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐         ┌──────────────────┐          │
│  │ Settings Page   │         │  Post Editor     │          │
│  ├─────────────────┤         ├──────────────────┤          │
│  │ - API Key       │         │ - Content Area   │          │
│  │ - Model Select  │         │ - AI Instructions│          │
│  └─────────────────┘         │ - Autocomplete   │          │
│                               └──────────────────┘          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    AJAX Request
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   PHP Backend (WordPress)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  IHumbak_WP_Autocomplete Class                              │
│  ├─ handle_completion_request()                             │
│  ├─ get_openai_completion()                                 │
│  ├─ Settings management                                     │
│  └─ Meta box handlers                                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    HTTP Request
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                     OpenAI API                               │
├─────────────────────────────────────────────────────────────┤
│  POST /v1/chat/completions                                  │
│  - Model: gpt-3.5-turbo / gpt-4 / gpt-4-turbo-preview      │
│  - Messages: System + User context                          │
│  - Returns: Text completion                                 │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
ihumbak-wp-autocomplete/
│
├── ihumbak-wp-autocomplete.php    # Main plugin file (Backend)
│   ├── Plugin header
│   ├── Class IHumbak_WP_Autocomplete
│   │   ├── Settings page rendering
│   │   ├── Settings registration
│   │   ├── Meta box for AI instructions
│   │   ├── AJAX handler for completions
│   │   └── OpenAI API integration
│   └── Plugin initialization
│
├── assets/
│   ├── js/
│   │   └── autocomplete.js         # Frontend JavaScript
│   │       ├── Editor detection (Classic/Block)
│   │       ├── Event handlers (keydown/keyup)
│   │       ├── AJAX requests
│   │       ├── Suggestion display
│   │       └── Keyboard shortcuts (ESC/→)
│   │
│   └── css/
│       └── autocomplete.css        # Styling
│           ├── Suggestion styling
│           ├── Classic editor styles
│           └── Block editor styles
│
├── README.md                       # Documentation
├── USAGE.md                        # User guide
└── .gitignore                      # Git ignore rules
```

## Data Flow

### 1. User Types in Editor

```
User types in post editor
        ↓
JavaScript detects keyup event
        ↓
Timer starts (1.5 seconds)
        ↓
User stops typing
        ↓
Timer completes
        ↓
Request triggered
```

### 2. AJAX Request

```javascript
{
  action: 'ihumbak_get_completion',
  nonce: 'security_token',
  text: 'Last 500 characters of content...',
  prompt: 'AI instructions from meta box'
}
```

### 3. PHP Processing

```php
handle_completion_request()
        ↓
Verify nonce
        ↓
Sanitize input
        ↓
Get API key & model from options
        ↓
get_openai_completion()
        ↓
Build request to OpenAI
        ↓
Send HTTP POST to api.openai.com
        ↓
Parse response
        ↓
Return JSON to frontend
```

### 4. OpenAI API Request

```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful writing assistant. Continue the text naturally..."
    },
    {
      "role": "user",
      "content": "Continue this text: [user's content]"
    }
  ],
  "max_tokens": 100,
  "temperature": 0.7
}
```

### 5. Display Suggestion

```
Receive completion from OpenAI
        ↓
JavaScript shows suggestion
        ↓
User sees grayed-out italic text (Classic)
OR tooltip below cursor (Block editor)
        ↓
User presses → or ESC
        ↓
Suggestion accepted or dismissed
```

## WordPress Hooks Used

| Hook | Purpose | File |
|------|---------|------|
| `plugins_loaded` | Initialize plugin | ihumbak-wp-autocomplete.php |
| `admin_menu` | Add settings page | ihumbak-wp-autocomplete.php |
| `admin_init` | Register settings | ihumbak-wp-autocomplete.php |
| `add_meta_boxes` | Add AI instructions box | ihumbak-wp-autocomplete.php |
| `save_post` | Save AI instructions | ihumbak-wp-autocomplete.php |
| `enqueue_block_assets` | Load JS/CSS assets (for block editor iframe) | ihumbak-wp-autocomplete.php |
| `wp_ajax_ihumbak_get_completion` | Handle AJAX requests | ihumbak-wp-autocomplete.php |

## JavaScript Events

| Event | Handler | Purpose |
|-------|---------|---------|
| `keydown` | `handleKeyDown()` / `handleKeyDownBlock()` | Detect ESC and → keys |
| `keyup` | `handleKeyUp()` / `handleKeyUpBlock()` | Trigger suggestion request |
| `AddEditor` (TinyMCE) | `bindClassicEditor()` | Bind to classic editor |
| `wp.data.subscribe` | `bindBlockEditor()` | Bind to block editor |

## Security Measures

1. **Nonce Verification**: All AJAX requests verified with WordPress nonces
2. **Capability Checks**: Only users with `edit_posts` can use autocomplete
3. **Input Sanitization**: All inputs sanitized with WordPress functions
4. **API Key Security**: Stored securely in WordPress options
5. **Direct Access Prevention**: `defined('ABSPATH')` check

## API Integration Details

### Request Parameters
- **Model**: Selected from settings (gpt-3.5-turbo, gpt-4, gpt-4-turbo-preview)
- **Max Tokens**: 100 (limits response length)
- **Temperature**: 0.7 (balanced creativity)
- **Context**: Last 500 characters of content

### Error Handling
- Invalid API key → Error message to user
- Network timeout → 30 second timeout
- API errors → Display error message
- Empty response → Fallback error handling

## Browser Compatibility

- Modern browsers with ES5+ support
- jQuery dependency (included with WordPress)
- CSS3 for styling
- Tested with:
  - Chrome/Edge (Chromium)
  - Firefox
  - Safari

## WordPress Compatibility

- **Minimum WordPress Version**: 5.0
- **Minimum PHP Version**: 7.2
- **Editors Supported**:
  - Classic Editor (TinyMCE)
  - Block Editor (Gutenberg)
- **Post Types**: Currently only `post` (can be extended)

## Performance Considerations

1. **Debouncing**: 1.5 second delay prevents excessive API calls
2. **Context Limit**: Only last 500 characters sent to API
3. **Loading State**: Prevents duplicate requests while processing
4. **Caching**: Could be added for repeated similar contexts
5. **Rate Limiting**: Managed by OpenAI API limits

## Future Enhancement Ideas

1. **More Integrations**: Support for other LLM providers (Anthropic, local models)
2. **Custom Post Types**: Extend beyond posts to pages and CPTs
3. **Multiple Languages**: Better language detection and support
4. **Suggestion History**: Save and reuse previous suggestions
5. **Customizable Shortcuts**: Allow users to configure keyboard shortcuts
6. **Tone Presets**: Quick selection of writing tones
7. **Collaborative Editing**: Multi-user suggestion handling
8. **Analytics**: Track usage and suggestion acceptance rate
9. **A/B Testing**: Compare different models and prompts
10. **Offline Mode**: Cache common suggestions

## Extending the Plugin

### Adding a New LLM Provider

1. Add new setting field in `register_settings()`
2. Create new method similar to `get_openai_completion()`
3. Update `handle_completion_request()` to route to correct provider
4. Add provider-specific API integration

### Supporting Custom Post Types

Modify `add_ai_prompt_meta_box()`:

```php
public function add_ai_prompt_meta_box() {
    $post_types = array('post', 'page', 'custom_post_type');
    foreach ($post_types as $post_type) {
        add_meta_box(
            'ihumbak_ai_prompt',
            __('AI Autocomplete Instructions', 'ihumbak-wp-autocomplete'),
            array($this, 'render_ai_prompt_meta_box'),
            $post_type,
            'side',
            'default'
        );
    }
}
```

### Custom Keyboard Shortcuts

Add settings for keyboard shortcuts and update JavaScript event handlers:

```javascript
// In settings
var acceptKey = ihumbakAutocomplete.acceptKey || 39; // Right arrow
var cancelKey = ihumbakAutocomplete.cancelKey || 27; // ESC

// In event handler
if (e.keyCode === acceptKey) {
    // Accept suggestion
}
```

## Testing Checklist

- [ ] Settings page accessible and saves correctly
- [ ] API key validation
- [ ] Model selection works
- [ ] Meta box appears in post editor
- [ ] AI instructions save with post
- [ ] Autocomplete triggers after typing
- [ ] ESC dismisses suggestion
- [ ] Right arrow accepts suggestion
- [ ] Works in Classic Editor
- [ ] Works in Block Editor
- [ ] Error handling for invalid API key
- [ ] Error handling for network issues
- [ ] Cursor position detection accurate
- [ ] No JavaScript errors in console
- [ ] Responsive design on different screen sizes

## Troubleshooting Guide for Developers

### Using Console Logging for Debugging

The plugin now includes comprehensive console logging to help diagnose issues:

1. Open browser Developer Tools (F12)
2. Go to the Console tab
3. Look for messages prefixed with "IHumbak Autocomplete:"

**Logged Events:**
- Plugin initialization
- Editor type detection (TinyMCE or Gutenberg)
- Suggestion requests with context length
- AJAX responses from server
- Error messages with details

### Testing API Key

The settings page includes a "Test API Key" button that:
- Sends a simple test request to OpenAI
- Validates the API key format and permissions
- Checks for available credits
- Returns specific error messages for troubleshooting

### JavaScript not loading
- Check `admin_enqueue_scripts` hook is firing
- Verify file paths are correct
- Check browser console for 404 errors
- Ensure hook priority isn't conflicting
- Look for "IHumbak Autocomplete: Initializing plugin..." in console

### AJAX requests failing
- Verify nonce is being generated correctly
- Check `wp_ajax_*` hook is registered
- Look for PHP errors in debug.log
- Verify user capabilities
- Check console logs for AJAX error details

### Suggestions not appearing
- Check API key is valid using the Test API Key button
- Monitor network tab for API response
- Verify OpenAI API is accessible
- Check for JavaScript errors in console
- Ensure textarea has id="ihumbak_ai_prompt"

### Style issues
- Verify CSS is enqueued
- Check for CSS conflicts with theme
- Use browser inspector to debug styling
- Ensure z-index is high enough for overlay

## License

GPL v2 or later

## Credits

Built with:
- WordPress Plugin API
- OpenAI API
- jQuery
- TinyMCE API
- Gutenberg Block Editor API
