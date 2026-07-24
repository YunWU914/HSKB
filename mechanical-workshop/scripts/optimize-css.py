import os
import re

base_dir = r'd:\桌面\xg\HSKB-main\mechanical-workshop'

for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f.endswith('.html'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # 查找没有 preload 的 CSS 链接
            pattern = r'<link rel=\"stylesheet\" href=\"([^\"]*styles\.css)\"(?! media)>'
            matches = re.findall(pattern, content)
            
            if matches:
                # 添加 preload 和 media 属性
                content = re.sub(pattern, r'<link rel=\"preload\" href=\"\1\" as=\"style\">\n<link rel=\"stylesheet\" href=\"\1\" media=\"screen\">', content)
                
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f'Updated: {filepath}')

print('Done!')