"""Seed dummy questions and mock tests for SSC / CAT / GATE."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _q(exam, topic, difficulty, text, options, correct_index):
    return {
        "id": str(uuid.uuid4()),
        "exam": exam,
        "topic": topic,
        "difficulty": difficulty,
        "text": text,
        "options": options,
        "correct_index": correct_index,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_daily": False,
    }


def build_seed_questions() -> list[dict]:
    qs: list[dict] = []

    # ---------------- SSC ----------------
    qs += [
        _q("SSC", "Quantitative Aptitude", "easy",
           "A train 180 m long crosses a pole in 9 seconds. What is its speed (km/h)?",
           ["54", "60", "72", "80"], 2),
        _q("SSC", "Quantitative Aptitude", "medium",
           "If 20% of A = 30% of B, then A : B is",
           ["2 : 3", "3 : 2", "4 : 3", "5 : 4"], 1),
        _q("SSC", "Quantitative Aptitude", "medium",
           "The average of 5 consecutive even numbers is 20. What is the largest number?",
           ["22", "24", "26", "28"], 1),
        _q("SSC", "Reasoning", "easy",
           "Find the odd one out: Apple, Banana, Carrot, Mango",
           ["Apple", "Banana", "Carrot", "Mango"], 2),
        _q("SSC", "Reasoning", "medium",
           "If in a certain code CAT = 3120, then DOG = ?",
           ["4157", "41574", "4157", "4 15 7"], 3),
        _q("SSC", "English", "easy",
           "Choose the correct synonym of 'Abundant':",
           ["Scarce", "Plentiful", "Rare", "Meagre"], 1),
        _q("SSC", "English", "medium",
           "Select the correctly spelt word:",
           ["Accommodate", "Acommodate", "Acomodate", "Accomodate"], 0),
        _q("SSC", "General Awareness", "easy",
           "Who is known as the Father of the Indian Constitution?",
           ["Mahatma Gandhi", "Jawaharlal Nehru", "B. R. Ambedkar", "Sardar Patel"], 2),
        _q("SSC", "General Awareness", "medium",
           "The headquarters of UNESCO is located in:",
           ["New York", "Geneva", "Paris", "Rome"], 2),
        _q("SSC", "Quantitative Aptitude", "hard",
           "A sum doubles in 8 years at simple interest. In how many years will it become 5 times?",
           ["24 years", "32 years", "28 years", "40 years"], 1),
    ]

    # ---------------- CAT ----------------
    qs += [
        _q("CAT", "Quant", "medium",
           "If x² − 7x + 12 = 0, the sum of the roots is",
           ["7", "−7", "12", "−12"], 0),
        _q("CAT", "Quant", "hard",
           "A cube of side 6 cm is cut into 216 identical smaller cubes. How many small cubes have exactly two faces painted?",
           ["24", "36", "48", "96"], 2),
        _q("CAT", "Quant", "medium",
           "The number of ways of arranging the letters of the word 'EXAM' is",
           ["12", "16", "24", "48"], 2),
        _q("CAT", "Verbal", "medium",
           "Choose the word that best completes the analogy: Book : Author :: Symphony : ?",
           ["Conductor", "Composer", "Violinist", "Orchestra"], 1),
        _q("CAT", "Verbal", "hard",
           "Identify the grammatically correct sentence:",
           ["Neither of the boys have done their homework.",
            "Neither of the boys has done his homework.",
            "Neither of the boy has done his homework.",
            "Neither of the boys has done their homework."], 1),
        _q("CAT", "LRDI", "medium",
           "In a certain code, 'MANGO' is written as 'NBOHP'. How is 'APPLE' written?",
           ["BQQMF", "BQQMG", "BRQMF", "CQQMF"], 0),
        _q("CAT", "LRDI", "hard",
           "Five friends A, B, C, D, E sit in a row. B is to the right of A but left of C. D is to the right of C. E is at an end. If A is at the other end, who is in the middle?",
           ["B", "C", "D", "E"], 1),
        _q("CAT", "Quant", "easy",
           "What is 15% of 240?",
           ["30", "32", "36", "40"], 2),
        _q("CAT", "Verbal", "easy",
           "Choose the antonym of 'Benevolent':",
           ["Kind", "Generous", "Malicious", "Friendly"], 2),
        _q("CAT", "Quant", "medium",
           "If a:b = 3:4 and b:c = 8:9, then a:c is",
           ["2:3", "3:4", "8:9", "2:9"], 0),
    ]

    # ---------------- GATE ----------------
    qs += [
        _q("GATE", "Data Structures", "medium",
           "The worst-case time complexity of QuickSort is",
           ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], 2),
        _q("GATE", "Algorithms", "medium",
           "Which data structure is used for BFS traversal of a graph?",
           ["Stack", "Queue", "Priority Queue", "Linked List"], 1),
        _q("GATE", "Operating Systems", "medium",
           "Which scheduling algorithm can cause starvation?",
           ["FCFS", "Round Robin", "Priority Scheduling", "Shortest Job First"], 2),
        _q("GATE", "Computer Networks", "easy",
           "Which layer of the OSI model is responsible for routing?",
           ["Data Link", "Network", "Transport", "Session"], 1),
        _q("GATE", "DBMS", "medium",
           "Which normal form removes partial dependencies?",
           ["1NF", "2NF", "3NF", "BCNF"], 1),
        _q("GATE", "Digital Logic", "easy",
           "The decimal value of binary 1011 is",
           ["9", "10", "11", "13"], 2),
        _q("GATE", "Theory of Computation", "hard",
           "Which of the following languages is NOT regular?",
           ["a*b*", "{aⁿbⁿ | n ≥ 0}", "(a|b)*", "a(a|b)*b"], 1),
        _q("GATE", "Data Structures", "hard",
           "The minimum number of comparisons required to find the min and max of n elements is",
           ["2n − 2", "3n/2 − 2", "n log n", "n²"], 1),
        _q("GATE", "Operating Systems", "easy",
           "A process in 'ready' state is waiting for",
           ["I/O", "Memory", "CPU", "User input"], 2),
        _q("GATE", "Computer Networks", "medium",
           "Which protocol is connectionless?",
           ["TCP", "UDP", "FTP", "SMTP"], 1),
    ]

    # mark a handful as daily
    for q in qs:
        if q["difficulty"] in ("easy", "medium") and q["exam"] in ("SSC", "CAT", "GATE"):
            # mark roughly first 2 per exam as daily
            pass
    # Simpler: pick 6 as daily (2 per exam)
    daily_ids = set()
    per_exam = {"SSC": 0, "CAT": 0, "GATE": 0}
    for q in qs:
        if per_exam[q["exam"]] < 2:
            q["is_daily"] = True
            daily_ids.add(q["id"])
            per_exam[q["exam"]] += 1

    return qs


def build_seed_mock_tests(questions: list[dict]) -> list[dict]:
    tests: list[dict] = []
    now = datetime.now(timezone.utc).isoformat()
    for exam in ("SSC", "CAT", "GATE"):
        ex_qs = [q for q in questions if q["exam"] == exam]
        if not ex_qs:
            continue
        tests.append({
            "id": str(uuid.uuid4()),
            "title": f"{exam} Full Mock Test – Practice Set 1",
            "exam": exam,
            "description": f"A mixed-topic mock test for {exam} aspirants. Attempt all questions within the time limit.",
            "question_ids": [q["id"] for q in ex_qs],
            "duration_minutes": max(10, len(ex_qs) * 2),
            "total_marks": len(ex_qs),
            "created_at": now,
        })
    return tests
