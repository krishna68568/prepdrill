"""LLM helpers using Emergent Universal Key (gpt-4o-mini)."""
from __future__ import annotations

import os
import uuid
import json
import logging
from typing import Optional

from emergentintegrations.llm.chat import LlmChat, UserMessage

log = logging.getLogger(__name__)

MODEL_PROVIDER = "openai"
MODEL_NAME = "gpt-4o-mini"


def _llm_key() -> str:
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        raise RuntimeError("EMERGENT_LLM_KEY is not configured")
    return key


def _new_chat(system_message: str, session_id: Optional[str] = None) -> LlmChat:
    return LlmChat(
        api_key=_llm_key(),
        session_id=session_id or str(uuid.uuid4()),
        system_message=system_message,
    ).with_model(MODEL_PROVIDER, MODEL_NAME)


async def generate_explanation(question: dict) -> dict:
    """Return {'explanation': str, 'trick': str, 'concept': str}."""
    system = (
        "You are ExamAce, an expert coach for Indian competitive exams (SSC, CAT, GATE). "
        "Given an MCQ, respond ONLY with compact JSON: "
        '{"explanation": "step by step reasoning (3-6 short steps, markdown bullet or numbered list)",'
        ' "trick": "a one-line shortcut or mnemonic (or empty string if none)",'
        ' "concept": "a 2-3 sentence concept summary"}'
    )
    prompt = (
        f"Exam: {question.get('exam', 'General')}\n"
        f"Topic: {question.get('topic', 'General')}\n"
        f"Difficulty: {question.get('difficulty', 'medium')}\n"
        f"Question: {question['text']}\n"
        f"Options:\n"
        + "\n".join(f"{chr(65 + i)}. {opt}" for i, opt in enumerate(question["options"]))
        + f"\nCorrect Answer: {chr(65 + question['correct_index'])}. {question['options'][question['correct_index']]}\n"
        "Reply with JSON only, no code fences."
    )
    chat = _new_chat(system)
    raw = await chat.send_message(UserMessage(text=prompt))
    return _parse_json_or_fallback(raw, fallback_keys=["explanation", "trick", "concept"])


async def generate_similar_question(question: dict) -> dict:
    system = (
        "You are an exam question author for SSC/CAT/GATE. Create ONE new MCQ similar to the given one. "
        "Respond ONLY with compact JSON: "
        '{"text": "...", "options": ["A","B","C","D"], "correct_index": 0, "topic": "...", "difficulty": "easy|medium|hard"}'
    )
    prompt = (
        f"Source question (create a similar but NEW question on the same concept):\n"
        f"Exam: {question.get('exam', 'General')}\n"
        f"Topic: {question.get('topic', 'General')}\n"
        f"Difficulty: {question.get('difficulty', 'medium')}\n"
        f"Q: {question['text']}\n"
        f"Options: {question['options']}\n"
        f"Correct: {question['correct_index']}\n"
        "Reply JSON only."
    )
    chat = _new_chat(system)
    raw = await chat.send_message(UserMessage(text=prompt))
    parsed = _parse_json_or_fallback(raw, fallback_keys=["text", "options", "correct_index", "topic", "difficulty"])
    # sanity clamp
    if not isinstance(parsed.get("options"), list) or len(parsed["options"]) != 4:
        parsed["options"] = question["options"]
        parsed["correct_index"] = question["correct_index"]
    try:
        parsed["correct_index"] = int(parsed.get("correct_index", 0)) % 4
    except Exception:
        parsed["correct_index"] = 0
    parsed.setdefault("topic", question.get("topic", "General"))
    parsed.setdefault("difficulty", question.get("difficulty", "medium"))
    return parsed


async def generate_performance_feedback(summary: dict) -> str:
    system = (
        "You are ExamAce, a friendly Indian exam mentor. Given a student's performance summary, "
        "write 3-5 short paragraphs of personalized, actionable feedback in English "
        "(you may sprinkle 1-2 Hindi words in Devanagari like 'कमज़ोर', 'मज़बूत' for tone). "
        "Highlight weak topics, strong topics, and give a concrete daily plan. Keep it motivating and concise."
    )
    prompt = f"Performance JSON:\n{json.dumps(summary, indent=2)}\n\nWrite the feedback as markdown."
    chat = _new_chat(system)
    return await chat.send_message(UserMessage(text=prompt))


async def answer_doubt(question_text: str, session_id: str) -> str:
    system = (
        "You are ExamAce, a patient tutor helping Indian students with SSC/CAT/GATE doubts. "
        "Explain clearly with short paragraphs, steps, and a final takeaway. Use markdown."
    )
    chat = _new_chat(system, session_id=session_id)
    return await chat.send_message(UserMessage(text=question_text))


def _parse_json_or_fallback(raw: str, fallback_keys: list[str]) -> dict:
    text = (raw or "").strip()
    # strip markdown code fences if present
    if text.startswith("```"):
        text = text.strip("`")
        # after stripping backticks a leading language label may remain
        if text.lower().startswith("json"):
            text = text[4:]
        text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        log.warning("LLM JSON parse failed; returning raw under 'explanation'. raw=%s", raw[:200])
        return {k: "" for k in fallback_keys} | {fallback_keys[0]: raw}
