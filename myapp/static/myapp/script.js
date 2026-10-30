
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

        let currentSection = "";
        let summaryList = null;
        let tweetList = null;

        lines.forEach(line => {
            const text = line.trim();

            if (!text || /^[-*_]{3,}$/.test(text)) {
                return;
            }

            if (/^Brand Voice Summary:?$/i.test(text)) {
                currentSection = "summary";

                const title = document.createElement("h3");
                title.textContent = "Brand Voice Summary:";
                result.appendChild(title);

                summaryList = document.createElement("ul");
                summaryList.className = "summary-list";
                result.appendChild(summaryList);
                return;
            }

            if (/^Tweets:?$/i.test(text)) {
                currentSection = "tweets";

                const title = document.createElement("h3");
                title.textContent = "Tweets:";
                result.appendChild(title);

                tweetList = document.createElement("ol");
                result.appendChild(tweetList);
                return;
            }

            const cleanText = text
                .replace(/\*\*/g, "")
                .replace(/^#{1,3}\s*/, "");

            if (currentSection === "summary") {
                const item = document.createElement("li");
                item.textContent = cleanText.replace(/^[•*-]\s*/, "");
                summaryList.appendChild(item);
                return;
            }

            if (currentSection === "tweets") {
                const tweet = cleanText.match(/^\d+[.)]\s*(.*)/);

                if (tweet) {
                    const item = document.createElement("li");
                    item.textContent = tweet[1];
                    tweetList.appendChild(item);
                }
            }
        });


    } 
    catch (error) {
        result.textContent = "Error: " + error.message;
        console.error(error);
    }
}
