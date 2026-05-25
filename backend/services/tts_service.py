import io
import asyncio
import tempfile
import os
from typing import Optional
import numpy as np

# We load supertonic lazily so it doesn't block FastAPI startup until needed
_tts_engine = None

def get_tts_engine():
    global _tts_engine
    if _tts_engine is None:
        from supertonic import TTS
        _tts_engine = TTS(auto_download=True)
    return _tts_engine

def synthesize_audio_sync(text: str, voice_name: str = "M1") -> io.BytesIO:
    """Synchronous audio synthesis. Returns a BytesIO containing the WAV file."""
    tts = get_tts_engine()
    style = tts.get_voice_style(voice_name=voice_name)
    
    # Supertonic 3 returns (wav_array, something_else) or just wav_array
    result = tts.synthesize(text, voice_style=style)
    
    if isinstance(result, tuple):
        wav_array = result[0]
    else:
        wav_array = result

    # Supertonic save_audio requires a file path string
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        tts.save_audio(wav_array, tmp_path)
        with open(tmp_path, "rb") as f:
            buffer = io.BytesIO(f.read())
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    buffer.seek(0)
    return buffer

async def generate_tts_audio(text: str, voice_name: str = "M1") -> io.BytesIO:
    """Asynchronous wrapper around the TTS generation to avoid blocking the event loop."""
    return await asyncio.to_thread(synthesize_audio_sync, text, voice_name)
