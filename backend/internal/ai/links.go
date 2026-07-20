package ai

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/imrishuroy/algopatterns/internal/ai/rag"
)

// LinkEntry represents an internal link that can be recommended
type LinkEntry struct {
	Type  string `json:"type"`
	Slug  string `json:"slug"`
	Title string `json:"title"`
	URL   string `json:"url"`
}

// BuildLinkManifest builds a link manifest from RAG results
func BuildLinkManifest(results []rag.ContentEmbedding) []LinkEntry {
	var links []LinkEntry
	seen := make(map[string]bool)

	for _, r := range results {
		key := r.ContentType + ":" + r.SourceID
		if seen[key] {
			continue
		}
		seen[key] = true

		var slug, title string

		// Extract slug and title from metadata
		if r.Metadata != nil {
			var meta map[string]interface{}
			if err := json.Unmarshal(r.Metadata, &meta); err == nil {
				if v, ok := meta["slug"].(string); ok {
					slug = v
				}
				if v, ok := meta["category"].(string); ok && title == "" {
					title = v
				}
				if v, ok := meta["name"].(string); ok {
					title = v
				}
				if v, ok := meta["title"].(string); ok {
					title = v
				}
			}
		}

		url := buildURL(r.ContentType, slug, r.SourceID)
		if url == "" {
			continue
		}

		// Use slug from metadata or fall back to sourceID
		finalSlug := slug
		if finalSlug == "" {
			finalSlug = r.SourceID
		}

		// Generate title if not found
		if title == "" {
			title = formatTitle(finalSlug)
		}

		links = append(links, LinkEntry{
			Type:  r.ContentType,
			Slug:  finalSlug,
			Title: title,
			URL:   url,
		})
	}

	return links
}

// buildURL constructs a URL from content type and slug
func buildURL(contentType, slug, sourceID string) string {
	id := slug
	if id == "" {
		id = sourceID
	}
	if id == "" {
		return ""
	}

	switch contentType {
	case "pattern":
		return fmt.Sprintf("/patterns/%s", id)
	case "problem":
		return fmt.Sprintf("/problems/%s", id)
	case "concept":
		return fmt.Sprintf("/dsa-fundamentals/%s", id)
	case "article":
		return fmt.Sprintf("/articles/%s", id)
	default:
		return ""
	}
}

// formatTitle converts a slug to a human-readable title
func formatTitle(slug string) string {
	// Replace hyphens with spaces and title case
	words := strings.Split(slug, "-")
	for i, word := range words {
		if len(word) > 0 {
			words[i] = strings.ToUpper(word[:1]) + word[1:]
		}
	}
	return strings.Join(words, " ")
}

// FormatLinkManifest formats link entries as a markdown table for injection into prompts
func FormatLinkManifest(links []LinkEntry) string {
	if len(links) == 0 {
		return ""
	}

	var sb strings.Builder
	sb.WriteString("The following are the ONLY valid internal links on this platform. When you\n")
	sb.WriteString("recommend content, use EXACTLY these URLs. Do not invent or modify them.\n\n")
	sb.WriteString("| Title | URL |\n")
	sb.WriteString("|-------|-----|\n")

	for _, link := range links {
		sb.WriteString(fmt.Sprintf("| %s | %s |\n", link.Title, link.URL))
	}

	sb.WriteString("\nFormat links in your response as: [Title](/path)")

	return sb.String()
}

// DedupeBySourceID removes duplicate RAG results by source ID
func DedupeBySourceID(results []rag.ContentEmbedding) []rag.ContentEmbedding {
	seen := make(map[string]bool)
	var deduped []rag.ContentEmbedding

	for _, r := range results {
		key := r.ContentType + ":" + r.SourceID
		if !seen[key] {
			seen[key] = true
			deduped = append(deduped, r)
		}
	}

	return deduped
}
