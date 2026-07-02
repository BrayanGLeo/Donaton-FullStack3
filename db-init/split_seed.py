import re

with open('seed_data.sql', 'r', encoding='utf-8') as f:
    content = f.read()

parts = re.split(r'USE ', content)
for i, part in enumerate(parts):
    if i == 0:
        continue
    db_name, rest = part.split(';', 1)
    db_name = db_name.strip()
    with open(f'seed_{db_name}.sql', 'w', encoding='utf-8') as out:
        out.write(rest)
print("Splitting complete")
