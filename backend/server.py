"""ExamAce backend — AI-powered exam prep platform."""
from __future__ import annotations

from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# --- all other imports below ---
import os
import uuid
import logging
from datetime import datetime, timezone, date
from typing import List, Optional

from fastapi import FastAPI, APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_admin,
)
from ai import (
    generate_explanation,
    generate_similar_question,
    generate_performance_feedback,
    answer_doubt,
)
from seed_data import build_seed_questions, build_seed_mock_tests

# ---------- MongoDB ----------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# ---------- FastAPI ----------
app = FastAPI(title="ExamAce API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger("examace")


# =====================================================
# Pydantic models
# =====================================================
class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: EmailStr
    role: str
    created_at: str
    streak: int = 0


class AuthOut(BaseModel):
    token: str
    user: UserOut


class QuestionIn(BaseModel):
    exam: str
    topic: str
    difficulty: str  # easy | medium | hard
    text: str
    options: List[str] = Field(min_length=4, max_length=4)
    correct_index: int = Field(ge=0, le=3)
    is_daily: bool = False


class QuestionOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    exam: str
    topic: str
    difficulty: str
    text: str
    options: List[str]
    correct_index: int
    is_daily: bool = False
    created_at: str


class QuestionPublic(BaseModel):
    """Question without correct_index (for active test taking)."""
    model_config = ConfigDict(extra="ignore")
    id: str
    exam: str
    topic: str
    difficulty: str
    text: str
    options: List[str]


class AttemptIn(BaseModel):
    question_id: str
    selected_index: int = Field(ge=0, le=3)


class AttemptOut(BaseModel):
    id: str
    question_id: str
    selected_index: int
    correct_index: int
    is_correct: bool
    exam: str
    topic: str
    difficulty: str
    created_at: str


class MockTestIn(BaseModel):
    title: str
    exam: str
    description: str = ""
    question_ids: List[str]
    duration_minutes: int = Field(ge=1, le=300)


class MockTestOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    exam: str
    description: str
    question_ids: List[str]
    duration_minutes: int
    total_marks: int
    created_at: str


class MockTestStart(BaseModel):
    id: str
    title: str
    exam: str
    description: str
    duration_minutes: int
    questions: List[QuestionPublic]


class MockSubmission(BaseModel):
    answers: dict  # {question_id: selected_index}
    time_taken_seconds: int = 0


class TestResultOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    mock_test_id: str
    title: str
    exam: str
    score: int
    total: int
    accuracy: float
    correct: int
    wrong: int
    unattempted: int
    time_taken_seconds: int
    topic_breakdown: dict
    question_review: List[dict]
    created_at: str


class DoubtIn(BaseModel):
    question: str
    session_id: Optional[str] = None


# =====================================================
# Helpers
# =====================================================
def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _today_str() -> str:
    return date.today().isoformat()


def _strip_user(u: dict) -> dict:
    u = {k: v for k, v in u.items() if k != "password_hash" and k != "_id"}
    return u


async def _update_streak(user: dict) -> int:
    today = _today_str()
    last = user.get("last_active_date")
    streak = user.get("streak", 0)
    if last == today:
        return streak
    # if yesterday -> +1, else reset to 1
    yesterday = (date.today().toordinal() - 1)
    last_ord = date.fromisoformat(last).toordinal() if last else None
    streak = streak + 1 if last_ord == yesterday else 1
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"streak": streak, "last_active_date": today}},
    )
    return streak


# =====================================================
# Auth routes
# =====================================================
@api.post("/auth/register", response_model=AuthOut)
async def register(payload: RegisterIn):
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "role": "user",
        "created_at": _now_iso(),
        "streak": 0,
        "last_active_date": None,
    }
    await db.users.insert_one(doc)
    token = create_access_token(doc["id"], doc["email"], doc["role"])
    return AuthOut(token=token, user=UserOut(**_strip_user(doc)))


