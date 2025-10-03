python3 -c "import ast; ast.parse(open('app/main.py').read()); print('✅ main.py OK')"
python3 -c "import ast; ast.parse(open('app/parser.py').read()); print('✅ parser.py OK')"
python3 -c "import ast; ast.parse(open('app/gantt.py').read()); print('✅ gantt.py OK')"
python3 -c "import ast; ast.parse(open('app/plugins/manager.py').read()); print('✅ manager.py OK')"