
async function generateTweets() {
    const brand = document.getElementById("brand").value;
    const industry = document.getElementById("industry").value;
    const objective = document.getElementById("objective").value;
    const details = document.getElementById("details").value;
    const result = document.getElementById("result");

    if (brand.trim() === "") {
        alert("Please enter a brand name");
        return;
    }

    result.textContent = "Generating tweets... Please wait.";

    try {
        const response = await fetch("/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector(
                    'meta[name="csrf-token"]'
                ).content
            },
            body: JSON.stringify({
                brand: brand,
                industry: industry,
                objective: objective,
                details: details
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong");
        }

        result.replaceChildren();

        const heading = document.createElement("h2");
        heading.textContent = "Generated Brand Voice & Tweets";
        result.appendChild(heading);

        const lines = (data.result || "").split("\n");

        lines.forEach(line => {
            const text = line.trim();

            if (!text || /^[-*_]{3,}$/.test(text)) {
                return;
            }

            if (/^#{1,3}\s/.test(text)) {
                const h3 = document.createElement("h3");
                h3.textContent = text.replace(/^#{1,3}\s*/, "");
                result.appendChild(h3);
                return;
            }

            if (/^\*\*(.*?)\*\*$/.test(text)) {
                const h3 = document.createElement("h3");
                h3.textContent = text.replace(/\*\*/g, "");
                result.appendChild(h3);
                return;
            }

            const tweet = text.match(/^\d+[.)]\s*(.*)/);

            if (tweet) {
                let list = result.querySelector("ol");

                if (!list) {
                    list = document.createElement("ol");
                    result.appendChild(list);
                }

                const item = document.createElement("li");
                item.textContent = tweet[1].replace(/\*\*/g, "");
                item.style.marginBottom = "12px";
                list.appendChild(item);
                return;
            }

            const paragraph = document.createElement("p");
            paragraph.textContent = text
                .replace(/\*\*/g, "")
                .replace(/^[-*]\s+/, "• ");
            result.appendChild(paragraph);
        });

    } catch (error) {
        result.textContent = "Error: " + error.message;
        console.error(error);
    }
}
