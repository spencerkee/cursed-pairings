from collections import defaultdict
import networkx as nx
from node2vec import Node2Vec
from pprint import pprint
import random
import csv
import time


SMALL_TAG_CSV_FILENAME = "tags_1per.csv"
SMALL_WORK_CSV_FILENAME = "works_1per.csv"
LARGE_TAG_CSV_FILENAME = "tags-20210226.csv"
LARGE_WORK_CSV_FILENAME = "works-20210226.csv"
RESULTS_DIR = "results"
TEMP_DIR = "temp_folder"
DO_NOT_CARE_CHARACTERS = set(
    [
        "Everyone",
        "Male Original Character(s)",
        "Original Character",
        "Original Character(s)",
        "Original Character(s)",
        "Original Character(s)",
        "Original Characters",
        "Original Child Character(s)",
        "Original Female Character",
        "Original Female Character(s)",
        "Original Female Charcter(s)",
        "Original Female Human Character(s)",
        "Original Male Character",
        "Original Male Character(s)",
        "Original character(s)",
        "Other(s)",
        "Others",
        "Reader",
        "Undisclosed",
        "You",
    ]
)


def get_pairing(
    slash_pairing,
):
    if "/" in slash_pairing and "&" in slash_pairing:
        raise ValueError(f"Relationship tag contains both / and & {slash_pairing}")
    if "/" not in slash_pairing and "&" not in slash_pairing:
        raise ValueError(f"Relationship tag contains neither / or & {slash_pairing}")
    if slash_pairing.count("/") > 1 or slash_pairing.count("&") > 1:
        # Jack Harkness/Ianto Jones/Toshiko Sato
        raise ValueError(
            f"Relationship tag contains more than one / or & {slash_pairing}"
        )
    if "/" in slash_pairing:
        return [i.strip() for i in slash_pairing.split("/")]
    if "&" in slash_pairing:
        return [i.strip() for i in slash_pairing.split("&")]


def get_edge_attributes(G, name):
    # ...
    edges = G.edges(data=True)
    return edges


def print_pairings(pairings):
    for similiarity, node1, node2 in pairings:
        print(f"{similiarity:.4f} {node1} / {node2}")


def main(
    use_small_csv=True,
    num_workers=4,
    ship_separators=("/", "&"),
    accept_more_than_2=False,
    quiet=True,
):
    if use_small_csv:
        tag_filename = SMALL_TAG_CSV_FILENAME
        work_filename = SMALL_WORK_CSV_FILENAME
    else:
        tag_filename = LARGE_TAG_CSV_FILENAME
        work_filename = LARGE_WORK_CSV_FILENAME

    with open(tag_filename, "r") as f:
        reader = csv.DictReader(f)
        pairing_id_to_count = defaultdict(int)
        pairing_id_to_row = {}
        for ind, row in enumerate(reader):
            if row["type"] != "Relationship":
                continue
            canonical = row["canonical"]
            # TODO Handle redacted merging better
            # if row['name'] == 'Redacted' and canonical == 'false':
            #     pairing_id_to_count[row['merger_id']] += int(row['cached_count'])
            #     continue

            if int(row["cached_count"]) == 0:
                continue

            # print(row)
            if canonical == "true":
                pairing_id_to_row[row["id"]] = row
                pairing_id_to_count[row["id"]] += int(row["cached_count"])
            else:
                pairing_id_to_count[row["merger_id"]] += int(row["cached_count"])
            # if ind > 50:
            #     break

    G = nx.Graph()
    for pairing_id, count in pairing_id_to_count.items():
        if pairing_id not in pairing_id_to_row:
            continue
        relationship_name = pairing_id_to_row[pairing_id]["name"]
        try:
            characters = get_pairing(relationship_name)
        except ValueError as e:
            # Print
            # print(e)
            continue
        character1, character2 = characters
        if character1 in DO_NOT_CARE_CHARACTERS or character2 in DO_NOT_CARE_CHARACTERS:
            continue
        # TODO Characters can have the same name
        G.add_node(character1)
        G.add_node(character2)
        G.add_edge(character1, character2, weight=count)
    print(f"number_of_nodes={G.number_of_nodes()}")
    print(f"number_of_edges={G.number_of_edges()}")

    # Check for weight=0 edges
    print("0 weight edges: (if any)")
    var = get_edge_attributes(G, "weight")
    for edge in var:
        if edge[2]["weight"] == 0:
            print(edge)

    # Precompute probabilities and generate walks
    # dimensions=64, walk_length=5, num_walks=10 seems to yield good results. 15s node2vec, 122s embed
    # Doubling walk_length from 5 to 10 doesn't really affect the duration, if anything it reduced it to 13s?
    # Doubling num_walks to 20 didn't seem to either. The results seemed worse with more num_walks?
    # Like I don't recognize most of the top pairings, and the most cursed are mostly "Other(s), Original
    # Female Character, Undisclosed, Everyone" etc.
    # Defaults are walk_length=80 and num_walks=10, so let me try that.
    # Yeah that just increases the time to 25s. Sure. Embed duration is 175 now tho.
    start_time = time.time()
    node2vec = Node2Vec(
        G,
        dimensions=64,
        walk_length=20,
        num_walks=10,
        workers=num_workers,
        temp_folder=TEMP_DIR,
        quiet=quiet,
    )
    node2vec_time = time.time()
    print(f"node2vec duration={node2vec_time-start_time}")

    # Embed nodes
    model = node2vec.fit(window=10, min_count=1, batch_words=4)
    embed_time = time.time()
    print(f"embed duration={embed_time-node2vec_time}")

    # Retrieve the embeddings for all nodes
    embeddings = {node: model.wv[node] for node in G.nodes()}

    cosine_similarities = []
    for node1, node2 in G.edges:
        if node1 == node2:
            continue
        cosine_similarities.append((model.wv.similarity(node1, node2), node1, node2))
    cosine_similarities.sort(reverse=True)
    cosine_similarity_time = time.time()
    print(f"cosine similarity duration={cosine_similarity_time-embed_time}")

    print("Least cursed (unique) pairings (in terms of vector distance)")
    print_pairings(cosine_similarities[:10])
    print("Most cursed pairings (in terms of vector distance)")
    print_pairings(cosine_similarities[-9:])

    timestr = time.strftime("%Y-%m-%d_%H:%M:%S")
    # TODO Should do os.path.join or something
    # with open(f"{RESULTS_DIR}/{timestr}.csv", 'w') as f:

    output = []
    for similiarity, node1, node2 in cosine_similarities:
        output.append(
            {
                "cosine_similarity": f"{similiarity:.4f}",
                "node1": node1,
                "node2": node2,
                "relationship_count": G[node1][node2]["weight"],
                "node1_indegree": G.degree(node1),
                "node2_indegree": G.degree(node2),
            }
        )

    with open(f"{RESULTS_DIR}/{timestr}.csv", "w", newline="\n") as csvfile:
        fieldnames = [
            "cosine_similarity",
            "node1",
            "node2",
            "relationship_count",
            "node1_indegree",
            "node2_indegree",
        ]
        writer = csv.DictWriter(
            csvfile, delimiter=",", fieldnames=fieldnames, quoting=csv.QUOTE_ALL
        )
        writer.writeheader()
        writer.writerows(output)
    # TODO quoting=csv.QUOTE_ALL
    # 26 minutes for the full file
    # 19.5 min


if __name__ == "__main__":
    main(
        use_small_csv=False,
        num_workers=8,
        ship_separators=["/"],
        accept_more_than_2=False,
        quiet=True,
    )
