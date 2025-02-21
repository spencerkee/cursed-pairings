def get_pairing(slash_pairing):
    if '/' in slash_pairing and '&' in slash_pairing:
        raise ValueError(f'Relationship tag contains both / and & {slash_pairing}')
    if '/' not in slash_pairing and '&' not in slash_pairing:
        raise ValueError(f'Relationship tag contains neither / or & {slash_pairing}')
    if slash_pairing.count('/') > 1 or slash_pairing.count('&') > 1:
        # Jack Harkness/Ianto Jones/Toshiko Sato
        raise ValueError(f'Relationship tag contains more than one / or & {slash_pairing}')
    if '/' in slash_pairing:
        return [i.strip() for i in slash_pairing.split('/')]
    if '&' in slash_pairing:
        return [i.strip() for i in slash_pairing.split('&')]

from collections import defaultdict

with open('tags_1per.csv', "r") as f:
    reader = csv.DictReader(f)
    pairing_id_to_count = defaultdict(int)
    pairing_id_to_row = {}
    for ind, row in enumerate(reader):
        if row['type'] != 'Relationship':
            continue
        canonical = row['canonical']
        # TODO Handle redacted merging better
        # if row['name'] == 'Redacted' and canonical == 'false':
        #     pairing_id_to_count[row['merger_id']] += int(row['cached_count'])
        #     continue

        if int(row['cached_count']) == 0:
            continue

        # print(row)
        if canonical == 'true':
            pairing_id_to_row[row['id']] = row
            pairing_id_to_count[row['id']] += int(row['cached_count'])
        else:
            pairing_id_to_count[row['merger_id']] += int(row['cached_count'])
        # if ind > 50:
        #     break

import networkx as nx

G = nx.Graph()
for pairing_id, count in pairing_id_to_count.items():
    if pairing_id not in pairing_id_to_row:
        continue
    relationship_name = pairing_id_to_row[pairing_id]['name']
    try:
        characters = get_pairing(relationship_name)
    except ValueError as e:
        # Print
        # print(e)
        continue
    character1, character2 = characters
    # TODO Characters can have the same name
    G.add_node(character1)
    G.add_node(character2)
    G.add_edge(character1, character2, weight=count)
print(G.number_of_nodes())
print(G.number_of_edges())
# Print all edges which do not have a weight

def get_edge_attributes(G, name):
    # ...
    edges = G.edges(data=True)
    return edges

# Check for weight=0 edges
var = get_edge_attributes(G, 'weight')
for edge in var:
    if edge[2]['weight'] == 0:
        print(edge)

import networkx as nx
from node2vec import Node2Vec
import random

# print(G.edges)

# Generate a synthetic graph (you can replace this with your own graph)
# G = nx.erdos_renyi_graph(n=100, p=0.1)
# G = nx.fast_gnp_random_graph(n=100, p=0.5)
# for (u, v) in G.edges():
#     G.edges[u,v]['weight'] = random.randint(0,10)

# Precompute probabilities and generate walks
# 1:52 with dim=64, walk=10, num_walks=10, workers=4
node2vec = Node2Vec(G, dimensions=64, walk_length=10, num_walks=10, workers=4, quiet=False)

# Embed nodes
model = node2vec.fit(window=10, min_count=1, batch_words=4)

# Retrieve the embeddings for all nodes
embeddings = {node: model.wv[node] for node in G.nodes()}

cosine_similarities = []
for node1, node2 in G.edges:
    cosine_similarities.append((model.wv.similarity(node1, node2), node1, node2))
cosine_similarities.sort(reverse=True)
from pprint import pprint
print('Least cursed pairings (in terms of vector distance)')
pprint(cosine_similarities[:5])
print('Least cursed (unique) pairings (in terms of vector distance)')
pprint([i for i in cosine_similarities if i[1] != i[2]][:5])
print('Most cursed pairings (in terms of vector distance)')
pprint(cosine_similarities[-5:])