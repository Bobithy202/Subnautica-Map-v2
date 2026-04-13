import struct
import json

def read_float(f):
    return struct.unpack("<f", f.read(4))[0]

def read_int(f):
    return struct.unpack("<i", f.read(4))[0]

def decode_bin_file(path):
    with open(path, "rb") as f:
        # --- HEADER ---
        magic = f.read(4).decode("ascii")
        if magic != "SNBI":
            raise ValueError("Invalid file format")

        version = read_int(f)
        object_count = read_int(f)

        objects = []

        for _ in range(object_count):
            obj = {}

            # prefab ID
            obj["prefabID"] = read_int(f)

            # position (3 floats)
            obj["position"] = {
                "x": read_float(f),
                "y": read_float(f),
                "z": read_float(f)
            }

            # rotation (4 floats)
            obj["rotation"] = {
                "x": read_float(f),
                "y": read_float(f),
                "z": read_float(f),
                "w": read_float(f)
            }

            # metadata
            meta_len = read_int(f)
            meta_bytes = f.read(meta_len)
            obj["metadata"] = meta_bytes.decode("ascii", errors="ignore")

            objects.append(obj)

    return {
        "header": {
            "magic": magic,
            "version": version,
            "objectCount": object_count
        },
        "objects": objects
    }


def save_json(data, out_path):
    with open(out_path, "w") as f:
        json.dump(data, f, indent=4)


# --- RUN DECODER ---
input_file = "mock.bin"
output_file = "info.json"

decoded = decode_bin_file(input_file)
save_json(decoded, output_file)

print("Decoded mock.bin → info.json")
