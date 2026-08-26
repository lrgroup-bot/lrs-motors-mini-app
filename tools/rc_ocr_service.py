"""Optional local PaddleOCR service for LRS Motors RC extraction.
Run: pip install -r tools/requirements-ocr.txt
Then: python tools/rc_ocr_service.py
"""
import os
from flask import Flask, request, jsonify
from paddleocr import PaddleOCR

app = Flask(__name__)
ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)

def normalize(result):
    lines=[]
    for page in result or []:
        for row in page or []:
            try:
                box, rec = row
                text, score = rec
                xs=[p[0] for p in box]; ys=[p[1] for p in box]
                lines.append({"text":str(text),"confidence":float(score),"x":min(xs),"y":min(ys)})
            except Exception:
                continue
    lines.sort(key=lambda x:(round(x["y"]/12),x["x"]))
    return lines

@app.get("/health")
def health(): return jsonify({"ok":True,"engine":"paddleocr"})

@app.post("/extract")
def extract():
    f=request.files.get("file")
    if not f: return jsonify({"error":"file required"}),400
    data=f.read()
    if len(data)>20*1024*1024: return jsonify({"error":"file exceeds 20 MB"}),413
    import tempfile
    suffix=os.path.splitext(f.filename or "rc.jpg")[1] or ".jpg"
    with tempfile.NamedTemporaryFile(delete=False,suffix=suffix) as tmp:
        tmp.write(data); path=tmp.name
    try:
        result=ocr.ocr(path,cls=True)
        lines=normalize(result)
        text="\n".join(x["text"] for x in lines)
        return jsonify({"text":text,"lines":lines,"engine":"paddleocr"})
    finally:
        try: os.unlink(path)
        except OSError: pass

if __name__=="__main__":
    app.run(host="127.0.0.1",port=int(os.getenv("LRS_OCR_PORT","8765")))
