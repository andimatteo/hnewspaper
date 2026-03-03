import requests
import json
import os
from bs4 import BeautifulSoup

def fetch_hn_top_stories(limit=30):
    url = "https://hacker-news.firebaseio.com/v0/topstories.json"
    r = requests.get(url)
    ids = r.json()[:limit]
    stories = []
    
    for sid in ids:
        item_url = f"https://hacker-news.firebaseio.com/v0/item/{sid}.json"
        item = requests.get(item_url).json()
        if item and item.get("type") == "story" and item.get("url"):
            stories.append(item)
            if len(stories) == 24: # Get exactly 2 spreads (24 stories)
                break
                
    return stories

def extract_article_data(url):
    try:
        r = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Image
        og_image = soup.find("meta", property="og:image")
        image_url = og_image["content"] if og_image else None
        
        # Text
        paragraphs = soup.find_all("p")
        text_content = " ".join([p.get_text() for p in paragraphs])
        # chunk for summary
        return image_url, text_content[:3000]
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None, ""

def generate_summary(text):
    if not text:
        return ""
    # Just return a 280 character snippet of the article body as a summary
    return text[:280].strip() + "..." if len(text) > 280 else text.strip()

def main():
    print("Fetching top stories...")
    stories = fetch_hn_top_stories(40) # Fetch up to 40 logic filters out non-urls.
    
    enriched_stories = []
    
    for idx, s in enumerate(stories):
        print(f"[{idx+1}/{len(stories)}] Processing: {s.get('title')}")
        img, text = extract_article_data(s["url"])
        s["image"] = img
        if text:
            s["summary"] = generate_summary(text)
        else:
            s["summary"] = ""
            
        enriched_stories.append(s)
        
    with open("data.json", "w") as f:
        json.dump(enriched_stories, f, indent=2)
    print("Saved to data.json")

if __name__ == "__main__":
    main()
