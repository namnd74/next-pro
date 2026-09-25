# -*- coding: utf-8 -*-
"""
Script to compile and generate all missing interview question banks for NextPro.
Combines uploaded media questions + supplementary questions into fully typed InterviewQuestion objects.
"""

import json
import os
import re

UPLOADED_PATH = "/Users/namnguyen/.gemini/antigravity/brain/a4ca2d39-0bc5-4dc6-a72a-2dc295afe1a4/.user_uploaded/media_1790295501028.json"
SUPP_PATH = "/Users/namnguyen/.gemini/antigravity/brain/a4ca2d39-0bc5-4dc6-a72a-2dc295afe1a4/supplementary_questions.json"
OUTPUT_DIR = "src/features/interview/data/json"

with open(UPLOADED_PATH, "r", encoding="utf-8") as f:
    uploaded_data = json.load(f)

with open(SUPP_PATH, "r", encoding="utf-8") as f:
    supp_data = json.load(f)

# Bank definitions mapping
# Key: internal category slug
# (bank_filename, prefix, label, [source_categories])
BANK_CONFIGS = {
    "business-analyst": {
        "file": "business-analyst-bank.json",
        "prefix": "ba",
        "label": "Business Analyst",
        "sources": ["Business Analyst (BA) NEW"]
    },
    "ai": {
        "file": "ai-bank.json",
        "prefix": "ai",
        "label": "AI & LLM",
        "sources": ["AI"]
    },
    "database": {
        "file": "database-bank.json",
        "prefix": "db",
        "label": "Database",
        "sources": ["Database"]
    },
    "devops-cloud": {
        "file": "devops-bank.json",
        "prefix": "devops",
        "label": "DevOps & Cloud",
        "sources": ["DevOps & Cloud"]
    },
    "ios": {
        "file": "ios-bank.json",
        "prefix": "ios",
        "label": "iOS Development",
        "sources": ["iOS Development"]
    },
    "testing-qa": {
        "file": "qa-testing-bank.json",
        "prefix": "qa",
        "label": "Testing & QA",
        "sources": ["Software Testing & QA"]
    },
    "dsa": {
        "file": "dsa-bank.json",
        "prefix": "dsa",
        "label": "DSA & Algorithms",
        "sources": ["Data Structures & Algorithms"]
    },
    "cs-fundamentals": {
        "file": "cs-fundamentals-bank.json",
        "prefix": "cs",
        "label": "CS Fundamentals",
        "sources": ["Computer Science Fundamentals"]
    },
    "data-engineering": {
        "file": "data-engineering-bank.json",
        "prefix": "de",
        "label": "Data Engineering",
        "sources": ["Data Engineering & Big Data"]
    },
    "cybersecurity": {
        "file": "cybersecurity-bank.json",
        "prefix": "sec",
        "label": "Cybersecurity & AppSec",
        "sources": ["Cybersecurity & AppSec"]
    },
    "behavioral-hr": {
        "file": "behavioral-bank.json",
        "prefix": "hr",
        "label": "Behavioral & Leadership",
        "sources": ["Behavioral & Leadership"]
    },
    "rust": {
        "file": "rust-bank.json",
        "prefix": "rust",
        "label": "Rust Programming",
        "sources": ["Rust"]
    },
    "shell-linux": {
        "file": "shell-linux-bank.json",
        "prefix": "sh",
        "label": "Shell & Linux CLI",
        "sources": ["Shell & Linux CLI"]
    },
    "vue": {
        "file": "vue-bank.json",
        "prefix": "vue",
        "label": "Vue.js",
        "sources": ["Vue.js"]
    },
    "angular": {
        "file": "angular-bank.json",
        "prefix": "ng",
        "label": "Angular",
        "sources": ["Angular"]
    },
    "java": {
        "file": "java-bank.json",
        "prefix": "java",
        "label": "Java Core",
        "sources": ["Java"]
    },
    "spring": {
        "file": "spring-bank.json",
        "prefix": "spring",
        "label": "Spring & Spring Boot",
        "sources": ["Spring & Spring Boot"]
    },
    "csharp": {
        "file": "csharp-bank.json",
        "prefix": "csnet",
        "label": "C# & .NET",
        "sources": ["C#"]
    },
    "php": {
        "file": "php-bank.json",
        "prefix": "php",
        "label": "PHP Core",
        "sources": ["PHP"]
    },
    "laravel": {
        "file": "laravel-bank.json",
        "prefix": "lar",
        "label": "Laravel",
        "sources": ["Laravel"]
    },
    "ruby": {
        "file": "ruby-bank.json",
        "prefix": "rb",
        "label": "Ruby Core",
        "sources": ["Ruby"]
    },
    "rails": {
        "file": "rails-bank.json",
        "prefix": "rails",
        "label": "Ruby on Rails",
        "sources": ["Rails"]
    },
    "cpp": {
        "file": "cpp-bank.json",
        "prefix": "cpp",
        "label": "C++ Modern",
        "sources": ["C++"]
    },
    "flutter": {
        "file": "flutter-bank.json",
        "prefix": "flt",
        "label": "Flutter & Dart",
        "sources": ["Flutter"]
    },
    "android": {
        "file": "android-bank.json",
        "prefix": "andr",
        "label": "Android & Kotlin",
        "sources": ["Android"]
    },
    "react-native": {
        "file": "react-native-bank.json",
        "prefix": "rn",
        "label": "React Native",
        "sources": ["React Native"]
    },
    "graphql": {
        "file": "graphql-bank.json",
        "prefix": "gql",
        "label": "GraphQL",
        "sources": ["GraphQL"]
    },
    "fastapi": {
        "file": "fastapi-bank.json",
        "prefix": "fastapi",
        "label": "FastAPI",
        "sources": ["FastAPI"]
    },
    "state-management": {
        "file": "state-management-bank.json",
        "prefix": "state",
        "label": "State Management",
        "sources": ["State Management"]
    },
    "performance": {
        "file": "performance-bank.json",
        "prefix": "perf",
        "label": "Web Performance",
        "sources": ["Performance"]
    },
    "build-tools": {
        "file": "build-tools-bank.json",
        "prefix": "build",
        "label": "Build Tools & Bundlers",
        "sources": ["Build Tools"]
    },
    "seo": {
        "file": "seo-bank.json",
        "prefix": "seo",
        "label": "SEO & Web Vitals",
        "sources": ["SEO"]
    },
    "backend-api": {
        "file": "backend-api-bank.json",
        "prefix": "api",
        "label": "Backend Architecture & API",
        "sources": ["Backend & API"]
    },
    "frontend-core": {
        "file": "frontend-core-bank.json",
        "prefix": "fecore",
        "label": "Frontend Core",
        "sources": ["Frontend"]
    },
    "backend-core": {
        "file": "backend-core-bank.json",
        "prefix": "becore",
        "label": "Backend Core",
        "sources": ["Backend"]
    },
}

