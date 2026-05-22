import subprocess
try:
    result = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True)
    print("STDOUT:", result.stdout)
    print("STDERR:", result.stderr)
except Exception as e:
    print(e)
