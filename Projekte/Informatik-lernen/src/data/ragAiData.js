export const RAG_STEPS = [
  {
    id: 'chunking',
    title: '1. Document Chunking & Text Splitting',
    desc: 'Lange Dokumente werden in kleinere Sinneinheiten (z.B. 512 Tokens) mit Overlap aufgeteilt.',
    codeExample: `const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});
const docs = await textSplitter.createDocuments([largePDFText]);`
  },
  {
    id: 'vector_db',
    title: '2. Vector Embeddings & Vector DB Search',
    desc: 'Wandle Text in hochdimensionale Vektoren um und finde ähnliche Chunks mit Cosine Similarity in ChromaDB.',
    codeExample: `// ChromaDB / Pinecone Vector Store Query
const vectorStore = await Chroma.fromDocuments(docs, new OpenAIEmbeddings());
const results = await vectorStore.similaritySearch("Was ist Subnetting?", 3);`
  }
];
