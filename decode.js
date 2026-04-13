document.getElementById("binUpload").addEventListener("change", handleUpload);

function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => decodeBin(new Uint8Array(reader.result));
    reader.readAsArrayBuffer(file);
}

function readInt(bytes, offset) {
    return bytes[offset] |
           (bytes[offset+1] << 8) |
           (bytes[offset+2] << 16) |
           (bytes[offset+3] << 24);
}

function readFloat(bytes, offset) {
    return new DataView(bytes.buffer).getFloat32(offset, true);
}

function decodeBin(bytes) {
    let offset = 0;

    // Magic header
    const magic = String.fromCharCode(
        bytes[offset], bytes[offset+1], bytes[offset+2], bytes[offset+3]
    );
    offset += 4;

    if (magic !== "SNBI") {
        alert("Invalid file format");
        return;
    }

    const version = readInt(bytes, offset); offset += 4;
    const objectCount = readInt(bytes, offset); offset += 4;

    const objects = [];

    for (let i = 0; i < objectCount; i++) {
        const prefabID = readInt(bytes, offset); offset += 4;

        const pos = {
            x: readFloat(bytes, offset), 
            y: readFloat(bytes, offset + 4),
            z: readFloat(bytes, offset + 8)
        };
        offset += 12;

        const rot = {
            x: readFloat(bytes, offset),
            y: readFloat(bytes, offset + 4),
            z: readFloat(bytes, offset + 8),
            w: readFloat(bytes, offset + 12)
        };
        offset += 16;

        const metaLen = readInt(bytes, offset); offset += 4;
        const metaBytes = bytes.slice(offset, offset + metaLen);
        offset += metaLen;

        const metadata = new TextDecoder().decode(metaBytes);

        objects.push({ prefabID, position: pos, rotation: rot, metadata });
    }

    const json = {
        header: { magic, version, objectCount },
        objects
    };

    console.log("Decoded JSON:", json);

    // Now place markers on the map
    placeMarkers(json.objects);
}


function placeMarkers(objects) {
    const map = document.getElementById("map");
    const container = document.getElementById("markers");

    container.innerHTML = ""; // clear old markers

    const worldWidth = 2000;
    const worldHeight = 2000;

    const pixelWidth = map.clientWidth;
    const pixelHeight = map.clientHeight;

    const scaleX = pixelWidth / worldWidth;
    const scaleY = pixelHeight / worldHeight;

    objects.forEach(obj => {
        const marker = document.createElement("div");
        marker.className = "marker";

        const px = (obj.position.x + worldWidth / 2) * scaleX;
        const py = (obj.position.z + worldHeight / 2) * scaleY;

        marker.style.left = px + "px";
        marker.style.top = py + "px";
        marker.title = obj.metadata;

        container.appendChild(marker);
    });
}