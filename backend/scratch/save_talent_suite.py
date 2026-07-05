def main():
    content = open('frontend/src/App.tsx', 'r', encoding='utf-8').read()
    
    idx = content.find("const renderTalentSuite = () =>")
    if idx == -1:
        idx = content.find("function renderTalentSuite()")
    
    if idx == -1:
        print("Function renderTalentSuite not found!")
        return
        
    # Find matching brace or next major section to get full function body
    # Let's extract 30,000 characters to cover it
    snippet = content[idx:idx+30000]
    with open('C:/Users/HP/.gemini/antigravity-ide/brain/594357cc-72e6-4d0b-833a-ad1b1b62bbda/render_talent_suite.txt', 'w', encoding='utf-8') as f:
        f.write(snippet)
    print("Function renderTalentSuite saved to C:/Users/HP/.gemini/antigravity-ide/brain/594357cc-72e6-4d0b-833a-ad1b1b62bbda/render_talent_suite.txt")

if __name__ == "__main__":
    main()
