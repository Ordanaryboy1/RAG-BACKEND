# import sys
# from PyPDF2 import PdfReader

# pdf_path = sys.argv[1]

# reader = PdfReader(pdf_path)

# text = ""
# for page in reader.pages:
#     text += page.extract_text() or ""

# print(text)


import sys
from PyPDF2 import PdfReader

pdf_path = sys.argv[1]

reader = PdfReader(pdf_path)

text = ""
for page in reader.pages:
    text += page.extract_text() or ""

# ⭐ Windows Unicode FIX (IMPORTANT)
sys.stdout.buffer.write(text.encode("utf-8"))