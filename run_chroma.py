import chromadb_rust_bindings

if __name__ == "__main__":
    # Match Spring's configured IPv4 loopback URL without exposing Chroma on
    # the machine's network interfaces.
    chromadb_rust_bindings.cli(["chroma", "run", "--host", "127.0.0.1", "--path", "./chroma_data", "--port", "8000"])
