# Contributing to IHumbak WP Autocomplete

Thank you for your interest in contributing to IHumbak WP Autocomplete! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

When reporting bugs, include:
- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **WordPress version** and **PHP version**
- **Plugin version**
- **Editor type** (Classic or Block)
- **Browser** and version
- **Screenshots** if applicable
- **Error messages** from browser console or PHP logs

Example:
```
**Bug**: Suggestions not appearing in Block Editor

**Steps to Reproduce**:
1. Open post in Block Editor
2. Type at least 10 characters
3. Wait 2 seconds

**Expected**: Suggestion should appear
**Actual**: No suggestion appears

**Environment**:
- WordPress: 6.4
- PHP: 8.1
- Plugin: 1.0.0
- Browser: Chrome 120
- Editor: Gutenberg/Block Editor

**Console Errors**: [paste any errors here]
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When suggesting:

- **Use a clear, descriptive title**
- **Provide detailed description** of the suggested enhancement
- **Explain why** this enhancement would be useful
- **List use cases** or examples
- **Describe alternatives** you've considered

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the code style guidelines
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write descriptive commit messages**
6. **Submit a pull request**

#### Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the CHANGELOG.md with your changes
3. Follow the coding standards outlined below
4. Ensure all tests pass (if applicable)
5. Request review from maintainers

#### Good Pull Request Checklist

- [ ] Code follows the project's style guidelines
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Tested in both Classic and Block editors
- [ ] Tested with different WordPress versions
- [ ] No PHP errors or warnings
- [ ] No JavaScript console errors
- [ ] Security considerations addressed

## Development Setup

### Prerequisites

- Local WordPress installation (Local by Flywheel, XAMPP, MAMP, etc.)
- PHP 7.2 or higher
- Node.js and npm (for potential build tools in future)
- Git

### Setting Up Development Environment

1. Clone the repository:
```bash
git clone https://github.com/michalstaniecko/ihumbak-wp-autocomplete.git
```

2. Create symbolic link to WordPress plugins directory:
```bash
ln -s /path/to/ihumbak-wp-autocomplete /path/to/wordpress/wp-content/plugins/
```

3. Activate the plugin in WordPress admin

4. Configure OpenAI API key in Settings → IHumbak Autocomplete

### Testing

#### Manual Testing

1. **Classic Editor**:
   - Install Classic Editor plugin
   - Create new post
   - Test autocomplete functionality
   - Test keyboard shortcuts

2. **Block Editor**:
   - Create new post (default editor)
   - Test autocomplete functionality
   - Test keyboard shortcuts

3. **Settings Page**:
   - Test API key save/load
   - Test model selection
   - Test settings validation

4. **Edge Cases**:
   - Empty content
   - Very long content
   - Special characters
   - Multiple paragraphs
   - Different languages

#### Browser Testing

Test in major browsers:
- Chrome/Chromium
- Firefox
- Safari
- Edge

#### PHP Testing

Run PHP syntax check:
```bash
php -l ihumbak-wp-autocomplete.php
```

For future: Unit tests with PHPUnit

#### JavaScript Testing

Check for errors in browser console

For future: Jest or similar testing framework

## Coding Standards

### PHP Standards

Follow [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/):

```php
// Use WordPress naming conventions
function ihumbak_function_name() {
    // Indentation: 4 spaces
    if (condition) {
        // Do something
    }
}

// Class names: Uppercase words separated by underscores
class IHumbak_Class_Name {
    
    // Method names: Lowercase with underscores
    public function method_name() {
        // Code here
    }
}

// Use proper sanitization
$safe_value = sanitize_text_field($_POST['value']);

// Use proper escaping
echo esc_html($value);
```

### JavaScript Standards

```javascript
// Use strict mode
'use strict';

// Use descriptive variable names
var currentSuggestion = '';

// Proper indentation (4 spaces)
if (condition) {
    // Do something
}

// Use jQuery safely
(function($) {
    // Code here
})(jQuery);
```

### CSS Standards

```css
/* Use descriptive class names */
.ihumbak-suggestion {
    /* Properties alphabetically when possible */
    color: #999;
    font-style: italic;
    opacity: 0.7;
}

/* Prefix all plugin styles */
.ihumbak-* { }
```

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add comments for complex logic
- Keep documentation up to date
- Use proper markdown formatting

### Security Standards

- **Always validate and sanitize input**
- **Always escape output**
- **Use nonces for forms and AJAX**
- **Check user capabilities**
- **Use prepared statements for database queries**
- **Never expose sensitive data**

Example:
```php
// Check nonce
check_ajax_referer('ihumbak_autocomplete_nonce', 'nonce');

// Check capabilities
if (!current_user_can('edit_posts')) {
    wp_send_json_error('Unauthorized');
    return;
}

// Sanitize input
$text = sanitize_textarea_field($_POST['text']);

// Escape output
echo esc_html($text);
```

## Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests after first line

Examples:
```
Add support for custom post types

- Extend meta box to pages and CPTs
- Update documentation
- Add filter for post type selection

Fixes #123
```

```
Fix suggestion positioning in Block Editor

The suggestion tooltip was appearing off-screen when
cursor was near bottom of viewport. Updated positioning
logic to detect viewport boundaries.

Closes #456
```

## Project Structure

```
ihumbak-wp-autocomplete/
├── ihumbak-wp-autocomplete.php  # Main plugin file
├── assets/
│   ├── js/
│   │   └── autocomplete.js      # Frontend JavaScript
│   └── css/
│       └── autocomplete.css     # Styles
├── languages/                    # Translation files (future)
├── tests/                        # Test files (future)
├── README.md                     # Main documentation
├── USAGE.md                      # User guide
├── TECHNICAL.md                  # Technical documentation
├── EXAMPLES.md                   # Example prompts
├── CHANGELOG.md                  # Version history
├── CONTRIBUTING.md               # This file
└── .gitignore                    # Git ignore rules
```

## Adding New Features

### Example: Adding a New LLM Provider

1. **Update Settings**:
```php
// In register_settings()
add_settings_field(
    'ihumbak_provider',
    __('LLM Provider', 'ihumbak-wp-autocomplete'),
    array($this, 'render_provider_field'),
    'ihumbak-wp-autocomplete',
    'ihumbak_wp_autocomplete_main'
);
```

2. **Create Handler**:
```php
private function get_anthropic_completion($text, $prompt, $api_key, $model) {
    // Implementation
}
```

3. **Update AJAX Handler**:
```php
$provider = get_option('ihumbak_provider', 'openai');
if ($provider === 'anthropic') {
    $completion = $this->get_anthropic_completion(...);
}
```

4. **Update Documentation**
5. **Test Thoroughly**
6. **Submit PR**

## Resources

### WordPress Development
- [WordPress Plugin Handbook](https://developer.wordpress.org/plugins/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)
- [WordPress APIs](https://codex.wordpress.org/WordPress_APIs)

### JavaScript
- [jQuery Documentation](https://api.jquery.com/)
- [TinyMCE API](https://www.tiny.cloud/docs/)
- [Gutenberg Block Editor Handbook](https://developer.wordpress.org/block-editor/)

### OpenAI
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

## Questions?

- Open an issue for questions
- Start a discussion on GitHub
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the GPL v2 or later license.

---

Thank you for contributing to IHumbak WP Autocomplete! 🎉
