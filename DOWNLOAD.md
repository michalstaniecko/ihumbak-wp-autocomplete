# Downloading the Plugin

## From GitHub Actions

The plugin is automatically built and packaged as an artifact on every push to the main branch, pull request, or tag. You can download the ready-to-install plugin zip file from GitHub Actions.

### Steps to Download:

1. Go to the [Actions tab](https://github.com/michalstaniecko/ihumbak-wp-autocomplete/actions) in this repository
2. Click on the most recent successful workflow run (look for the green checkmark ✓)
3. Scroll down to the "Artifacts" section
4. Click on "ihumbak-wp-autocomplete" to download the plugin zip file

### Manual Trigger

You can also manually trigger a build at any time:

1. Go to the [Actions tab](https://github.com/michalstaniecko/ihumbak-wp-autocomplete/actions)
2. Click on "Build Plugin" workflow in the left sidebar
3. Click "Run workflow" button
4. Select the branch you want to build from
5. Click "Run workflow"
6. Once complete, download the artifact from the workflow run

## Installation

Once you have the `ihumbak-wp-autocomplete.zip` file:

1. Log in to your WordPress admin panel
2. Go to **Plugins → Add New**
3. Click **Upload Plugin** button at the top
4. Choose the `ihumbak-wp-autocomplete.zip` file
5. Click **Install Now**
6. After installation, click **Activate Plugin**
7. Go to **Settings → IHumbak Autocomplete** to configure

## What's Included in the Package

The plugin zip includes only the necessary files:
- `ihumbak-wp-autocomplete.php` - Main plugin file
- `assets/js/autocomplete.js` - JavaScript functionality
- `assets/css/autocomplete.css` - Styling
- `README.md` - Basic documentation

The following files are NOT included (they're for development only):
- `TECHNICAL.md` - Technical documentation
- `EXAMPLES.md` - Usage examples
- `USAGE.md` - Detailed usage guide
- `.gitignore` - Git configuration

## Building Locally

If you want to build the plugin package locally:

```bash
# Create a directory for the plugin
mkdir -p ihumbak-wp-autocomplete

# Copy necessary files
cp ihumbak-wp-autocomplete.php ihumbak-wp-autocomplete/
cp README.md ihumbak-wp-autocomplete/
cp -r assets ihumbak-wp-autocomplete/

# Create the zip file
zip -r ihumbak-wp-autocomplete.zip ihumbak-wp-autocomplete/
```

The resulting `ihumbak-wp-autocomplete.zip` file is ready to upload to WordPress.
