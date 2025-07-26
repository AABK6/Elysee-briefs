import json
import os
import re
from unidecode import unidecode

def clean_json_string(json_string):
    # Remove markdown code fences and trailing commas
    cleaned_string = re.sub(r'```json\n|\n```', '', json_string)
    cleaned_string = cleaned_string.strip()
    if cleaned_string.endswith(','):
        cleaned_string = cleaned_string[:-1]
    return cleaned_string

def normalize_url(url):
    # Replace backslashes, transliterate to ASCII, and convert to lowercase
    return unidecode(url.replace('\\', '/')).lower()

def update_memos():
    # Read the generated memo data
    with open('memo_data.json', 'r', encoding='utf-8') as f:
        memo_data = json.load(f)

    # Clean and normalize the data
    cleaned_data = {}
    for item in memo_data:
        file_path = item['file']
        # Create a URL path that matches the TS files: /docs/...
        doc_url = '/docs/' + '/'.join(file_path.split(os.sep)[2:])
        normalized_doc_url = normalize_url(doc_url)

        # Handle both raw_response and direct data
        data_to_parse = item.get('raw_response')
        if data_to_parse:
            try:
                cleaned_response_str = clean_json_string(data_to_parse)
                info = json.loads(cleaned_response_str)
            except json.JSONDecodeError:
                info = {} # Set empty info if parsing fails
        else:
            info = item

        cleaned_data[normalized_doc_url] = {
            'title_fr': info.get('title_fr', 'Title not found'),
            'title_en': info.get('title_en', 'Title not found'),
            'summary_fr': info.get('summary_fr', 'Summary not found'),
            'summary_en': info.get('summary_en', 'Summary not found')
        }

    # Update the TypeScript files
    update_ts_file('src/lib/memos.fr.ts', cleaned_data, 'fr', debug=True)
    update_ts_file('src/lib/memos.en.ts', cleaned_data, 'en', debug=True)

def update_ts_file(ts_file_path, cleaned_data, lang, debug=False):
    with open(ts_file_path, 'r', encoding='utf-8') as f:
        ts_content = f.read()

    memo_pattern = re.compile(
        r"{\s*"
        r"(id:\s*'.*?',\s*)"
        r"(date:\s*'.*?',\s*)"
        r"title:\s*'.*?',\s*"
        r"(documentUrl:\s*'(/docs/.*?)',\s*)"
        r"(categories:\s*\[.*?],\s*)"
        r"(isQuinquennatEvent:\s*(?:true|false),\s*)"
        r"summary:\s*'.*?',\s*"
        r"(fullContent:\s*'.*?')"
        r"\s*}\s*",
        re.DOTALL
    )

    match_count = 0
    
    # --- Debugging ---
    if debug:
        print(f"--- Debugging {ts_file_path} ---")
        ts_urls_normalized = set()
        for match in memo_pattern.finditer(ts_content):
            ts_urls_normalized.add(normalize_url(match.group(2)))
        
        json_urls_normalized = set(cleaned_data.keys())

        print(f"Normalized URLs in TS file: {len(ts_urls_normalized)}")
        print(f"Normalized URLs in JSON data: {len(json_urls_normalized)}")
        
        unmatched_in_ts = ts_urls_normalized - json_urls_normalized
        unmatched_in_json = json_urls_normalized - ts_urls_normalized

        print(f"URLs in TS but not in JSON: {len(unmatched_in_ts)}")
        if unmatched_in_ts:
            print("Example:", list(unmatched_in_ts)[0])

        print(f"URLs in JSON but not in TS: {len(unmatched_in_json)}")
        if unmatched_in_json:
            print("Example:", list(unmatched_in_json)[0])
        
        print("--- End Debugging ---\n")
    # --- End Debugging ---


    def replace_memo(match):
        nonlocal match_count
        doc_url_from_ts = match.group(2)
        normalized_ts_url = normalize_url(doc_url_from_ts)

        if normalized_ts_url in cleaned_data:
            match_count += 1
            new_data = cleaned_data[normalized_ts_url]
            # Escape single quotes for inclusion in the TS string
            new_title = new_data[f'title_{lang}'].replace("'", "\\'")
            new_summary = new_data[f'summary_{lang}'].replace("'", "\\'")
            
            # Reconstruct the memo object with new title and summary
            return (
                f"{{\n    "
                f"{match.group(1)}\n    "
                f"{match.group(2)}\n    "
                f"title: '{new_title}',\n    "
                f"{match.group(3)}\n    "
                f"{match.group(4)}\n    "
                f"{match.group(5)}\n    "
                f"summary: '{new_summary}',\n    "
                f"{match.group(6)}\n  }}"
            )
        return match.group(0)

    # Create a more robust regex for the whole memo object to preserve structure
    full_memo_pattern = re.compile(
        r"(\n*\{\s*"
        r"id:\s*'.*?',\s*"
        r"date:\s*'.*?',\s*"
        r"title:\s*)'.*?'(,\s*"
        r"documentUrl:\s*'(/docs/.*?)',\s*"
        r"categories:\s*\[.*?],\s*"
        r"isQuinquennatEvent:\s*(?:true|false),\s*"
        r"summary:\s*)'.*?'(,\s*"
        r"fullContent:\s*'.*?'\s*"
        r"\}\n*)",
        re.DOTALL
    )

    def replace_memo_robust(match):
        nonlocal match_count
        doc_url_from_ts = match.group(3)
        normalized_ts_url = normalize_url(doc_url_from_ts)

        if normalized_ts_url in cleaned_data:
            match_count += 1
            new_data = cleaned_data[normalized_ts_url]
            new_title = new_data[f'title_{lang}'].replace("'", "\\'")
            new_summary = new_data[f'summary_{lang}'].replace("'", "\\'")

            return f"{match.group(1)}'{new_title}'{match.group(2)}'{new_summary}'{match.group(4)}"
        
        return match.group(0)


    updated_ts_content = full_memo_pattern.sub(replace_memo_robust, ts_content)
    
    print(f"Found and replaced {match_count} memos in {ts_file_path}")

    # Uncomment to write changes
    with open(ts_file_path, 'w', encoding='utf-8') as f:
        f.write(updated_ts_content)

if __name__ == '__main__':
    update_memos()