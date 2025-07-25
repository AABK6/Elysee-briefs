

import json
import os
import re

def clean_json_string(json_string):
    # Remove markdown code fences
    cleaned_string = re.sub(r'```json\n|\n```', '', json_string)
    return cleaned_string

def update_memos():
    # Read the generated memo data
    with open('memo_data.json', 'r', encoding='utf-8') as f:
        memo_data = json.load(f)

    # Clean the data
    cleaned_data = []
    for item in memo_data:
        if 'raw_response' in item:
            try:
                cleaned_response_str = clean_json_string(item['raw_response'])
                info = json.loads(cleaned_response_str)
                cleaned_data.append({
                    'title_fr': info.get('title_fr', ''),
                    'title_en': info.get('title_en', ''),
                    'summary_fr': info.get('summary_fr', ''),
                    'summary_en': info.get('summary_en', '')
                })
            except json.JSONDecodeError:
                cleaned_data.append({
                    'title_fr': 'Error parsing title',
                    'title_en': 'Error parsing title',
                    'summary_fr': 'Error parsing summary',
                    'summary_en': 'Error parsing summary'
                })
        else:
            cleaned_data.append({
                'title_fr': item.get('title_fr', ''),
                'title_en': item.get('title_en', ''),
                'summary_fr': item.get('summary_fr', ''),
                'summary_en': item.get('summary_en', '')
            })

    # Update the TypeScript files
    update_ts_file('src/lib/memos.fr.ts', cleaned_data, 'fr')
    update_ts_file('src/lib/memos.en.ts', cleaned_data, 'en')

def update_ts_file(ts_file_path, cleaned_data, lang):
    with open(ts_file_path, 'r', encoding='utf-8') as f:
        ts_content = f.read()

    memo_pattern = re.compile(
        r"{\s*"
        r"(id: 'memo-[a-z]+-\d+',\s*)"
        r"(date: '[\d-]+',\s*)"
        r"title: '.*?',\s*"
        r"(documentUrl: '(/docs/.*?)',\s*)"
        r"(categories: \[.*?],\s*)"
        r"(isQuinquennatEvent: (?:true|false),\s*)"
        r"summary: '.*?',\s*"
        r"(fullContent: '.*?')"
        r"\s*}",
        re.DOTALL
    )

    matches = list(memo_pattern.finditer(ts_content))
    
    if len(matches) != len(cleaned_data):
        print(f"Warning: Number of memos in {ts_file_path} ({len(matches)}) does not match data file ({len(cleaned_data)}).")

    updated_ts_content = ts_content
    for i, match in enumerate(matches):
        if i < len(cleaned_data):
            new_data = cleaned_data[i]
            new_title = new_data[f'title_{lang}'].replace("'", "\\'")
            new_summary = new_data[f'summary_{lang}'].replace("'", "\\'")
            
            new_memo_str = (
                f"{{\n    "
                f"{match.group(1)}\n    "
                f"{match.group(2)}\n    "
                f"title: '{new_title}',\n    "
                f"{match.group(4)}\n    "
                f"{match.group(5)}\n    "
                f"{match.group(6)}\n    "
                f"summary: '{new_summary}',\n    "
                f"{match.group(7)}\n  }}"
            )
            updated_ts_content = updated_ts_content.replace(match.group(0), new_memo_str)

    print(f"Updated {len(matches)} memos in {ts_file_path}")

    with open(ts_file_path, 'w', encoding='utf-8') as f:
        f.write(updated_ts_content)

if __name__ == '__main__':
    update_memos()
