import os
import json
import re

# 分类图片映射
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
        
        return {
            'title': title_match.group(1).strip() if title_match else os.path.basename(filepath).replace('.html', '').replace('-', ' ').title(),
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

def main():
    articles_dir = 'articles'
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

if __name__ == '__main__':
    main()