import argparse
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = ROOT / "data" / "odia-test.wav"
DEFAULT_REF = ROOT / "data" / "voices" / "odia-male-reference.wav"
DEFAULT_REF_TEXT = ROOT / "data" / "voices" / "odia-male-reference.txt"
MODEL = os.getenv("LRS_ODIA_MODEL", "ai4bharat/IndicF5")
TEST_TEXT = "ଏଲ୍ ଆର୍ ଏସ୍ ମୋଟର୍ସକୁ ସ୍ୱାଗତ। ଆମ ପାଖରେ ଭଲ ଗାଡ଼ି ଉପଲବ୍ଧ ଅଛି। ଅଧିକ ସୂଚନା ପାଇଁ ଆମ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ।"


def generate(text: str, output: Path, ref_audio: Path, ref_text: str) -> None:
    if not ref_audio.exists():
        raise FileNotFoundError(f"Male Odia reference audio missing: {ref_audio}")
    if not ref_text.strip():
        raise ValueError("Reference transcript is empty.")
    import numpy as np
    import soundfile as sf
    from transformers import AutoModel
    print(f"Loading {MODEL} ...")
    model = AutoModel.from_pretrained(MODEL, trust_remote_code=True)
    print("Generating Odia narration using the configured male reference voice ...")
    audio = model(text, ref_audio_path=str(ref_audio), ref_text=ref_text)
    audio = np.asarray(audio)
    if audio.dtype == np.int16:
        audio = audio.astype(np.float32) / 32768.0
    else:
        audio = audio.astype(np.float32)
    output.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(output), audio, samplerate=24000)
    print(f"Odia audio ready: {output}")


def main() -> None:
    p = argparse.ArgumentParser(description="LRS Motors local Odia TTS adapter")
    p.add_argument("text", nargs="?", help="Odia text to synthesize")
    p.add_argument("output", nargs="?", help="Output WAV path")
    p.add_argument("--text", dest="text_opt")
    p.add_argument("--out", dest="out_opt")
    p.add_argument("--ref-audio", default=os.getenv("LRS_ODIA_REF_AUDIO", str(DEFAULT_REF)))
    p.add_argument("--ref-text", default=os.getenv("LRS_ODIA_REF_TEXT", ""))
    p.add_argument("--ref-text-file", default=os.getenv("LRS_ODIA_REF_TEXT_FILE", str(DEFAULT_REF_TEXT)))
    p.add_argument("--speaker", help="Compatibility option; IndicF5 uses the reference audio voice")
    p.add_argument("--test", action="store_true")
    a = p.parse_args()
    text = TEST_TEXT if a.test else (a.text_opt or a.text or "")
    output = DEFAULT_OUT if a.test else Path(a.out_opt or a.output or ROOT / "data" / "marketing-media" / "odia.wav")
    ref_text = a.ref_text
    ref_text_file = Path(a.ref_text_file)
    if not ref_text and ref_text_file.exists():
        ref_text = ref_text_file.read_text(encoding="utf-8").strip()
    if not text:
        p.error("Provide Odia text or use --test")
    try:
        generate(text, output, Path(a.ref_audio), ref_text)
    except Exception as e:
        print(f"Odia TTS failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
