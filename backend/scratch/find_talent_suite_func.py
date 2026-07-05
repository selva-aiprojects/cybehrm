def main():
    content = open('frontend/src/App.tsx', 'r', encoding='utf-8').read()
    
    idx = content.find("const renderTalentSuite = () =>")
    if idx == -1:
        idx = content.find("function renderTalentSuite()")
    
    if idx == -1:
        print("Function renderTalentSuite not found!")
        return
        
    print(f"Function found at index {idx}:")
    snippet = content[idx:idx+12000]
    print(snippet.encode('ascii', errors='replace').decode('ascii'))

if __name__ == "__main__":
    main()
