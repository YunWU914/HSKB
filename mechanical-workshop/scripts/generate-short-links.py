import os
import json
import random
import string
import html
from urllib.parse import quote

# 短链接哈希长度范围
MIN_HASH_LENGTH = 6
MAX_HASH_LENGTH = 8

# 映射文件路径
SHORT_LINKS_FILE = 'mechanical-workshop/data/short_links.json'
REDIRECTS_FILE = 'mechanical-workshop/_redirects'
# 静态重定向 HTML 文件目录（用于 GitHub Pages 等不支持 _redirects 的平台）
STATIC_REDIRECTS_DIR = 'mechanical-workshop/s'
SITE_ORIGIN = 'https://forum.tbvoh.com'

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


def generate_static_redirect_html(article_link):
    """生成静态重定向 HTML 内容（用于 GitHub Pages 等不支持 _redirects 的平台）

    文件位于 /s/HASH.html，目标文章相对于站点根目录，如 articles/xxx.html
    因此相对路径前缀为 ../
    对路径进行 URL 编码以正确处理空格、括号等特殊字符
    """
    # URL 编码：保留路径分隔符 /，其余特殊字符按需编码（空格 -> %20）
    encoded_link = quote(article_link, safe='/')
    target_url = '../' + encoded_link
    canonical_url = SITE_ORIGIN + '/' + encoded_link
    safe_target = html.escape(target_url, quote=True)
    safe_canonical = html.escape(canonical_url, quote=True)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="robots" content="noindex, follow">
<meta http-equiv="refresh" content="0; url={safe_target}">
<link rel="canonical" href="{safe_canonical}">
<title>Redirecting…</title>
<script>window.location.replace({{target: "{safe_target}"}}.target);</script>
</head>
<body>
<p>Redirecting to <a href="{safe_target}">the article</a>. If you are not redirected automatically, please click the link.</p>
</body>
</html>
"""


def sync_static_redirect_files(short_links):
    """同步静态重定向 HTML 文件，使其与 short_links 映射保持一致

    - 为每个短链生成 s/HASH.html
    - 删除不再需要的旧文件
    返回 (生成数, 删除数)
    """
    os.makedirs(STATIC_REDIRECTS_DIR, exist_ok=True)

    keep_files = set()
    for article_link, hash_str in short_links.items():
        filename = f'{hash_str}.html'
        keep_files.add(filename)
        filepath = os.path.join(STATIC_REDIRECTS_DIR, filename)
        html_content = generate_static_redirect_html(article_link)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)

    removed = 0
    for filename in os.listdir(STATIC_REDIRECTS_DIR):
        if filename.endswith('.html') and filename not in keep_files:
            try:
                os.remove(os.path.join(STATIC_REDIRECTS_DIR, filename))
                removed += 1
            except OSError:
                pass

    return len(short_links), removed


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

    # 始终同步静态重定向 HTML 文件
    # GitHub Pages 不支持 _redirects，必须为每个短链生成 s/HASH.html 才能正常跳转
    generated, removed_files = sync_static_redirect_files(short_links)
    print(f"Synced {generated} static redirect files in s/, removed {removed_files} stale files")


if __name__ == '__main__':
    main()
