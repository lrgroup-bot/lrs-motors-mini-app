import argparse
import numpy as np
import soundfile as sf
import torch
from transformers import AutoTokenizer
from parler_tts import ParlerTTSForConditionalGeneration

p=argparse.ArgumentParser()
p.add_argument('--text',required=True)
p.add_argument('--out',required=True)
p.add_argument('--speaker',default='Debjani')
a=p.parse_args()
model_id='ai4bharat/indic-parler-tts'
device='cuda:0' if torch.cuda.is_available() else 'cpu'
model=ParlerTTSForConditionalGeneration.from_pretrained(model_id).to(device)
tok=AutoTokenizer.from_pretrained(model_id)
desc_tok=AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
description=f'{a.speaker} speaks in a warm, friendly, clear female Odia voice at a moderate pace. The recording is of very high quality with no background noise.'
desc=desc_tok(description,return_tensors='pt').to(device)
prompt=tok(a.text,return_tensors='pt').to(device)
with torch.inference_mode():
    generation=model.generate(input_ids=desc.input_ids,attention_mask=desc.attention_mask,prompt_input_ids=prompt.input_ids,prompt_attention_mask=prompt.attention_mask)
audio=generation.cpu().numpy().squeeze()
sf.write(a.out,audio,model.config.sampling_rate)
print(f'Odia female narration saved: {a.out}')
