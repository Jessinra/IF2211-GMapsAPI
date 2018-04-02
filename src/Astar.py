"""==================== DEPENDENCIES ======================"""
import pandas as pd
from heapq import *
from math import sin, cos, sqrt, atan2, radians

"""=============== CONSTANT & GLOBAL VALUE ================"""

unreachable = unr = -1
astar_queue = []
path = {}
vertices = None
distance_mat = None
heuristic_mat = None

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


def get_vertices(raw_nodes_data):

	vertices = []
	for item in raw_nodes_data:

		vertex_name = "V_" + "{:0>2}".format(int(item['label']))
		vertices.append(vertex_name)

	return vertices


def get_distance_matrix(raw_edge_data, node_count):

	# initialize weight matrix with unreachable (-1)
	matrix = [[unr for _ in range(node_count)] for _ in range(node_count)]

	for edge in raw_edge_data:
		point_a = int(edge['v1']['label']) -1
		point_b = int(edge['v2']['label']) -1

		matrix[point_a][point_b] = int(edge['dist'])
		matrix[point_b][point_a] = int(edge['dist'])

	return matrix


def get_heuristic_distance_matrix(raw_nodes_data):

	node_count = len(raw_nodes_data)

	# initialize heuristic matrix with unreachable (-1)
	matrix = [[unr for _ in range(node_count)] for _ in range(node_count)]

	for i in range(0,node_count):
		for j in range(i, node_count):

			if i != j:

				point_a = raw_nodes_data[i]
				point_b = raw_nodes_data[j]

				distance = sphere_distance(point_a, point_b)

				idx_a = int(point_a['label']) -1
				idx_b = int(point_b['label']) -1

				matrix[idx_a][idx_b] = distance
				matrix[idx_b][idx_a] = distance

	return matrix


def get_start_end(raw_data):

	start = raw_data['From']
	end = raw_data['To']

	start = "V_" + "{:0>2}".format(int(start))
	end = "V_" + "{:0>2}".format(int(end))

	return start, end


def astar(start_node, end_node):
	"""
	A* algorithm to find shortest path
	:param start_node: start point
	:type start_node: string
	:param end_node: end point
	:type end_node: string
	"""

	global vertices, distance_mat, heuristic_mat, path, astar_queue

	def filter_weight(node):
		""" Get DF of possible node to visit """

		temp = distance_mat[distance_mat[node:node] != unreachable].dropna(how='all').dropna(axis='columns')
		return temp

	def cost_to_reach(node):
		""" Get cost needed to visit current node """

		path_string, path_cost = path[node]
		return path_cost

	def cost_between_node(node_a, node_b):
		""" Get cost between nodes according to weight matrix """

		return distance_mat[node_b][node_a]

	def distance_to_end(node_a, node_b):
		""" Heuristic cost of 2 nodes (euclidean distance) """

		return heuristic_mat[node_b][node_a]

	init_path(vertices, start_node)
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
				print("{} + {} + {} ".format(cost_to_reach(current_node) , cost_between_node(current_node, node) , distance_to_end(node, end_node)))

			# Get prior-minimum cost and path to reach it
			path_string, path_cost = path[node]

			# If current estimated cost is better,
			minimum_cost_to_node = cost_to_reach(current_node) + cost_between_node(current_node, node)
			if minimum_cost_to_node <= path_cost:

				# update the path
				path_string = path[current_node][0] + " -> " + str(current_node)
				path_cost = minimum_cost_to_node
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

			if debug_mode:
				print("\ncurrent node: ", current_node)

		except:
			print("no more element to pop, node unreachable")
			break

	# Finished searching
	route = path[end_node][0].split(" -> ")
	route = [x for x in route if x]
	route = [int(x[2:]) for x in route]
	end = int(end_node[2:])
	route.append(end)
	final_cost = int(path[end_node][1])

	if debug_mode:
		print("\n===================== FINAL RESULT ==============")
		print("route:", route)
		print("cost:", final_cost)

	return route, final_cost


def init_astar(raw_data):

	global vertices, distance_mat, heuristic_mat, path, astar_queue

	raw_nodes_data = raw_data['Nodes']
	raw_edge_data = raw_data['Edges']

	vertices = get_vertices(raw_nodes_data)

	distance_mat = get_distance_matrix(raw_edge_data, node_count=len(vertices))
	distance_mat = pd.DataFrame(distance_mat, columns=vertices, index=vertices)

	heuristic_mat = get_heuristic_distance_matrix(raw_nodes_data)
	heuristic_mat = pd.DataFrame(heuristic_mat, columns=vertices, index=vertices)

	if debug_mode:
		print("distance_mat")
		print(distance_mat)
		print("\n\n")

		print("heuristic_mat")
		print(heuristic_mat)
		print("\n\n")