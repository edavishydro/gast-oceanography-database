import json

with open("DocsJSON.json", "r") as json_file:
    data = json.load(json_file)

for doc in data:
    doc["FID"] = "GO{}".format(doc["FID"])
    print(doc["FID"])

with open("DocsJSON.json", "w") as json_file:
    json.dump(data, json_file, indent=4)
