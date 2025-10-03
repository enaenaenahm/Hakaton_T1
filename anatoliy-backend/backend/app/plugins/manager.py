python3 -c "
import sys
content = sys.stdin.read()
with open('app/plugins/manager.py', 'w') as f:
    f.write(content)
print('✅ app/plugins/manager.py created successfully')
" << 'ENDOFPYTHON'
from sqlalchemy.engine import Engine
from sqlalchemy import text

def run_plugins_export(engine: Engine):
    with engine.begin() as conn:
        rows = conn.execute(text("SELECT level FROM log_record")).all()
    total = len(rows)
    by_level = {}
    for (lv,) in rows:
        by_level[lv or 'NULL'] = by_level.get(lv or 'NULL', 0) + 1
    return {"total": total, "by_level": by_level, "note": "Mock plugin stats"}
ENDOFPYTHON