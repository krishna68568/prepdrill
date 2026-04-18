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

    # ---------------- RAILWAYS (RRB NTPC / Group D / ALP) ----------------
    qs += [
        _q("Railways", "General Awareness", "easy",
           "Which is the longest railway platform in India?",
           ["Kharagpur", "Hubballi", "Gorakhpur", "Kollam"], 1),
        _q("Railways", "General Awareness", "medium",
           "Indian Railways is divided into how many zones (as of 2022)?",
           ["16", "17", "18", "19"], 2),
        _q("Railways", "General Science", "easy",
           "The chemical symbol for Sodium is",
           ["S", "So", "Na", "N"], 2),
        _q("Railways", "General Science", "medium",
           "The SI unit of electric current is",
           ["Volt", "Ampere", "Ohm", "Watt"], 1),
        _q("Railways", "Mathematics", "easy",
           "The LCM of 12 and 18 is",
           ["24", "30", "36", "72"], 2),
        _q("Railways", "Mathematics", "medium",
           "A train travels 60 km in 45 minutes. Its speed in km/h is",
           ["75", "80", "85", "90"], 1),
        _q("Railways", "Reasoning", "easy",
           "Find the next term: 2, 6, 12, 20, 30, ?",
           ["40", "42", "44", "46"], 1),
        _q("Railways", "Reasoning", "medium",
           "If A = 1, B = 2 ... Z = 26, then TRAIN =",
           ["57", "58", "59", "60"], 2),
        _q("Railways", "General Awareness", "medium",
           "The headquarters of the Southern Railway zone is at",
           ["Chennai", "Bengaluru", "Hyderabad", "Thiruvananthapuram"], 0),
        _q("Railways", "Mathematics", "hard",
           "A train 200 m long passes a platform of length 300 m in 25 seconds. Its speed in km/h is",
           ["60", "68", "72", "80"], 2),
    ]

    # ---------------- POLICE (SI / Constable — state police, CAPF) ----------------
    qs += [
        _q("Police", "General Knowledge", "easy",
           "The supreme commander of the Indian Armed Forces is",
           ["Prime Minister", "Defence Minister", "President of India", "Chief of Defence Staff"], 2),
        _q("Police", "General Knowledge", "medium",
           "The National Emergency in India can be declared under which article?",
           ["Article 352", "Article 356", "Article 360", "Article 368"], 0),
        _q("Police", "Reasoning", "easy",
           "Pointing to a photograph, Ravi said, \"She is the daughter of my grandfather's only son.\" How is she related to Ravi?",
           ["Cousin", "Niece", "Sister", "Aunt"], 2),
        _q("Police", "Reasoning", "medium",
           "Arrange in logical order: 1. Crime 2. Investigation 3. Arrest 4. Judgement 5. Punishment",
           ["1,2,3,4,5", "1,3,2,4,5", "1,2,4,3,5", "2,1,3,4,5"], 0),
        _q("Police", "Mathematics", "easy",
           "25% of 840 is",
           ["200", "210", "220", "230"], 1),
        _q("Police", "Mathematics", "medium",
           "A man covers 3 km in 30 minutes. What is his speed in m/s?",
           ["1.5", "1.67", "2.0", "2.5"], 1),
        _q("Police", "General Knowledge", "easy",
           "The motto of the Indian Police Service is",
           ["Satyameva Jayate", "Truth Alone Triumphs", "Service Before Self", "Service With Integrity"], 2),
        _q("Police", "Hindi/English", "easy",
           "Choose the correct synonym of 'Vigilant':",
           ["Careless", "Alert", "Sleepy", "Lazy"], 1),
        _q("Police", "Current Affairs", "medium",
           "The NDRF (National Disaster Response Force) works under which ministry?",
           ["Ministry of Defence", "Ministry of Home Affairs", "Ministry of Health", "Ministry of External Affairs"], 1),
        _q("Police", "Reasoning", "hard",
           "In a queue, Raj is 7th from the front and 11th from the back. How many people are in the queue?",
           ["17", "18", "19", "20"], 0),
    ]

    # ---------------- REET (Rajasthan Eligibility Exam for Teachers) ----------------
    qs += [
        _q("REET", "Child Development & Pedagogy", "easy",
           "Who proposed the theory of cognitive development in children?",
           ["Sigmund Freud", "Jean Piaget", "B.F. Skinner", "Erik Erikson"], 1),
        _q("REET", "Child Development & Pedagogy", "medium",
           "According to Vygotsky, the 'Zone of Proximal Development' refers to",
           ["Fixed IQ of a learner",
            "What a child can do with help vs. alone",
            "Emotional maturity of a child",
            "The maximum learning age"], 1),
        _q("REET", "Hindi Language", "easy",
           "'पुस्तक' शब्द का बहुवचन रूप है",
           ["पुस्तकें", "पुस्तक", "पुस्तकों", "पुस्तका"], 0),
        _q("REET", "English Language", "easy",
           "Choose the correct article: '___ honest man is respected.'",
           ["A", "An", "The", "No article"], 1),
        _q("REET", "Mathematics", "easy",
           "The smallest 3-digit number divisible by 5 is",
           ["100", "105", "110", "115"], 0),
        _q("REET", "Mathematics", "medium",
           "If the perimeter of a square is 48 cm, its area (in cm²) is",
           ["100", "121", "144", "169"], 2),
        _q("REET", "Environmental Studies", "easy",
           "The most widely spoken language in Rajasthan is",
           ["Marwari", "Hindi", "Punjabi", "Gujarati"], 1),
        _q("REET", "Environmental Studies", "medium",
           "Rajasthan's state bird is",
           ["Peacock", "Sparrow", "Great Indian Bustard (Godawan)", "Crow"], 2),
        _q("REET", "Child Development & Pedagogy", "medium",
           "Inclusive education primarily focuses on",
           ["Only gifted children",
            "Only special-needs children",
            "Teaching all children together regardless of ability",
            "Separating children by ability"], 2),
        _q("REET", "Hindi Language", "medium",
           "'अनपढ़' शब्द में उपसर्ग है",
           ["अन", "पढ़", "अनप", "ढ़"], 0),
    ]

    # mark a handful as daily
    # Simpler: pick 2 per exam as daily
    per_exam: dict[str, int] = {}
    for q in qs:
        per_exam.setdefault(q["exam"], 0)
        if per_exam[q["exam"]] < 2:
            q["is_daily"] = True
            per_exam[q["exam"]] += 1

    return qs


def build_seed_mock_tests(questions: list[dict]) -> list[dict]:
    tests: list[dict] = []
    now = datetime.now(timezone.utc).isoformat()
    for exam in ("SSC", "CAT", "GATE", "Railways", "Police", "REET"):
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
