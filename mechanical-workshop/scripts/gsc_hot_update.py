#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GSC Search Hotness Update Script
================================
Automatically calculates hot_value for articles based on Google Search Console data.

Formula: hot_value = impressions × 0.1 + clicks × 1

Usage:
    python gsc_hot_update.py <csv_file_path>
    python gsc_hot_update.py --check  (audit mode, verify 3 random entries)
    python gsc_hot_update.py --show   (show current hot rankings)
"""

import os
import sys
import json
import csv
import random
import re
from datetime import datetime

# Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(BASE_DIR, 'data', 'gsc_hot.json')
ARTICLES_JSON_PATH = os.path.join(BASE_DIR, 'articles', 'articles.json')

# Hot value calculation formula (fixed)
def calculate_hot_value(impressions, clicks):
    """Calculate hot_value using fixed formula: impressions × 0.1 + clicks × 1"""
    return round(float(impressions) * 0.1 + float(clicks) * 1, 2)

def load_gsc_hot_data():
    """Load existing gsc_hot.json data"""
    if not os.path.exists(JSON_PATH):
        print(f"Error: {JSON_PATH} not found")
        sys.exit(1)
    
    with open(JSON_PATH, 'r', encoding='utf-8-sig') as f:
        return json.load(f)

def load_articles_data():
    """Load articles.json to get valid page URLs"""
    if not os.path.exists(ARTICLES_JSON_PATH):
        print(f"Error: {ARTICLES_JSON_PATH} not found")
        sys.exit(1)
    
    with open(ARTICLES_JSON_PATH, 'r', encoding='utf-8-sig') as f:
        articles = json.load(f)
    
    # Build mapping: filename -> full URL (handles date-prefixed files)
    url_map = {}
    for article in articles:
        if 'link' in article:
            full_url = article['link']
            # Extract filename (e.g., "articles/2026-07-17-xxx.html" -> "xxx.html")
            filename = full_url.split('/')[-1]
            # Remove date prefix if present (YYYY-MM-DD-)
            if re.match(r'^\d{4}-\d{2}-\d{2}-', filename):
                clean_filename = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', filename)
            else:
                clean_filename = filename
            url_map[clean_filename] = full_url
    return url_map

def parse_csv(csv_path):
    """Parse GSC CSV file and extract valid entries"""
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        sys.exit(1)
    
    gsc_data = {}
    url_map = load_articles_data()
    
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        
        # Detect column names (handles different CSV formats)
        headers = reader.fieldnames
        url_col = None
        impressions_col = None
        clicks_col = None
        
        for col in headers:
            if col and ('url' in col.lower() or 'page' in col.lower()):
                url_col = col
            elif col and 'impression' in col.lower():
                impressions_col = col
            elif col and 'click' in col.lower() and 'ctr' not in col.lower():
                clicks_col = col
        
        if not url_col:
            print("Error: URL column not found in CSV")
            sys.exit(1)
        if not impressions_col:
            print("Error: Impressions column not found in CSV")
            sys.exit(1)
        if not clicks_col:
            print("Error: Clicks column not found in CSV")
            sys.exit(1)
        
        print(f"Detected columns: URL='{url_col}', Impressions='{impressions_col}', Clicks='{clicks_col}'")
        
        for row in reader:
            full_url = row[url_col].strip()
            
            # Extract filename from URL
            filename = full_url.split('/')[-1]
            # Remove query string if present
            if '?' in filename:
                filename = filename.split('?')[0]
            
            # Remove date prefix if present
            clean_filename = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', filename)
            
            # Find matching URL
            relative_url = url_map.get(clean_filename)
            
            if not relative_url:
                continue
            
            try:
                impressions = float(row[impressions_col].replace(',', ''))
                clicks = float(row[clicks_col].replace(',', ''))
            except (ValueError, KeyError):
                continue
            
            gsc_data[relative_url] = {
                'impressions': impressions,
                'clicks': clicks
            }
    
    print(f"\nParsed {len(gsc_data)} valid article entries from CSV")
    return gsc_data

def update_gsc_hot_json(csv_data):
    """Update gsc_hot.json with calculated hot_values"""
    hot_data = load_gsc_hot_data()
    today = datetime.now().strftime('%Y-%m-%d')
    
    updated_count = 0
    unchanged_count = 0
    
    for entry in hot_data:
        url = entry['url']
        
        if url in csv_data:
            impressions = csv_data[url]['impressions']
            clicks = csv_data[url]['clicks']
            hot_value = calculate_hot_value(impressions, clicks)
            
            old_hot_value = entry.get('hot_value', 0)
            
            entry['impressions'] = impressions
            entry['clicks'] = clicks
            entry['hot_value'] = hot_value
            entry['update_date'] = today
            
            if hot_value != old_hot_value:
                updated_count += 1
            else:
                unchanged_count += 1
        else:
            # Keep existing values but update date
            entry['update_date'] = today
            unchanged_count += 1
    
    # Sort by hot_value descending
    hot_data.sort(key=lambda x: x['hot_value'], reverse=True)
    
    # Write back
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(hot_data, f, indent=4, ensure_ascii=False)
    
    print(f"\nUpdated {updated_count} entries, {unchanged_count} unchanged")
    print(f"Data saved to {JSON_PATH}")
    
    # Show top 5 rankings
    print("\n=== Hot Topics Top 5 ===")
    for i, entry in enumerate(hot_data[:5], 1):
        print(f"{i}. {entry['url'].split('/')[-1]}")
        print(f"   Hot Value: {entry['hot_value']}")
        print(f"   Impressions: {entry['impressions']}, Clicks: {entry['clicks']}")
        print()
    
    return hot_data

def audit_entries():
    """Randomly audit 3 entries for QA verification"""
    hot_data = load_gsc_hot_data()
    
    if len(hot_data) < 3:
        print("Not enough entries to audit")
        return
    
    # Select 3 random entries
    audited = random.sample(hot_data, min(3, len(hot_data)))
    
    print("=== Random Audit (3 entries) ===")
    all_correct = True
    
    for entry in audited:
        url = entry['url']
        impressions = entry.get('impressions', 0)
        clicks = entry.get('clicks', 0)
        stored_hot_value = entry.get('hot_value', 0)
        
        calculated = calculate_hot_value(impressions, clicks)
        
        status = "✓ CORRECT" if calculated == stored_hot_value else "✗ MISMATCH"
        if calculated != stored_hot_value:
            all_correct = False
        
        print(f"\nURL: {url.split('/')[-1]}")
        print(f"Impressions: {impressions}, Clicks: {clicks}")
        print(f"Stored hot_value: {stored_hot_value}")
        print(f"Calculated: {calculated}")
        print(f"Status: {status}")
    
    if all_correct:
        print("\n✓ All audited entries are correct!")
    else:
        print("\n✗ Audit failed - mismatches found!")
        sys.exit(1)

def show_rankings():
    """Show current hot rankings"""
    hot_data = load_gsc_hot_data()
    
    print("=== Current Hot Topics Rankings ===")
    print(f"Last updated: {hot_data[0].get('update_date', 'N/A') if hot_data else 'N/A'}")
    print()
    
    for i, entry in enumerate(hot_data, 1):
        url = entry['url']
        hot_value = entry.get('hot_value', 0)
        impressions = entry.get('impressions', 0)
        clicks = entry.get('clicks', 0)
        
        print(f"{i}. {url.split('/')[-1]}")
        print(f"   Hot Value: {hot_value}")
        print(f"   Impressions: {impressions}, Clicks: {clicks}")
        print()

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python gsc_hot_update.py <csv_file_path>  # Update hot values from CSV")
        print("  python gsc_hot_update.py --check          # Audit 3 random entries")
        print("  python gsc_hot_update.py --show           # Show current rankings")
        sys.exit(1)
    
    if sys.argv[1] == '--check':
        audit_entries()
    elif sys.argv[1] == '--show':
        show_rankings()
    else:
        csv_path = sys.argv[1]
        csv_data = parse_csv(csv_path)
        update_gsc_hot_json(csv_data)
        audit_entries()

if __name__ == '__main__':
    main()
