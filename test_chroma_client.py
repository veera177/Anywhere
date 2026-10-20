import chromadb

client = chromadb.HttpClient(host="localhost", port=8000)
print("Chroma heartbeat:", client.heartbeat())

col = client.get_or_create_collection("anywhere_knowledge")
print("Collection created:", col.name, "count:", col.count())

col.add(
    ids=["test-1"],
    embeddings=[[0.01] * 768],
    documents=["This is a test document about refund policy."],
    metadatas=[{"category": "ORDERS", "source": "Refund policy"}]
)
print("Item added. Count:", col.count())

results = col.query(
    query_embeddings=[[0.01] * 768],
    n_results=1,
    include=["documents", "distances", "metadatas"]
)
print("Query results:", results)

client.delete_collection("anywhere_knowledge")
print("Collection deleted successfully!")
