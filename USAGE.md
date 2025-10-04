# IHumbak WP Autocomplete - Usage Guide

## Quick Start

### 1. Plugin Installation and Activation
After activating the plugin, you'll need to configure it before use.

### 2. Configuration (Settings → IHumbak Autocomplete)

#### Required Settings:
- **OpenAI API Key**: Enter your API key from OpenAI
  - Get your key at: https://platform.openai.com/api-keys
  - Keep this key secure and never share it

- **OpenAI Model**: Choose from available models
  - **GPT-3.5 Turbo**: Fast and cost-effective, good for most use cases
  - **GPT-4**: More accurate and nuanced, higher cost
  - **GPT-4 Turbo**: Balance between speed and accuracy

### 3. Using Autocomplete in Posts

#### AI Autocomplete Instructions Meta Box
When editing a post, you'll see a sidebar meta box titled "AI Autocomplete Instructions".

**Example prompts:**
- "Write in a professional, technical tone for software developers"
- "Casual blog post about travel, friendly and engaging"
- "Academic writing style, formal and well-researched"
- "Marketing copy, persuasive and action-oriented"

This helps the AI understand your writing context and provide better suggestions.

#### Writing with Autocomplete

1. **Start Writing**: Type your content normally in the post editor

2. **Wait for Suggestion**: After you stop typing for 1.5 seconds, the plugin automatically requests a completion from OpenAI

3. **View Suggestion**: The AI-generated suggestion appears as grayed-out italic text

4. **Accept or Dismiss**:
   - Press **Right Arrow (→)** to accept and insert the suggestion
   - Press **ESC** to dismiss the suggestion
   - Simply continue typing to ignore it

#### Best Practices

- **Provide Context**: Use the AI Instructions field to give the AI context about your writing
- **Write 10+ Characters**: The plugin needs some text to work with before suggesting
- **Be Patient**: Wait for the suggestion to appear (API calls may take 1-3 seconds)
- **Review Suggestions**: Always review and edit AI suggestions to match your voice

### 4. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ESC | Cancel/dismiss the current suggestion |
| → (Right Arrow) | Accept the suggestion at cursor position |

**Note**: Right arrow only works when the cursor is at the end of the text. If you're in the middle of a sentence, it will move the cursor normally.

## Supported Editors

### Classic Editor (TinyMCE)
Full support with inline suggestion display.

### Block Editor (Gutenberg)
Suggestions appear in a tooltip below the cursor.

## Troubleshooting

### No suggestions appearing?
1. Verify API key is entered in settings
2. Check that you have sufficient OpenAI API credits
3. Ensure you've written at least 10 characters
4. Wait 1.5 seconds after stopping typing
5. Check browser console for errors (F12)

### Suggestion is in wrong language?
Add language specification in the AI Instructions field:
- "Write in Polish" / "Pisz po polsku"
- "Write in English"

### Suggestions don't match my style?
Refine your AI Instructions with more specific guidance:
- Add tone (formal, casual, humorous)
- Specify audience (general public, experts, students)
- Mention key themes or topics

### API errors?
- Verify your API key is correct
- Check OpenAI account status and credits
- Try switching to GPT-3.5 Turbo (more reliable)
- Check OpenAI status page for outages

## Tips for Better Suggestions

1. **Be Specific in Instructions**: The more context you provide in the AI Instructions field, the better the suggestions

2. **Write Enough Context**: Give the AI at least a few sentences before expecting relevant suggestions

3. **Consistent Style**: If you want consistent suggestions throughout a post, keep the same instructions

4. **Review and Edit**: AI suggestions are starting points - always review and refine them

5. **Cost Management**: Be aware that each suggestion costs API credits. More expensive models (GPT-4) provide better quality but cost more.

## Privacy Considerations

- The plugin sends your text to OpenAI's API
- Only the last 500 characters are sent for context
- AI Instructions are included in the request
- Review OpenAI's privacy policy: https://openai.com/privacy
- Consider not using sensitive/confidential information

## Getting Help

For issues or questions:
- Check the README.md file
- Review troubleshooting section
- Open an issue on GitHub: https://github.com/michalstaniecko/ihumbak-wp-autocomplete
