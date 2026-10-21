import chromadb
import logging

logging.basicConfig(level=logging.DEBUG)

client = chromadb.HttpClient(host="localhost", port=8000)
col = client.get_or_create_collection("test_debug_col")
print("Col id:", col.id)
col.add(ids=["1"], documents=["test doc"], embeddings=[[0.1]*768], metadatas=[{"category": "test"}])
res = col.query(query_embeddings=[[0.1]*768], n_results=1, include=["documents", "distances", "metadatas"])
client.delete_collection("test_debug_col")
