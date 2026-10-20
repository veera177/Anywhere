import chromadb_rust_bindings

if __name__ == "__main__":
    chromadb_rust_bindings.cli(["chroma", "run", "--path", "./chroma_data", "--port", "8000"])
