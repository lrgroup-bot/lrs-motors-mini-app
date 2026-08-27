import argparse
import os
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = ROOT / "data" / "odia-test.wav"
MODEL = os.getenv("LRS_ODIA_MODEL", "ai4bharat/indic-parler-tts")
SPEAKER = os.getenv("LRS_ODIA_SPEAKER", "Debjani")
TEST_TEXT = "ଏଲ୍ ଆର୍ ଏସ୍ ମୋଟର୍ସକୁ ସ୍ୱାଗତ। ଆମ ପାଖରେ ଭଲ ଗାଡ଼ି ଉପଲବ୍ଧ ଅଛି। ଅଧିକ ସୂଚନା ପାଇଁ ଆମ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ।"


def generate(text: str, output: Path) -> None:
    import torch
    import soundfile as sf
    from parler_tts import ParlerTTSForConditionalGeneration
    from transformers import AutoTokenizer

    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device.startswith("cuda") else torch.float32
    print(f"Loading {MODEL} on {device} ...")
    model = ParlerTTSForConditionalGeneration.from_pretrained(MODEL).to(device=device, dtype=dtype)
    tokenizer = AutoTokenizer.from_pretrained(MODEL)
    description_tokenizer = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
    description = f"{SPEAKER}'s voice is clear, warm and professional. The speaker talks at a moderate pace in Odia with clean studio audio and very little background noise."
    desc = description_tokenizer(description, return_tensors="pt").to(device)
    prompt = tokenizer(text, return_tensors="pt").to(device)
    with torch.inference_mode():
        audio = model.generate(input_ids=desc.input_ids, attention_mask=desc.attention_mask, prompt_input_ids=prompt.input_ids, prompt_attention_mask=prompt.attention_mask)
    audio = audio.cpu().float().numpy().squeeze()
    output.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(output), audio, model.config.sampling_rate)
    print(f"Odia audio ready: {output}")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("text", nargs="?", help="Odia text to synthesize")
    p.add_argument("output", nargs="?", help="Output WAV path")
    p.add_argument("--test", action="store_true")
    a = p.parse_args()
    text = TEST_TEXT if a.test else (a.text or "")
    output = DEFAULT_OUT if a.test else Path(a.output or ROOT / "data" / "marketing-media" / "odia.wav")
    if not text:
        p.error("Provide Odia text or use --test")
    try:
        generate(text, output)
    except Exception as e:
        print(f"Odia TTS failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
