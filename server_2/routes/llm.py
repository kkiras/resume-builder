import json
import os
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, status
from openai import OpenAI
from pydantic import BaseModel

router = APIRouter()

_client: Optional[OpenAI] = None


def _get_client() -> OpenAI:
    global _client
    if _client:
        return _client

    api_key = os.getenv("LLM_API_KEY")
    if not api_key:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Missing LLM_API_KEY")

    base_url = os.getenv("LLM_BASE_URL")
    _client = OpenAI(api_key=api_key, base_url=base_url) if base_url else OpenAI(api_key=api_key)
    return _client


def _extract_json(content: str) -> Dict[str, Any]:
    """Best-effort parse JSON, stripping markdown code fences if present."""
    text = content.strip()
    if text.startswith("```"):
        # Remove first fence line and closing fence
        parts = text.split("\n", 1)
        text = parts[1] if len(parts) > 1 else ""
        if text.endswith("```"):
            text = text.rsplit("```", 1)[0]
    return json.loads(text)


class TranslateRequest(BaseModel):
    resume: Dict[str, Any]
    targetLang: str = "Vietnamese"


ALLOWED_BASIC_FIELDS = {"title", "location", "employ"}


def _extract_translatable(resume: Dict[str, Any]) -> Dict[str, Any]:
    basics = resume.get("basics") or {}
    basics_filtered = {k: v for k, v in basics.items() if k in ALLOWED_BASIC_FIELDS}
    return {
        "sections": resume.get("sections") or [],
        "basics": basics_filtered,
    }


def _merge_translation(original: Dict[str, Any], translated: Dict[str, Any]) -> Dict[str, Any]:
    merged = {**original}
    if "sections" in translated:
        merged["sections"] = translated.get("sections", original.get("sections", []))
    if "basics" in translated:
        basics = dict(original.get("basics") or {})
        for key in ALLOWED_BASIC_FIELDS:
            if key in translated["basics"]:
                basics[key] = translated["basics"][key]
        merged["basics"] = basics
    return merged


@router.post("/translate")
async def translate_resume(body: TranslateRequest):
    """
    Translate resume content to the target language using the configured LLM.
    Returns a resume object with the same shape and IDs preserved, but text fields translated.
    """
    client = _get_client()
    model = os.getenv("LLM_MODEL", "cerebras-gpt-13b")

    translatable = _extract_translatable(body.resume)

    system_prompt = (
        "You are a professional CV translator. Translate all human-readable text fields in the resume to the "
        "target language while preserving formatting, IDs, and structure. Return only valid JSON with the same "
        "shape and field names as the input resume. Do not add explanations."
    )

    user_prompt = (
        f"Target language: {body.targetLang}\n"
        "Resume JSON:\n"
        f"{json.dumps(translatable, ensure_ascii=False)}"
    )

    print(user_prompt)

    try:
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
        )
        content = resp.choices[0].message.content
        print("LLM RAW CONTENT:", repr(content))
        translated_resume = _extract_json(content)
    except HTTPException:
        raise
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"LLM error: {exc}") from exc

    if not isinstance(translated_resume, dict):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Unexpected LLM response format")

    merged_resume = _merge_translation(body.resume, translated_resume)

    return {"resume": merged_resume}
