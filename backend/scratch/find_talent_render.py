def main():
    content = open('mobile/lib/screens/admin_module_selection_screen.dart', 'r', encoding='utf-8').read()
    lines = content.splitlines()
    for idx in range(145, min(166, len(lines))):
        print(f"Line {idx+1}: {lines[idx].encode('ascii', errors='replace').decode('ascii')}")

if __name__ == "__main__":
    main()
