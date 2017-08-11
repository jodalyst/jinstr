from random import randint
import json

def jsonUniquer(file):
	path = "static/json/{}.json".format(file)
	# Open Json
	with open(path, "r") as jsonFile:
	    data = json.load(jsonFile)

	# Function to generate new unique identifier
	def newUnique(n):
	    range_start = 10**(n-1)
	    range_end = (10**n)-1
	    return randint(range_start, range_end)

	# List to store existing unique values
	uniques = []

	# Open up modules portion of [FILE].json
	modules = data[1]['modules']
	for module in modules:
		for instance in module:
			for items in module[instance]:
				# Check if module already has unique identifer
				if 'unique' in items:
					# Appends existing identifier to uniques
					uniques.append(items['unique'])
				else:
					# Generates new unique identifier
					unique = newUnique(3)
					# Checks if identifier hasn't already been used
					if unique not in uniques:
						items['unique'] = unique

	# Write modified json file
	with open(path, "w") as jsonFile:
		json.dump(data, jsonFile)

jsonUniquer('test')