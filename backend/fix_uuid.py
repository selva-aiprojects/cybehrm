import re

def fix():
    with open('../db/seed.sql', 'r') as f:
        text = f.read()

    # 1. Fix Booleans
    text = text.replace(
        "('a8385002-390c-45a8-8e6d-2c8b7468112c', 'Acme Corporation', 'acme', 'acme.cognihr.com', 'growth', 'active', 1, 1, 1)",
        "('a8385002-390c-45a8-8e6d-2c8b7468112c', 'Acme Corporation', 'acme', 'acme.cognihr.com', 'growth', 'active', true, true, true)"
    )
    text = text.replace(
        "('b5278c6a-49bd-4cc7-bc6d-eb1a3c77d54b', 'Nexus Health', 'nexus', 'nexushealth.com', 'starter', 'active', 1, 1, 1)",
        "('b5278c6a-49bd-4cc7-bc6d-eb1a3c77d54b', 'Nexus Health', 'nexus', 'nexushealth.com', 'starter', 'active', true, true, true)"
    )

    # 2. Fix UUIDs (ONLY the characters before the first hyphen if they are invalid)
    # The invalid characters we used: g, s, p, k, t, w, m
    # Instead of full regex replace, we can just replace the specific bad sequences:
    bad_prefixes = {
        'g1111111-': '91111111-', 'g2222222-': '92222222-', 'g3333333-': '93333333-', 'g4444444-': '94444444-',
        's1111111-': '81111111-', 's2222222-': '82222222-', 's1010101-': '80101010-',
        'p1111111-': '71111111-', 'p2222222-': '72222222-', 'p3333333-': '73333333-', 'p4444444-': '74444444-',
        'k1111111-': '61111111-', 'k2222222-': '62222222-',
        't1111111-': '51111111-', 't2222222-': '52222222-', 't3333333-': '53333333-',
        'w1010101-': '40101010-',
        'm1111111-': '21111111-', 'm2222222-': '22222222-', 'm3333333-': '23333333-',
        'g1010101-': '90101010-',
    }

    for bad, good in bad_prefixes.items():
        text = text.replace(bad, good)

    with open('../db/seed.sql', 'w') as f:
        f.write(text)
    print('Cleaned Up Everything Properly!')

fix()
