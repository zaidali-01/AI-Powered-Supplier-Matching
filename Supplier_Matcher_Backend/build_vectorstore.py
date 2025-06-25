import pandas as pd
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
#from langchain.docstore.document import Document

df = pd.read_excel("data/SupplierList.xlsx")
df = df.fillna("Unknown")

def create_supplier_text(row):
    return (
        f"Supplier Name: {row['Supplier Name']}. "
        f"Category: {row['Category']}. "
        f"Type: {row['Type']}. "
        f"Capabilities: {row['Capability']}. "
        f"Business Units: {row['Business Units']}. "
        f"Address: {row['Address']}. "
        f"Reference Customers: {row['Reference Customers']}. "
        f"NACE Code: {row['NACE CODE']}. "
        f"Organization: {row['Organization']}. "
        f"Description: {row['Description']}."
    )

df['supplier_text'] = df.apply(create_supplier_text, axis=1)
supplier_texts = df['supplier_text'].tolist()
supplier_metadatas = [{"Supplier Name": name} for name in df["Supplier Name"]]

embedding_model = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")
vectorstore = FAISS.from_texts(supplier_texts, embedding=embedding_model, metadatas=supplier_metadatas)

vectorstore.save_local("faiss_index")

print("✅ Vectorstore saved to 'faiss_index/'")