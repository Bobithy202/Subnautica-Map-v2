async function loadMarkers() {
    // Load JSON/info.json instead of info.json
    const response = await fetch("JSON/info.json");
    const data = await response.json();

    const container = document.getElementById("markers");
    const map = document.querySelector(".map");

    // Adjust these to match your map scale
    const worldWidth = 2000;
    const worldHeight = 2000;

    const pixelWidth = map.clientWidth;
    const pixelHeight = map.clientHeight;

    const scaleX = pixelWidth / worldWidth;
    const scaleY = pixelHeight / worldHeight;

    data.objects.forEach(obj => {
        const marker = document.createElement("div");
        marker.className = "marker";

        // Convert world coords → pixel coords
        const px = (obj.position.x + worldWidth / 2) * scaleX;
        const py = (obj.position.z + worldHeight / 2) * scaleY;

        marker.style.left = px + "px";
        marker.style.top = py + "px";

        marker.title = obj.metadata; // hover text

        container.appendChild(marker);
    });
}

window.onload = loadMarkers;
