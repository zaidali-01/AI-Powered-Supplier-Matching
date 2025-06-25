from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import tempfile
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain_community.document_loaders import PyMuPDFLoader
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

embedding_model = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")
vectorstore = FAISS.load_local("faiss_index", embedding_model, allow_dangerous_deserialization=True)

kw_model = KeyBERT(SentenceTransformer("BAAI/bge-m3"))

@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    
    loader = PyMuPDFLoader(tmp_path)
    docs = loader.load()
    event_text = " ".join([doc.page_content for doc in docs])

    first_page_text = docs[0].page_content if docs else ""
    lines = [line.strip() for line in first_page_text.splitlines() if line.strip()]
    if lines:
        first_line = lines[0]
        event_name = first_line.split(":", 1)[1].strip() if ":" in first_line else first_line
    else:
        event_name = "UnknownEvent"

    event_keywords = [kw for kw, _ in kw_model.extract_keywords(event_text, top_n=10)]
    
    results = vectorstore.similarity_search_with_score(event_text, k=5)

    distances = [dist for _, dist in results]
    min_d, max_d = min(distances), max(distances)
    output = []

    for rank, (doc, distance) in enumerate(results):
        similarity = (max_d - distance) / (max_d - min_d + 1e-6)
        keyword_matches = sum(1 for kw in event_keywords if kw.lower() in doc.page_content.lower())
        keyword_score = keyword_matches / max(1, len(event_keywords))
        final_score = round(0.75 * float(similarity) + 0.25 * float(keyword_score), 4)

        output.append({
            "Rank": rank + 1,
            "SupplierName": doc.metadata.get("Supplier Name", "Unknown"),
            "MatchScore": final_score
        })

    return JSONResponse({
        "Event": event_name,
        "Matches": output
    })
