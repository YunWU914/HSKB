import os
import json
import re
import xml.etree.ElementTree as ET
from xml.dom import minidom
from datetime import datetime

BASE_URL = 'https://www.smartmanu.net'

SITEMAP_STATIC_PAGES = [
    {'path': '', 'changefreq': 'daily', 'priority': '1.0'},
    {'path': 'about.html', 'changefreq': 'monthly', 'priority': '0.6'},
    {'path': 'contact.html', 'changefreq': 'monthly', 'priority': '0.6'},
    {'path': 'privacy-policy.html', 'changefreq': 'yearly', 'priority': '0.3'},
    {'path': 'terms-of-service.html', 'changefreq': 'yearly', 'priority': '0.3'},
    {'path': 'cookie-policy.html', 'changefreq': 'yearly', 'priority': '0.3'},
    {'path': 'dmca.html', 'changefreq': 'yearly', 'priority': '0.3'},
    {'path': 'community-guidelines.html', 'changefreq': 'yearly', 'priority': '0.3'},
]

CATEGORY_SLUG_MAP = {
    'General Machinery': 'general-machinery',
    'Construction Machinery': 'construction-machinery',
    'Cleaning and Ventilation Equipment': 'cleaning-ventilation',
    'Machine Tools and Tooling Machinery': 'machine-tools',
    'Logistics Equipment': 'logistics-equipment',
    'Food Machinery': 'food-machinery',
    'Other Special-purpose Equipment': 'other-machinery',
    'Hardware Accessories & Standard Parts': 'hardware-parts',
}

CATEGORY_IMAGES = {
    'General Machinery': 'images/categories/general-machinery.webp',
    'Construction Machinery': 'images/categories/construction-machinery.webp',
    'Food Machinery': 'images/categories/Food Machinery.webp',
    'Cleaning and Ventilation Equipment': 'images/categories/Cleaning and Ventilation Equipment.webp',
    'Logistics Equipment': 'images/categories/Logistics Equipment.webp',
    'Machine Tools and Tooling Machinery': 'images/categories/Machine Tools and Tooling Machinery.webp',
    'Other Special-purpose Equipment': 'images/categories/Other Special-purpose Equipment.webp',
    'Hardware Accessories & Standard Parts': 'images/categories/Hardware Accessories & Standard Parts.webp'
}

STATIC_PAGE_DATE = '2026-06-11'

def get_category_image(category):
    return CATEGORY_IMAGES.get(category, 'images/categories/general-machinery.webp')

def extract_metadata_from_html(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
        description_match = re.search(r'<meta\s+name="description"\s+content="(.*?)"', content, re.IGNORECASE)
        author_match = re.search(r'<meta\s+name="author"\s+content="(.*?)"', content, re.IGNORECASE)
        category_match = re.search(r'<meta\s+name="category"\s+content="(.*?)"', content, re.IGNORECASE)
        date_match = re.search(r'<meta\s+name="date"\s+content="(.*?)"', content, re.IGNORECASE)
        image_match = re.search(r'<meta\s+name="image"\s+content="(.*?)"', content, re.IGNORECASE)
        
        category = category_match.group(1).strip() if category_match else 'General Machinery'
        
        title = title_match.group(1).strip() if title_match else os.path.basename(filepath).replace('.html', '').replace('-', ' ').title()
        title = re.sub(r'\s*-\s*smartmanu\.net$', '', title, flags=re.IGNORECASE)
        
        return {
            'title': title,
            'description': description_match.group(1).strip() if description_match else 'No description available',
            'author': author_match.group(1).strip() if author_match else 'Unknown Author',
            'category': category,
            'date': date_match.group(1).strip() if date_match else '2026-06-11',
            'image': image_match.group(1).strip() if image_match else get_category_image(category)
        }
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return {
            'title': os.path.basename(filepath).replace('.html', '').replace('-', ' ').title(),
            'description': 'No description available',
            'author': 'Unknown Author',
            'category': 'General Machinery',
            'date': '2026-06-11',
            'image': get_category_image('General Machinery')
        }

def generate_sitemap(articles):
    sitemap_path = 'sitemap.xml'

    urlset = ET.Element('urlset')
    urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')

    latest_article_date = articles[0]['date'] if articles else STATIC_PAGE_DATE

    for page in SITEMAP_STATIC_PAGES:
        url = ET.SubElement(urlset, 'url')
        loc = ET.SubElement(url, 'loc')
        loc.text = f"{BASE_URL}/{page['path']}" if page['path'] else f"{BASE_URL}/"
        lastmod = ET.SubElement(url, 'lastmod')
        lastmod.text = latest_article_date if page['path'] == '' else STATIC_PAGE_DATE
        changefreq = ET.SubElement(url, 'changefreq')
        changefreq.text = page['changefreq']
        priority = ET.SubElement(url, 'priority')
        priority.text = page['priority']

    category_latest = {}
    for article in articles:
        cat = article['category']
        if cat not in category_latest or article['date'] > category_latest[cat]:
            category_latest[cat] = article['date']

    for category, slug in CATEGORY_SLUG_MAP.items():
        url = ET.SubElement(urlset, 'url')
        loc = ET.SubElement(url, 'loc')
        loc.text = f"{BASE_URL}/categories/{slug}.html"
        lastmod = ET.SubElement(url, 'lastmod')
        lastmod.text = category_latest.get(category, latest_article_date)
        changefreq = ET.SubElement(url, 'changefreq')
        changefreq.text = 'weekly'
        priority = ET.SubElement(url, 'priority')
        priority.text = '0.8'

    for article in articles:
        url = ET.SubElement(urlset, 'url')
        loc = ET.SubElement(url, 'loc')
        loc.text = f"{BASE_URL}/{article['link']}"
        lastmod = ET.SubElement(url, 'lastmod')
        lastmod.text = article['date']
        changefreq = ET.SubElement(url, 'changefreq')
        changefreq.text = 'monthly'
        priority = ET.SubElement(url, 'priority')
        priority.text = '0.8'

    tree = ET.ElementTree(urlset)

    rough_string = ET.tostring(urlset, encoding='unicode')
    reparsed = minidom.parseString(rough_string)
    pretty_xml = reparsed.toprettyxml(indent='  ', encoding='utf-8').decode('utf-8')

    lines = []
    for line in pretty_xml.split('\n'):
        if line.strip():
            lines.append(line)
    pretty_xml = '\n'.join(lines) + '\n'

    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write(pretty_xml)

    print(f"Generated sitemap with {len(urlset)} URLs to {sitemap_path}")

def main():
    articles_dir = '../articles'
    json_path = os.path.join(articles_dir, 'articles.json')
    
    articles = []
    article_id = 1
    
    for filename in sorted(os.listdir(articles_dir)):
        if filename.endswith('.html') and filename != 'index.html':
            filepath = os.path.join(articles_dir, filename)
            link = f'articles/{filename}'
            
            metadata = extract_metadata_from_html(filepath)
            
            article = {
                'id': article_id,
                'title': metadata['title'],
                'link': link,
                'image': metadata['image'],
                'description': metadata['description'],
                'category': metadata['category'],
                'date': metadata['date'],
                'author': metadata['author']
            }
            
            articles.append(article)
            article_id += 1
    
    articles.sort(key=lambda x: x['date'], reverse=True)
    
    for i, article in enumerate(articles):
        article['id'] = i + 1
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=4, ensure_ascii=False)
    
    print(f"Generated {len(articles)} articles to {json_path}")

    generate_sitemap(articles)

if __name__ == '__main__':
    main()
