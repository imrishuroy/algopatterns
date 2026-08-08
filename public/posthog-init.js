// PostHog initialization for marketing site
// Replace POSTHOG_API_KEY with your actual key in production
(function() {
    var apiKey = ''; // Set via deployment or replace with actual key
    if (apiKey) {
        posthog.init(apiKey, {
            api_host: 'https://us.i.posthog.com',
            capture_pageview: true,
            autocapture: true
        });
    }
})();
