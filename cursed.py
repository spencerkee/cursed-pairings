import networkx as nx
from node2vec import Node2Vec

# Generate a synthetic graph (you can replace this with your own graph)
G = nx.erdos_renyi_graph(n=100, p=0.1)

# Precompute probabilities and generate walks
node2vec = Node2Vec(G, dimensions=64, walk_length=30, num_walks=200, workers=4)

# Embed nodes
model = node2vec.fit(window=10, min_count=1, batch_words=4)

# Retrieve the embeddings for all nodes
embeddings = {node: model.wv[node] for node in G.nodes()}

# Example: Print the embedding for node 0
print("Embedding for Node 0:", embeddings[0])
