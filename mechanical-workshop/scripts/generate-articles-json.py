import os
import json
import re

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
        
        return {
            'title': title_match.group(1).strip() if title_match else os.path.basename(filepath).replace('.html', '').replace('-', ' ').title(),
            'description': description_match.group(1).strip() if description_match else 'No description available',
            'author': author_match.group(1).strip() if author_match else 'Unknown Author',
            'category': category_match.group(1).strip() if category_match else 'General Machinery',
            'date': date_match.group(1).strip() if date_match else '2026-06-11',
            'image': image_match.group(1).strip() if image_match else 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600'
        }
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return {
            'title': os.path.basename(filepath).replace('.html', '').replace('-', ' ').title(),
            'description': 'No description available',
            'author': 'Unknown Author',
            'category': 'General Machinery',
            'date': '2026-06-11',
            'image': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600'
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