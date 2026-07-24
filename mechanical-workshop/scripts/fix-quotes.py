import os
import re

base_dir = r'd:\桌面\xg\HSKB-main\mechanical-workshop'

for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f.endswith('.html'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # 修复转义引号
            if '\\"' in content:
                content = content.replace('\\"', '"')
                
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f'Fixed: {filepath}')

print('Done!')