import re

with open("src/main/resources/knowledge/faq.md", "r", encoding="utf-8") as f:
    content = f.read()

entries = [e for e in re.split(r"(?m)^## ", content) if e.strip()]
print(f"Total entries: {len(entries)}")
for i, entry in enumerate(entries, 1):
    print(f"Entry {i}: {len(entry)} chars -> {entry.splitlines()[0]}")
    assert len(entry) < 500, f"Entry {i} exceeds 500 chars: {len(entry)}"
print("ALL ENTRIES UNDER 500 CHARS!")