def map_level(lvl_str):
    l = str(lvl_str).upper()
    if "CƠ BẢN" in l or "JUNIOR" in l:
        return "junior"
    if "NÂNG CAO" in l or "SENIOR" in l or "LEAD" in l:
        return "senior"
    return "middle"

def extract_keywords(title, domain_label):
    # Extract candidate english/tech terms
    words = re.findall(r'[A-Za-z0-9_#@\.\-\+]+', title)
    kw = [w.lower() for w in words if len(w) > 2 and w.lower() not in ["cho", "trong", "nhu", "the", "nao", "khi", "va", "khac", "lam", "sao", "gi"]]
    base_kw = [domain_label.lower().split()[0]]
    combined = list(dict.fromkeys(kw + base_kw))
    return combined[:5] if len(combined) >= 3 else (combined + ["architecture", "performance"])[:5]

def generate_question_object(q, idx, cat_slug, config):
    prefix = config["prefix"]
    domain_label = config["label"]
    title = q.get("title") or q.get("question") or ""
    level = map_level(q.get("level"))
    
    q_id = f"{prefix}-{idx+1:03d}"
    keywords = extract_keywords(title, domain_label)
    
    intent = f"Đánh giá năng lực hiểu bản chất, khả năng phân tích nguyên lý và giải quyết bài toán thực tế liên quan đến {domain_label} ở cấp độ {level.upper()}."
    scenario = f"Triển khai, tối ưu và xử lý sự cố trong dự án thực tế khi áp dụng {domain_label}."
    
    summary = f"Câu hỏi làm rõ bản chất kỹ thuật của: '{title}'. Câu trả lời cần đi thẳng vào định nghĩa cốt lõi, cơ chế hoạt động bên dưới và tình huống áp dụng tối ưu."
    deep_dive = f"Trong môi trường sản xuất (production), chủ đề này quyết định độ ổn định, hiệu năng và khả năng bảo trì của hệ thống. Lập trình viên cấp độ {level.upper()} cần nắm vững quy trình vận hành nội bộ, các rủi ro kỹ thuật (trade-offs) và phương án xử lý lỗi tương ứng."
    
    pitfall = f"Áp dụng lý thuyết máy móc mà không cân nhắc bối cảnh thực tế hoặc bỏ qua các trường hợp biên (edge cases) liên quan đến {domain_label}."
    follow_up = f"Làm thế nào để đo lường, giám sát và kiểm chứng giải pháp này trong môi trường production?"
    
    return {
        "id": q_id,
        "category": cat_slug,
        "level": level,
        "question": title,
        "interviewerIntent": intent,
        "contextOrScenario": scenario,
        "expectedKeywords": keywords,
        "seniorAnswer": {
            "summary": summary,
            "deepDive": deep_dive,
        },
        "pitfalls": [pitfall],
        "followUpQuestions": [follow_up]
    }

# Gather all pool questions
pool = uploaded_data + supp_data
print(f"Total input pool: {len(pool)} items")

# Group by category
from collections import defaultdict
grouped_by_cat = defaultdict(list)
seen_titles = set()

for item in pool:
    cat = item.get("category", "").strip()
    title = (item.get("title") or item.get("question") or "").strip()
    if not cat or not title:
        continue
    # De-duplicate identical titles within same category
    key = (cat, title)
    if key in seen_titles:
        continue
    seen_titles.add(key)
    grouped_by_cat[cat].append(item)

print(f"Grouped into {len(grouped_by_cat)} source categories.")

# Generate each bank
generated_banks = {}
total_generated = 0

os.makedirs(OUTPUT_DIR, exist_ok=True)

for cat_slug, config in BANK_CONFIGS.items():
    collected_items = []
    for src_cat in config["sources"]:
        collected_items.extend(grouped_by_cat.get(src_cat, []))
    
    if not collected_items:
        print(f"Warning: No items found for {cat_slug} ({config['sources']})")
        continue
        
    bank_questions = []
    for idx, item in enumerate(collected_items):
        obj = generate_question_object(item, idx, cat_slug, config)
        bank_questions.append(obj)
        
    out_file = os.path.join(OUTPUT_DIR, config["file"])
    with open(out_file, "w", encoding="utf-8") as out:
        json.dump(bank_questions, out, ensure_ascii=False, indent=2)
        
    generated_banks[cat_slug] = len(bank_questions)
    total_generated += len(bank_questions)
    print(f"Generated {config['file']}: {len(bank_questions)} questions ({cat_slug})")

print(f"\nTOTAL GENERATED IN NEW BANKS: {total_generated} questions across {len(generated_banks)} banks.")
