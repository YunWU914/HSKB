import os
import json
import random
import string

# 短链接哈希长度范围
MIN_HASH_LENGTH = 6
MAX_HASH_LENGTH = 8

# 映射文件路径
SHORT_LINKS_FILE = 'mechanical-workshop/data/short_links.json'
REDIRECTS_FILE = 'mechanical-workshop/_redirects'

# 重定向区域标记
REDIRECTS_START = '# === AUTO-GENERATED SHORT LINKS START ==='
REDIRECTS_END = '# === AUTO-GENERATED SHORT LINKS END ==='


def generate_unique_hash(existing_hashes):
    """生成唯一的随机哈希"""
    while True:
        length = random.randint(MIN_HASH_LENGTH, MAX_HASH_LENGTH)
        hash_str = ''.join(random.choices(string.ascii_letters + string.digits, k=length))
        if hash_str not in existing_hashes:
            return hash_str


def load_existing_short_links():
    """加载已有的短链接映射"""
    if os.path.exists(SHORT_LINKS_FILE):
        with open(SHORT_LINKS_FILE, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return {}
    return {}


def save_short_links(short_links):
    """保存短链接映射到文件"""
    os.makedirs(os.path.dirname(SHORT_LINKS_FILE), exist_ok=True)
    with open(SHORT_LINKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(short_links, f, indent=4, ensure_ascii=False)


def update_redirects(short_links):
    """更新 _redirects 文件中的短链接规则"""
    # 读取现有内容
    if os.path.exists(REDIRECTS_FILE):
        with open(REDIRECTS_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
    else:
        content = ''

    # 如果已有自动生成区域，删除它
    if REDIRECTS_START in content and REDIRECTS_END in content:
        start_idx = content.find(REDIRECTS_START)
        end_idx = content.find(REDIRECTS_END) + len(REDIRECTS_END)
        content = content[:start_idx].rstrip() + '\n'
    else:
        # 确保文件末尾有换行
        if content and not content.endswith('\n'):
            content += '\n'

    # 生成新的短链接规则
    rules = [REDIRECTS_START]
    for article_link, hash_str in short_links.items():
        rules.append(f'/s/{hash_str} {article_link} 302')
    rules.append(REDIRECTS_END)
    rules.append('')

    # 写入更新后的内容
    with open(REDIRECTS_FILE, 'w', encoding='utf-8') as f:
        f.write(content + '\n'.join(rules))


def main():
    articles_dir = 'mechanical-workshop/articles'
    
    # 加载已有映射
    short_links = load_existing_short_links()
    existing_articles = set(short_links.keys())  # 文章路径集合 (keys)
    existing_hashes = set(short_links.values())   # 短码集合 (values)
    
    print(f"Loaded {len(short_links)} existing short links")

    # 扫描所有文章文件
    new_articles = []
    for filename in sorted(os.listdir(articles_dir)):
        if filename.endswith('.html') and filename != 'index.html':
            article_link = f'articles/{filename}'
            if article_link not in existing_articles:
                new_articles.append(article_link)
    
    print(f"Found {len(new_articles)} new articles")

    # 为新文章生成短链接
    for article_link in new_articles:
        hash_str = generate_unique_hash(existing_hashes)
        short_links[article_link] = hash_str
        existing_hashes.add(hash_str)
        print(f"Generated short link: /s/{hash_str} -> {article_link}")

    # 检查是否有已删除的文章
    removed_count = 0
    for article_link in list(existing_articles):
        full_path = os.path.join(articles_dir, article_link.replace('articles/', ''))
        if not os.path.exists(full_path):
            hash_str = short_links.pop(article_link)
            removed_count += 1
            print(f"Removed short link for deleted article: /s/{hash_str} -> {article_link}")

    # 保存映射和更新重定向
    if new_articles or removed_count > 0:
        save_short_links(short_links)
        update_redirects(short_links)
        print(f"Updated {len(short_links)} short links total")
    else:
        print("No changes needed")


if __name__ == '__main__':
    main()
