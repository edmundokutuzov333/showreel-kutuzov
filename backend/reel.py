import asyncio
import hashlib
import os
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from emergentintegrations.llm.openai import OpenAITextToSpeech

CACHE_DIR = Path(__file__).parent / "vo_cache"
CACHE_DIR.mkdir(exist_ok=True)

VOICE = "onyx"
MODEL = "tts-1-hd"
SPEED = 0.92

TIMES = [4.6, 7.2, 9.2, 14.0, 21.6, 29.6, 37.4, 41.6, 45.4, 52.8, 56.0]

NARRATION = {
    "en": [
        "Most work asks for attention.",
        "Mine takes it.",
        "Built in Maputo. Made for the world.",
        "Social media... image... design... campaigns... motion.",
        "Ideas that stop you. Stay in memory. And make you act.",
        "Brand systems for the names you know.",
        "A hundred and fifty projects. Thirty brands. One obsession:",
        "work that refuses to be ignored.",
        "Clarity. Rhythm. Precision. Memory.",
        "I'm Edmundo Kutuzov.",
        "Just a creative guy.",
    ],
    "pt": [
        "A maioria do trabalho pede atenção.",
        "O meu conquista-a.",
        "Feito em Maputo. Pensado para o mundo.",
        "Redes sociais... imagem... design... campanhas... motion.",
        "Ideias que fazem parar. Ficam na memória. E fazem agir.",
        "Sistemas de marca para os nomes que conhece.",
        "Cento e cinquenta projetos. Trinta marcas. Uma obsessão:",
        "trabalho que se recusa a ser ignorado.",
        "Clareza. Ritmo. Precisão. Memória.",
        "Eu sou Edmundo Kutuzov.",
        "Just a creative guy.",
    ],
}

router = APIRouter(prefix="/reel")
_locks: dict[str, asyncio.Lock] = {}


def _cache_path(lang: str, idx: int) -> Path:
    text = NARRATION[lang][idx]
    digest = hashlib.sha1(f"{MODEL}|{VOICE}|{SPEED}|{text}".encode()).hexdigest()[:10]
    return CACHE_DIR / f"{lang}_{idx}_{digest}.mp3"


async def _ensure_audio(lang: str, idx: int) -> Path:
    path = _cache_path(lang, idx)
    if path.exists():
        return path
    lock = _locks.setdefault(path.name, asyncio.Lock())
    async with lock:
        if not path.exists():
            tts = OpenAITextToSpeech(api_key=os.environ["EMERGENT_LLM_KEY"])
            audio = await tts.generate_speech(
                text=NARRATION[lang][idx], model=MODEL, voice=VOICE, speed=SPEED
            )
            path.write_bytes(audio)
    return path


@router.get("/narration")
async def narration(lang: str = "en"):
    if lang not in NARRATION:
        raise HTTPException(404, "Unknown language")
    lines = [
        {"i": i, "t": TIMES[i], "text": text, "url": f"/api/reel/vo/{lang}/{i}.mp3"}
        for i, text in enumerate(NARRATION[lang])
    ]
    return {"lang": lang, "voice": VOICE, "model": MODEL, "lines": lines}


@router.get("/vo/{lang}/{idx}.mp3")
async def vo_file(lang: str, idx: int):
    if lang not in NARRATION or not 0 <= idx < len(NARRATION[lang]):
        raise HTTPException(404, "Unknown narration line")
    try:
        path = await _ensure_audio(lang, idx)
    except Exception as exc:
        raise HTTPException(502, f"Voice generation failed: {exc}")
    return FileResponse(path, media_type="audio/mpeg", headers={"Cache-Control": "public, max-age=86400"})

