from supertonic import TTS
import time

print("Initializing TTS...")
start = time.time()
tts = TTS(auto_download=True)
print(f"Initialized in {time.time() - start:.2f}s")

style = tts.get_voice_style(voice_name="M1")

print("Generating audio...")
start = time.time()
text = "Hello! I am your AI interview coach. Let's get started."
result = tts.synthesize(text, voice_style=style)
print(f"Synthesize returned type: {type(result)}")
if isinstance(result, tuple):
    print(f"Tuple length: {len(result)}")
    for i, item in enumerate(result):
        print(f"Item {i} type: {type(item)}")
    wav = result[0]
else:
    wav = result

print(f"Generated in {time.time() - start:.2f}s")
tts.save_audio(wav, "test_output.wav")
print("Saved to test_output.wav")
