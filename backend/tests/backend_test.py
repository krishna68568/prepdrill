"""ExamAce backend regression tests.

Covers: auth, questions, daily, attempts, AI explain/similar, mock-tests lifecycle,
results, performance, doubt, admin endpoints.
"""
from __future__ import annotations

import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or (
    open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split("\n")[0].strip()
)
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

ADMIN = {"email": "admin@examace.com", "password": "admin123"}
STUDENT = {"email": "student@examace.com", "password": "student123"}


# ---------------- fixtures ----------------
@pytest.fixture(scope="session")
def s():
    return requests.Session()


def _login(s, creds):
    r = s.post(f"{API}/auth/login", json=creds, timeout=20)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "user" in data
    return data


@pytest.fixture(scope="session")
def admin_token(s):
    return _login(s, ADMIN)["token"]


@pytest.fixture(scope="session")
def student_token(s):
    return _login(s, STUDENT)["token"]


def H(tok):
    return {"Authorization": f"Bearer {tok}"}


# ---------------- health ----------------
def test_root_health(s):
    r = s.get(f"{API}/", timeout=10)
    assert r.status_code == 200
    assert "ExamAce" in r.json().get("message", "")


# ---------------- auth ----------------
def test_register_and_login_new_user(s):
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    r = s.post(f"{API}/auth/register", json={"name": "TEST User", "email": email, "password": "pass1234"}, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["user"]["email"] == email
    assert data["user"]["role"] == "user"
    assert len(data["token"]) > 10

    # duplicate email
    r2 = s.post(f"{API}/auth/register", json={"name": "x", "email": email, "password": "pass1234"}, timeout=20)
    assert r2.status_code == 400

    # login
    r3 = s.post(f"{API}/auth/login", json={"email": email, "password": "pass1234"}, timeout=20)
    assert r3.status_code == 200


def test_login_invalid(s):
    r = s.post(f"{API}/auth/login", json={"email": "nouser@x.com", "password": "nopass"}, timeout=20)
    assert r.status_code == 401


def test_me_and_logout(s, student_token):
    r = s.get(f"{API}/auth/me", headers=H(student_token), timeout=20)
    assert r.status_code == 200
    assert r.json()["email"] == STUDENT["email"]
    r2 = s.post(f"{API}/auth/logout", headers=H(student_token), timeout=20)
    assert r2.status_code == 200


def test_me_unauthenticated(s):
    r = s.get(f"{API}/auth/me", timeout=10)
    assert r.status_code in (401, 403)


# ---------------- questions ----------------
def test_daily_questions(s, student_token):
    r = s.get(f"{API}/questions/daily", headers=H(student_token), timeout=20)
    assert r.status_code == 200
    qs = r.json()
    assert isinstance(qs, list)
    assert len(qs) > 0, "daily questions should be seeded"
    q = qs[0]
    for k in ("id", "exam", "topic", "difficulty", "text", "options", "correct_index"):
        assert k in q
    assert len(q["options"]) == 4

    # with exam filter
    exam = q["exam"]
    r2 = s.get(f"{API}/questions/daily", headers=H(student_token), params={"exam": exam}, timeout=20)
    assert r2.status_code == 200
    assert all(x["exam"] == exam for x in r2.json())


def test_admin_list_questions_forbidden_for_student(s, student_token):
    r = s.get(f"{API}/questions", headers=H(student_token), timeout=20)
    assert r.status_code in (401, 403)


def test_admin_list_questions(s, admin_token):
    r = s.get(f"{API}/questions", headers=H(admin_token), timeout=20)
    assert r.status_code == 200
    assert len(r.json()) >= 30


# ---------------- attempts ----------------
def test_submit_attempt(s, student_token):
    r = s.get(f"{API}/questions/daily", headers=H(student_token), timeout=20)
    q = r.json()[0]
    # correct
    r2 = s.post(f"{API}/attempts", headers=H(student_token),
                json={"question_id": q["id"], "selected_index": q["correct_index"]}, timeout=20)
    assert r2.status_code == 200
    data = r2.json()
    assert data["is_correct"] is True
    assert data["question_id"] == q["id"]
    # wrong
    wrong_idx = (q["correct_index"] + 1) % 4
    r3 = s.post(f"{API}/attempts", headers=H(student_token),
                json={"question_id": q["id"], "selected_index": wrong_idx}, timeout=20)
    assert r3.status_code == 200
    assert r3.json()["is_correct"] is False


def test_attempt_invalid_question(s, student_token):
    r = s.post(f"{API}/attempts", headers=H(student_token),
               json={"question_id": "nonexistent", "selected_index": 0}, timeout=20)
    assert r.status_code == 404


# ---------------- AI endpoints (slow) ----------------
def test_explain_question(s, student_token):
    qs = s.get(f"{API}/questions/daily", headers=H(student_token), timeout=20).json()
    qid = qs[0]["id"]
    r = s.get(f"{API}/questions/{qid}/explain", headers=H(student_token), timeout=60)
    assert r.status_code == 200, r.text
    data = r.json()
    # AI returns keys explanation/trick/concept
    assert isinstance(data, dict)
    assert any(k in data for k in ("explanation", "trick", "concept"))


def test_similar_question(s, student_token):
    qs = s.get(f"{API}/questions/daily", headers=H(student_token), timeout=20).json()
    qid = qs[0]["id"]
    r = s.post(f"{API}/questions/{qid}/similar", headers=H(student_token), timeout=60)
    assert r.status_code == 200, r.text
    q = r.json()
    assert "id" in q and "options" in q and len(q["options"]) == 4
    assert "text" in q and isinstance(q["text"], str)


# ---------------- mock tests ----------------
def test_mock_tests_list(s, student_token):
    r = s.get(f"{API}/mock-tests", headers=H(student_token), timeout=20)
    assert r.status_code == 200
    mts = r.json()
    assert isinstance(mts, list) and len(mts) >= 1
    mt = mts[0]
    for k in ("id", "title", "exam", "question_ids", "duration_minutes", "total_marks"):
        assert k in mt


def test_mock_test_flow(s, student_token):
    mts = s.get(f"{API}/mock-tests", headers=H(student_token), timeout=20).json()
    mt = mts[0]
    # start
    r = s.get(f"{API}/mock-tests/{mt['id']}/start", headers=H(student_token), timeout=20)
    assert r.status_code == 200
    start = r.json()
    assert len(start["questions"]) >= 1
    # correct_index must NOT be in public questions
    for q in start["questions"]:
        assert "correct_index" not in q

    # submit — answer first half correctly using admin view for answers
    admin = _login(s, ADMIN)["token"]
    all_qs = {q["id"]: q for q in s.get(f"{API}/questions", headers=H(admin), timeout=20).json()}
    answers = {}
    for i, q in enumerate(start["questions"]):
        ans_q = all_qs.get(q["id"])
        if ans_q is None:
            continue
        if i % 2 == 0:
            answers[q["id"]] = ans_q["correct_index"]
        else:
            answers[q["id"]] = (ans_q["correct_index"] + 1) % 4

    r2 = s.post(f"{API}/mock-tests/{mt['id']}/submit", headers=H(student_token),
                json={"answers": answers, "time_taken_seconds": 120}, timeout=30)
    assert r2.status_code == 200, r2.text
    result = r2.json()
    assert result["total"] == len(start["questions"])
    assert result["correct"] + result["wrong"] + result["unattempted"] == result["total"]
    assert "topic_breakdown" in result and isinstance(result["topic_breakdown"], dict)
    assert "question_review" in result and len(result["question_review"]) == result["total"]
    assert 0 <= result["accuracy"] <= 100

    # results listing
    r3 = s.get(f"{API}/results/me", headers=H(student_token), timeout=20)
    assert r3.status_code == 200
    assert any(x["id"] == result["id"] for x in r3.json())

    # get by id
    r4 = s.get(f"{API}/results/{result['id']}", headers=H(student_token), timeout=20)
    assert r4.status_code == 200
    assert r4.json()["id"] == result["id"]


def test_start_nonexistent_mock(s, student_token):
    r = s.get(f"{API}/mock-tests/does-not-exist/start", headers=H(student_token), timeout=20)
    assert r.status_code == 404


# ---------------- performance ----------------
def test_performance_me(s, student_token):
    r = s.get(f"{API}/performance/me", headers=H(student_token), timeout=20)
    assert r.status_code == 200
    data = r.json()
    for k in ("total_attempts", "accuracy", "topics", "difficulty",
              "weak_topics", "strong_topics", "trend", "tests_taken"):
        assert k in data
    assert data["total_attempts"] > 0  # prior tests logged attempts


def test_performance_feedback(s, student_token):
    r = s.post(f"{API}/performance/feedback", headers=H(student_token), timeout=60)
    assert r.status_code == 200
    data = r.json()
    assert "feedback" in data and isinstance(data["feedback"], str) and len(data["feedback"]) > 0


# ---------------- doubt ----------------
def test_doubt_ask_and_history(s, student_token):
    r = s.post(f"{API}/doubt/ask", headers=H(student_token),
               json={"question": "What is the formula for simple interest?"}, timeout=60)
    assert r.status_code == 200
    data = r.json()
    assert "answer" in data and isinstance(data["answer"], str) and len(data["answer"]) > 0
    assert "session_id" in data

    r2 = s.get(f"{API}/doubt/history", headers=H(student_token), timeout=20)
    assert r2.status_code == 200
    assert isinstance(r2.json(), list) and len(r2.json()) >= 1


# ---------------- admin ----------------
def test_admin_users(s, admin_token, student_token):
    r = s.get(f"{API}/admin/users", headers=H(admin_token), timeout=20)
    assert r.status_code == 200
    users = r.json()
    assert any(u["email"] == STUDENT["email"] for u in users)
    # student forbidden
    r2 = s.get(f"{API}/admin/users", headers=H(student_token), timeout=20)
    assert r2.status_code in (401, 403)


def test_admin_stats(s, admin_token):
    r = s.get(f"{API}/admin/stats", headers=H(admin_token), timeout=20)
    assert r.status_code == 200
    data = r.json()
    for k in ("users", "questions", "mock_tests", "attempts", "test_results"):
        assert k in data and isinstance(data[k], int)
    assert data["questions"] >= 30


def test_admin_question_crud(s, admin_token):
    payload = {
        "exam": "SSC", "topic": "TEST_Topic", "difficulty": "easy",
        "text": "TEST_ 2+2=?",
        "options": ["3", "4", "5", "6"],
        "correct_index": 1, "is_daily": False,
    }
    r = s.post(f"{API}/questions", headers=H(admin_token), json=payload, timeout=20)
    assert r.status_code == 200, r.text
    qid = r.json()["id"]
    # update
    payload["text"] = "TEST_ 2+3=?"
    payload["options"] = ["3", "4", "5", "6"]
    payload["correct_index"] = 2
    r2 = s.put(f"{API}/questions/{qid}", headers=H(admin_token), json=payload, timeout=20)
    assert r2.status_code == 200
    assert r2.json()["correct_index"] == 2
    # delete
    r3 = s.delete(f"{API}/questions/{qid}", headers=H(admin_token), timeout=20)
    assert r3.status_code == 200


def test_admin_mocktest_crud(s, admin_token):
    qs = s.get(f"{API}/questions", headers=H(admin_token), timeout=20).json()
    qids = [q["id"] for q in qs[:3]]
    payload = {
        "title": "TEST_Mock", "exam": "SSC", "description": "desc",
        "question_ids": qids, "duration_minutes": 10,
    }
    r = s.post(f"{API}/mock-tests", headers=H(admin_token), json=payload, timeout=20)
    assert r.status_code == 200, r.text
    tid = r.json()["id"]
    assert r.json()["total_marks"] == 3

    payload["title"] = "TEST_Mock_Updated"
    payload["question_ids"] = qids[:2]
    r2 = s.put(f"{API}/mock-tests/{tid}", headers=H(admin_token), json=payload, timeout=20)
    assert r2.status_code == 200
    assert r2.json()["title"] == "TEST_Mock_Updated"
    assert r2.json()["total_marks"] == 2

    r3 = s.delete(f"{API}/mock-tests/{tid}", headers=H(admin_token), timeout=20)
    assert r3.status_code == 200
