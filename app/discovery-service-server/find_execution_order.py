from collections import defaultdict

def topological_sort(graph):
    def dfs(node):
        nonlocal is_possible
        visited[node] = 1

        for neighbor in graph[node]:
            if visited[neighbor] == 0:
                dfs(neighbor)
            elif visited[neighbor] == 1:
                is_possible = False

        visited[node] = 2
        result.append(node)

    visited = defaultdict(int)
    result = []
    is_possible = True

    for node in list(graph.keys()):  # Use a copy of keys to avoid "dictionary changed size during iteration"
        if visited[node] == 0:
            dfs(node)

    if not is_possible:
        return None

    return result[::-1]

def find_execution_order(node_dict):
    graph = defaultdict(list)

    for node, node_info in node_dict.items():
        subscribed_to = node_info.get('subscribedTo', [])
        for subscribed_node in subscribed_to:
            graph[subscribed_node].append(node)

    execution_order = topological_sort(graph)
    if execution_order is None:
        return None
    #reverse the array and return
    return execution_order[::-1]


if __name__ == '__main__':
    # Example usage:
    node_dict = {
        'node1': {'subscribedTo': ['node2']},
        'node2': {'subscribedTo': ['node3', 'node4']},
        'node3': {'subscribedTo': ["node1"]},
        'node4': {'subscribedTo': []},
        'node5': {'subscribedTo': ['node2', "node1"]}
    }

    execution_order = find_execution_order(node_dict)

    if execution_order is None:
        print("Cyclic dependency found in the example dict. Execution order is not possible.")
    else:
        print("Execution order for the example dict:", execution_order)