@api.post("/auth/login", response_model=AuthOut)
async def login(payload: LoginIn):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"], user["role"])
    return AuthOut(token=token, user=UserOut(**_strip_user(user)))


@api.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return UserOut(**user)


@api.post("/auth/logout")
async def logout(user: dict = Depends(get_current_user)):
    return {"ok": True}


# =====================================================
# Questions
# =====================================================
@api.get("/questions", response_model=List[QuestionOut])
async def list_questions(exam: Optional[str] = None, _: dict = Depends(require_admin)):
    q = {"exam": exam} if exam else {}
    docs = await db.questions.find(q, {"_id": 0}).to_list(2000)
    return [QuestionOut(**d) for d in docs]


@api.post("/questions", response_model=QuestionOut)
async def create_question(payload: QuestionIn, _: dict = Depends(require_admin)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = _now_iso()
    await db.questions.insert_one(doc)
    doc.pop("_id", None)
    return QuestionOut(**doc)


@api.put("/questions/{qid}", response_model=QuestionOut)
async def update_question(qid: str, payload: QuestionIn, _: dict = Depends(require_admin)):
    update = payload.model_dump()
    res = await db.questions.update_one({"id": qid}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "Question not found")
    doc = await db.questions.find_one({"id": qid}, {"_id": 0})
    return QuestionOut(**doc)


@api.delete("/questions/{qid}")
async def delete_question(qid: str, _: dict = Depends(require_admin)):
    res = await db.questions.delete_one({"id": qid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Question not found")
    return {"ok": True}


@api.get("/questions/daily", response_model=List[QuestionOut])
async def daily_questions(exam: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {"is_daily": True}
    if exam:
        query["exam"] = exam
    docs = await db.questions.find(query, {"_id": 0}).to_list(100)
    return [QuestionOut(**d) for d in docs]


@api.get("/questions/{qid}/explain")
async def explain_question(qid: str, user: dict = Depends(get_current_user)):
    q = await db.questions.find_one({"id": qid}, {"_id": 0})
    if not q:
        raise HTTPException(404, "Question not found")
    # cache the explanation on the question document to save LLM calls
    if q.get("ai_explanation"):
        return q["ai_explanation"]
    result = await generate_explanation(q)
    await db.questions.update_one({"id": qid}, {"$set": {"ai_explanation": result}})
    return result


@api.post("/questions/{qid}/similar", response_model=QuestionPublic)
async def similar_question(qid: str, user: dict = Depends(get_current_user)):
    q = await db.questions.find_one({"id": qid}, {"_id": 0})
    if not q:
        raise HTTPException(404, "Question not found")
    gen = await generate_similar_question(q)
    new_doc = {
        "id": str(uuid.uuid4()),
        "exam": q.get("exam", "General"),
        "topic": gen.get("topic", q.get("topic")),
        "difficulty": gen.get("difficulty", q.get("difficulty", "medium")),
        "text": gen.get("text", ""),
        "options": gen.get("options", q["options"]),
        "correct_index": int(gen.get("correct_index", 0)),
        "is_daily": False,
        "created_at": _now_iso(),
        "ai_generated": True,
    }
    await db.questions.insert_one(new_doc)
    return QuestionPublic(**new_doc)


# =====================================================
# Attempts (single question practice)
# =====================================================
@api.post("/attempts", response_model=AttemptOut)
async def submit_attempt(payload: AttemptIn, user: dict = Depends(get_current_user)):
    q = await db.questions.find_one({"id": payload.question_id}, {"_id": 0})
    if not q:
        raise HTTPException(404, "Question not found")
    is_correct = payload.selected_index == q["correct_index"]
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "question_id": q["id"],
        "selected_index": payload.selected_index,
        "correct_index": q["correct_index"],
        "is_correct": is_correct,
        "exam": q["exam"],
        "topic": q["topic"],
        "difficulty": q["difficulty"],
        "created_at": _now_iso(),
    }
    await db.attempts.insert_one(doc)
    await _update_streak(user)
    doc.pop("_id", None)
    return AttemptOut(**doc)


# =====================================================
# Mock tests
# =====================================================
@api.get("/mock-tests", response_model=List[MockTestOut])
async def list_mock_tests(exam: Optional[str] = None, user: dict = Depends(get_current_user)):
    q = {"exam": exam} if exam else {}
    docs = await db.mock_tests.find(q, {"_id": 0}).to_list(500)
    return [MockTestOut(**d) for d in docs]


@api.post("/mock-tests", response_model=MockTestOut)
async def create_mock_test(payload: MockTestIn, _: dict = Depends(require_admin)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = _now_iso()
    doc["total_marks"] = len(doc["question_ids"])
    await db.mock_tests.insert_one(doc)
    doc.pop("_id", None)
    return MockTestOut(**doc)


@api.put("/mock-tests/{tid}", response_model=MockTestOut)
async def update_mock_test(tid: str, payload: MockTestIn, _: dict = Depends(require_admin)):
    update = payload.model_dump()
    update["total_marks"] = len(update["question_ids"])
    res = await db.mock_tests.update_one({"id": tid}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "Mock test not found")
    doc = await db.mock_tests.find_one({"id": tid}, {"_id": 0})
    return MockTestOut(**doc)


@api.delete("/mock-tests/{tid}")
async def delete_mock_test(tid: str, _: dict = Depends(require_admin)):
    res = await db.mock_tests.delete_one({"id": tid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Mock test not found")
    return {"ok": True}


@api.get("/mock-tests/{tid}/start", response_model=MockTestStart)
async def start_mock_test(tid: str, user: dict = Depends(get_current_user)):
    mt = await db.mock_tests.find_one({"id": tid}, {"_id": 0})
    if not mt:
        raise HTTPException(404, "Mock test not found")
    qs = await db.questions.find({"id": {"$in": mt["question_ids"]}}, {"_id": 0}).to_list(1000)
    qs_by_id = {q["id"]: q for q in qs}
    ordered = [qs_by_id[qid] for qid in mt["question_ids"] if qid in qs_by_id]
    return MockTestStart(
        id=mt["id"],
        title=mt["title"],
        exam=mt["exam"],
        description=mt.get("description", ""),
        duration_minutes=mt["duration_minutes"],
        questions=[QuestionPublic(**q) for q in ordered],
    )


@api.post("/mock-tests/{tid}/submit", response_model=TestResultOut)
async def submit_mock_test(tid: str, sub: MockSubmission, user: dict = Depends(get_current_user)):
    mt = await db.mock_tests.find_one({"id": tid}, {"_id": 0})
    if not mt:
        raise HTTPException(404, "Mock test not found")
    qs = await db.questions.find({"id": {"$in": mt["question_ids"]}}, {"_id": 0}).to_list(1000)
    qs_by_id = {q["id"]: q for q in qs}

    correct = 0
    wrong = 0
    unattempted = 0
    topic_stats: dict[str, dict] = {}
    review: list[dict] = []

    for qid in mt["question_ids"]:
        q = qs_by_id.get(qid)
        if not q:
            continue
        sel = sub.answers.get(qid)
        topic = q["topic"]
        ts = topic_stats.setdefault(topic, {"total": 0, "correct": 0})
        ts["total"] += 1
        if sel is None or sel == -1 or sel == "":
            unattempted += 1
            review.append({
                "question_id": qid, "text": q["text"], "options": q["options"],
                "correct_index": q["correct_index"], "selected_index": None, "topic": topic,
                "is_correct": False, "unattempted": True,
            })
        else:
            sel_i = int(sel)
            is_correct = sel_i == q["correct_index"]
            if is_correct:
                correct += 1
                ts["correct"] += 1
            else:
                wrong += 1
            review.append({
                "question_id": qid, "text": q["text"], "options": q["options"],
                "correct_index": q["correct_index"], "selected_index": sel_i, "topic": topic,
                "is_correct": is_correct, "unattempted": False,
            })
            # also log to attempts collection for analytics
            await db.attempts.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": user["id"],
                "question_id": qid,
                "selected_index": sel_i,
                "correct_index": q["correct_index"],
                "is_correct": is_correct,
                "exam": q["exam"],
                "topic": topic,
                "difficulty": q["difficulty"],
                "mock_test_id": tid,
                "created_at": _now_iso(),
            })

    total = len(mt["question_ids"])
    accuracy = round((correct / total) * 100, 2) if total else 0.0
    topic_breakdown = {
        t: {"total": s["total"], "correct": s["correct"],
            "accuracy": round((s["correct"] / s["total"]) * 100, 2) if s["total"] else 0.0}
        for t, s in topic_stats.items()
    }

    result = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "mock_test_id": tid,
        "title": mt["title"],
        "exam": mt["exam"],
        "score": correct,
        "total": total,
        "accuracy": accuracy,
        "correct": correct,
        "wrong": wrong,
        "unattempted": unattempted,
        "time_taken_seconds": sub.time_taken_seconds,
        "topic_breakdown": topic_breakdown,
        "question_review": review,
        "created_at": _now_iso(),
    }
    await db.test_results.insert_one(result)
    await _update_streak(user)
    result.pop("_id", None)
    return TestResultOut(**result)


@api.get("/results/me", response_model=List[TestResultOut])
async def my_results(user: dict = Depends(get_current_user)):
    docs = await db.test_results.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return [TestResultOut(**d) for d in docs]


@api.get("/results/{rid}", response_model=TestResultOut)
async def get_result(rid: str, user: dict = Depends(get_current_user)):
    doc = await db.test_results.find_one({"id": rid, "user_id": user["id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Result not found")
    return TestResultOut(**doc)


# =====================================================
# Performance + AI feedback
# =====================================================
@api.get("/performance/me")
async def my_performance(user: dict = Depends(get_current_user)):
    attempts = await db.attempts.find({"user_id": user["id"]}, {"_id": 0}).to_list(5000)
    total = len(attempts)
    correct = sum(1 for a in attempts if a.get("is_correct"))
    accuracy = round((correct / total) * 100, 2) if total else 0.0

    topic_stats: dict[str, dict] = {}
    diff_stats: dict[str, dict] = {}
    for a in attempts:
        for key, d in ((a["topic"], topic_stats), (a["difficulty"], diff_stats)):
            s = d.setdefault(key, {"total": 0, "correct": 0})
            s["total"] += 1
            if a.get("is_correct"):
                s["correct"] += 1

    def to_list(d: dict) -> list[dict]:
        out = []
        for k, v in d.items():
            acc = round((v["correct"] / v["total"]) * 100, 2) if v["total"] else 0.0
            out.append({"name": k, "total": v["total"], "correct": v["correct"], "accuracy": acc})
        return sorted(out, key=lambda x: x["accuracy"])

    topics = to_list(topic_stats)
    difficulty = to_list(diff_stats)
    weak = [t for t in topics if t["accuracy"] < 60][:5]
    strong = [t for t in reversed(topics) if t["accuracy"] >= 70][:5]

    # results trend
    results = await db.test_results.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", 1).to_list(50)
    trend = [{"date": r["created_at"][:10], "accuracy": r["accuracy"], "title": r["title"]} for r in results]

    return {
        "total_attempts": total,
        "correct": correct,
        "accuracy": accuracy,
        "topics": topics,
        "difficulty": difficulty,
        "weak_topics": weak,
        "strong_topics": strong,
        "trend": trend,
        "tests_taken": len(results),
        "streak": user.get("streak", 0),
    }


@api.post("/performance/feedback")
async def performance_feedback(user: dict = Depends(get_current_user)):
    summary = await my_performance(user)
    if summary["total_attempts"] == 0:
        return {"feedback": "You haven't attempted any questions yet. Start with today's daily practice to unlock personalized feedback!"}
    text = await generate_performance_feedback(summary)
    return {"feedback": text, "summary": summary}


# =====================================================
# Doubts
# =====================================================
@api.post("/doubt/ask")
async def ask_doubt(payload: DoubtIn, user: dict = Depends(get_current_user)):
    session_id = payload.session_id or f"{user['id']}-doubts"
    answer = await answer_doubt(payload.question, session_id)
    msg_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "session_id": session_id,
        "question": payload.question,
        "answer": answer,
        "created_at": _now_iso(),
    }
    await db.doubts.insert_one(msg_doc)
    return {"session_id": session_id, "answer": answer}


@api.get("/doubt/history")
async def doubt_history(user: dict = Depends(get_current_user)):
    docs = await db.doubts.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return docs


# =====================================================
# Admin
# =====================================================
@api.get("/admin/users")
async def admin_users(_: dict = Depends(require_admin)):
    docs = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    # count attempts per user
    out = []
    for u in docs:
        n_attempts = await db.attempts.count_documents({"user_id": u["id"]})
        n_tests = await db.test_results.count_documents({"user_id": u["id"]})
        out.append({**u, "attempts": n_attempts, "tests": n_tests})
    return out


@api.get("/admin/stats")
async def admin_stats(_: dict = Depends(require_admin)):
    return {
        "users": await db.users.count_documents({}),
        "questions": await db.questions.count_documents({}),
        "mock_tests": await db.mock_tests.count_documents({}),
        "attempts": await db.attempts.count_documents({}),
        "test_results": await db.test_results.count_documents({}),
    }


# =====================================================
# Health
# =====================================================
@api.get("/")
async def root():
    return {"message": "ExamAce API is live"}


# =====================================================
# Startup: indexes, seeds
# =====================================================
@app.on_event("startup")
async def on_startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.questions.create_index("id", unique=True)
    await db.mock_tests.create_index("id", unique=True)
    await db.attempts.create_index("user_id")
    await db.test_results.create_index("user_id")
    await db.doubts.create_index("user_id")

    # Admin seed
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@examace.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Admin",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "created_at": _now_iso(),
            "streak": 0,
            "last_active_date": None,
        })
        log.info("Seeded admin %s", admin_email)
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}},
        )
        log.info("Updated admin password for %s", admin_email)

    # Seed demo student user (idempotent)
    demo_email = "student@examace.com"
    if not await db.users.find_one({"email": demo_email}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Demo Student",
            "email": demo_email,
            "password_hash": hash_password("student123"),
            "role": "user",
            "created_at": _now_iso(),
            "streak": 0,
            "last_active_date": None,
        })
        log.info("Seeded demo student %s", demo_email)

    # Seed questions + mock tests (per-exam idempotent: add any exam that has no questions yet)
    all_seed_questions = build_seed_questions()
    new_questions: list[dict] = []
    existing_exams = set(await db.questions.distinct("exam"))
    for q in all_seed_questions:
        if q["exam"] not in existing_exams:
            new_questions.append(q)
    if new_questions:
        await db.questions.insert_many(new_questions)
        log.info("Seeded %d questions for exams: %s",
                 len(new_questions), sorted({q["exam"] for q in new_questions}))

    # For any exam that now has questions but no mock test, create a seed mock test
    all_questions = await db.questions.find({}, {"_id": 0}).to_list(5000)
    existing_test_exams = set(await db.mock_tests.distinct("exam"))
    seed_mocks = build_seed_mock_tests(all_questions)
    new_mocks = [m for m in seed_mocks if m["exam"] not in existing_test_exams]
    if new_mocks:
        await db.mock_tests.insert_many(new_mocks)
        log.info("Seeded %d mock tests for exams: %s",
                 len(new_mocks), sorted({m["exam"] for m in new_mocks}))


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# ---------- wire up router + CORS ----------
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
