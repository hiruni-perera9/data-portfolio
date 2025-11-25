import requests
import json

BASE_URL = "https://paleobiodb.org/data1.2"


def call_paleodb(endpoint, params):
    url = f"{BASE_URL}/{endpoint}.json"
    print(f"\nCalling: {url}")
    print(f"Params: {params}")
    resp = requests.get(url, params=params)
    print("Status code:", resp.status_code)
    resp.raise_for_status()
    data = resp.json()
    # Pretty print first part of response
    print(json.dumps(data, indent=2)[:1000])  # limit output
    return data


def test_taxa():
    params = {
        "name": "Tyrannosaurus",
        "rel": "all_children",
        "show": "attr,app,size,class"
    }
    data = call_paleodb("taxa/list", params)
    print("\nKeys in response:", list(data.keys()))
    print("Number of records:", len(data.get("records", [])))


def test_occurrences():
    params = {
        "base_name": "Tyrannosaurus",
        "show": "coords,loc,paleoloc,stratext",
        "limit": 5
    }
    data = call_paleodb("occs/list", params)
    print("\nKeys in response:", list(data.keys()))
    print("Number of records:", len(data.get("records", [])))


def test_interval():
    params = {
        "name": "Cretaceous"
    }
    data = call_paleodb("intervals/list", params)
    print("\nKeys in response:", list(data.keys()))
    print("Number of records:", len(data.get("records", [])))


if __name__ == "__main__":
    test_taxa()
    test_occurrences()
    test_interval()
