with open("d:/Training/working/HRMS/frontend/src/App.tsx", "rb") as f:
    raw = f.read(500)
    print("Raw bytes:", raw[:40])
    
    # Try different decodings
    for enc in ["utf-8", "utf-16", "utf-16-le", "utf-16-be", "latin-1"]:
        try:
            text = raw.decode(enc)
            print(f"Decoded with {enc}: {text[:100]}")
        except Exception as e:
            print(f"Failed {enc}: {e}")
