
"""==================== DEPENDENCIES ======================"""

import pandas as pd
from heapq import *
from math import sin, cos, sqrt, atan2, radians

"""=============== CONSTANT & GLOBAL VALUE ================"""

unreachable = unr = -1
astar_queue = []
path = {}
vertices = None
weight_matrix = None

debug_mode = True   # debug mode will display some information gathered

"""======================= FUNCTION ======================="""


def init_path(vertices, start_node):
    """ Initialize path dictionary with empty path and maximum cost """

    for vertex in vertices:
        path[vertex] = ("", 9999999)

    # Set starting node to have no cost
    path[start_node] = ("", 0)


def sphere_distance(point_a, point_b):
    """
    Return distance in meter
    :param point_a: starting point
    :type point_a: dict
    :param point_b: ending point
    :type point_b: dict
    :return: distance in meter
    :rtype: int
    """

    # approximate radius of earth in km
    earth_r = 6373.0

    lat1 = radians(float(point_a["lat"]))
    lon1 = radians(float(point_a["lng"]))
    lat2 = radians(float(point_b["lat"]))
    lon2 = radians(float(point_b["lng"]))

    dlon = lon2 - lon1
    dlat = lat2 - lat1

    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    distance = int(earth_r * c * 1000)

    return distance


def get_vertices(raw_data):

    vertices = []
    for item in raw_data:

        vertex_name = "V_" + "{:0>2}".format(int(item['label']))
        vertices.append(vertex_name)

    return vertices

def get_distance_matrix(raw_data):




def astar(start_node, end_node):
    """
    A* algorithm to find shortest path
    :param start_node: start point
    :type start_node: string
    :param end_node: end point
    :type end_node: string
    """

    def filter_weight(node):
        """ Get DF of possible node to visit """

        temp = weight_matrix[weight_matrix[node:node] != unreachable].dropna(how='all').dropna(axis='columns')
        return temp

    def cost_to_reach(node):
        """ Get cost needed to visit current node """

        path_string, path_cost = path[node]
        return path_cost

    def cost_between_node(node_a, node_b):
        """ Get cost between nodes according to weight matrix """

        return weight_matrix[node_b][node_a]

    def distance_to_end(node, end_node):
        """ Heuristic cost of 2 nodes (euclidean distance) """
        # delete after not use
        return 0

    current_node = start_node
    while current_node != end_node:

        # filter node that can't be reached
        possible_routes = filter_weight(current_node)

        # generate path to each reachable node
        for node in possible_routes:

            # calculate priority
            estimated_cost = cost_to_reach(current_node) + cost_between_node(current_node, node) + distance_to_end(node, end_node)

            if debug_mode:
                print(current_node, "->", node, "estimated cost:", estimated_cost)

            # Get prior-minimum cost and path to reach it
            path_string, path_cost = path[node]

            # If current estimated cost is better,
            if estimated_cost <= path_cost:

                # update the path
                path_string = path[current_node][0] + " -> " + str(current_node)
                path_cost = estimated_cost
                path[node] = (path_string, path_cost)

                # add to queue
                heappush(astar_queue, (estimated_cost, node))

                if debug_mode:
                    print("inserted into queue : ", (estimated_cost, node))

            # Cost is higher than previous generated path
            else:
                if debug_mode:
                    print("rejected because", path[node][0], "more eff with cost : ", path[node][1])

        try:

            # Get next node to check
            current_node = heappop(astar_queue)[1]

        except:
            print("no more element to pop, node unreachable")
            break

    # Finished searching
    route = path[end_node][0].split(" -> ")
    route = [x for x in route if x]
    route.append(end_node)
    final_cost = path[end_node][1]

    if debug_mode:
        print("\n===================== FINAL RESULT ==============")
        print("route:", route)
        print("cost:", final_cost)

    return route, final_cost


if __name__ == '__main__':

    """====================== SAMPLE DATA ======================"""

    vertices = ["nd 01", "nd 02", "nd 03", "nd 04", "nd 05", "nd 06", "nd 07", "nd 08"]
    adj_matrix = [[unr, unr, unr, unr, unr, 12, unr, 5],
                  [unr, unr, 6, unr, unr, 22, unr, 7],
                  [unr, 6, unr, 3, unr, unr, 16, unr],
                  [unr, unr, 3, unr, unr, 2, 17, unr],
                  [unr, unr, unr, unr, unr, unr, unr, unr],
                  [12, 22, unr, 2, unr, unr, unr, unr],
                  [unr, unr, 16, 17, unr, unr, unr, unr],
                  [5, 7, unr, unr, unr, unr, unr, unr],
                  ]

    weight_matrix = pd.DataFrame(adj_matrix, columns=vertices, index=vertices)

    if debug_mode:
        print(weight_matrix)
        print("\n\n")

    start_node = "nd 01"
    end_node = "nd 07"
    init_path(vertices, start_node)

    # testing astar
    shortest_path, cost = astar(start_node, end_node)
