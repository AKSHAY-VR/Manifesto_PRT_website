
let candidates = [];
let topics = [];
let topicColors = {};  // Object to store colors for each topic
let subtopicColors = {}; // Object to store colors for each subtopic

// Function to load Excel data from a Google Sheets URL
function loadExcelFromGoogleSheet(sheetUrl) {
    fetch(sheetUrl)
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            // Process the Excel data
            processExcelData(jsonData);
        })
        .catch(error => console.error('Error loading Excel file from Google Sheets:', error));
}

// Function to process Excel data and update candidates and topics
function processExcelData(data) {
    candidates = [];
    topics = new Set();  // Use a set to handle unique topics automatically

    data.forEach(row => {
        const candidateName = row.name;
        const image = row.image;
        const partySymbol = row.partySymbol;
        const title = row.title;
        const description = row.description;
        const page = row.page;
        const link = row.link;
        const topic = row.topic;
        const subtopic = row.subtopic || ''; // New subtopic column, default to empty string if not provided

        topics.add(topic); // Add topic to the set (duplicates are automatically handled)

        let candidate = candidates.find(c => c.name === candidateName);
        if (!candidate) {
            candidate = {
                name: candidateName,
                image: image,
                partySymbol: partySymbol,
                promises: {}
            };
            candidates.push(candidate);
        }

        // Initialize topic if it doesn't exist
        if (!candidate.promises[topic]) {
            candidate.promises[topic] = {};
        }

        // Initialize subtopic if it doesn't exist under the topic
        if (!candidate.promises[topic][subtopic]) {
            candidate.promises[topic][subtopic] = [];
        }

        // Add the promise under the appropriate subtopic
        candidate.promises[topic][subtopic].push({ title, description, page, link });
    });

    topics = Array.from(topics);

    // Assign colors to topics dynamically
    assignColorsToTopics(topics);
    assignColorsToSubtopics(); // Assign colors to subtopics dynamically

    // Create sections for each topic
    createSectionsForTopics(topics);

    // Update the UI with new candidates and topics
    populateCandidateCheckboxes(candidates);
    populateTopicCheckboxes(topics);
    updateDisplay();
}

// Function to create sections for each topic
function createSectionsForTopics(topics) {
    const contentContainer = d3.select("#content");
    contentContainer.html(''); // Clear existing content

    topics.forEach(topic => {
        const topicSection = contentContainer.append("div")
            .attr("id", `${topic.toLowerCase().replace(/\s+/g, '-')}-section`)
            .attr("class", "topic-section");

        topicSection.append("div")
            .attr("class", "section-title-container")
            .append("h2")
            .attr("class", "section-title")
            .text(topic);

        topicSection.append("div")
            .attr("class", "candidate-card-container")
            .attr("id", `${topic.toLowerCase().replace(/\s+/g, '-')}`);
    });
}

function populateCandidateCheckboxes(candidates) {
    const candidateCheckboxesContainer = d3.select("#candidate-checkboxes");
    candidateCheckboxesContainer.html(''); // Clear existing content

    // "All" option
    const allLabel = candidateCheckboxesContainer.append("label");
    allLabel.append("input")
        .attr("type", "checkbox")
        .attr("value", "all")
        .on("change", function() {
            const isChecked = this.checked;
            candidateCheckboxesContainer.selectAll("input").property("checked", isChecked);
            updateDisplay();
        });
    allLabel.append("span").text("All");
    allLabel.append("br");

    candidates.forEach(candidate => {
        const checkboxLabel = candidateCheckboxesContainer.append("label");
        checkboxLabel.append("input")
            .attr("type", "checkbox")
            .attr("value", candidate.name)
            .on("change", updateDisplay);
        checkboxLabel.append("span").text(candidate.name);
        checkboxLabel.append("br");
    });
}

function populateTopicCheckboxes(topics) {
    const topicCheckboxesContainer = d3.select("#topic-checkboxes");
    topicCheckboxesContainer.html(''); // Clear existing content

    // "All" option
    const allLabel = topicCheckboxesContainer.append("label");
    allLabel.append("input")
        .attr("type", "checkbox")
        .attr("value", "all")
        .on("change", function() {
            const isChecked = this.checked;
            topicCheckboxesContainer.selectAll("input").property("checked", isChecked);
            updateDisplay();
        });
    allLabel.append("span").text("All");
    allLabel.append("br");

    topics.forEach(topic => {
        const checkboxLabel = topicCheckboxesContainer.append("label");
        checkboxLabel.append("input")
            .attr("type", "checkbox")
            .attr("value", topic)
            .on("change", updateDisplay);
        checkboxLabel.append("span").text(topic);
        checkboxLabel.append("br");
    });
}

function updateDisplay() {
    const selectedCandidates = [];
    d3.selectAll("#candidate-checkboxes input:checked").each(function() {
        if (this.value !== "all") {
            selectedCandidates.push(this.value);
        }
    });

    const selectedTopics = [];
    d3.selectAll("#topic-checkboxes input:checked").each(function() {
        if (this.value !== "all") {
            selectedTopics.push(this.value);
        }
    });

    let filteredCandidates = candidates;

    if (selectedCandidates.length > 0) {
        filteredCandidates = filteredCandidates.filter(candidate => selectedCandidates.includes(candidate.name));
    }

    topics.forEach(topic => {
        const sectionId = `#${topic.toLowerCase().replace(/\s+/g, '-')}`;
        d3.select(sectionId).selectAll(".candidate-card").remove(); // Clear existing cards
    });

    filteredCandidates.forEach(candidate => {
        Object.keys(candidate.promises).forEach(topic => {
            if (selectedTopics.length === 0 || selectedTopics.includes(topic)) {
                createOrUpdateCandidateCard(`#${topic.toLowerCase().replace(/\s+/g, '-')}`, candidate, candidate.promises[topic], topic.toLowerCase().replace(/\s+/g, '-'));
            }
        });
    });

    topics.forEach(topic => {
        const sectionId = `#${topic.toLowerCase().replace(/\s+/g, '-')}-section`;
        if (d3.select(`#${topic.toLowerCase().replace(/\s+/g, '-')}`).selectAll(".candidate-card").empty()) {
            d3.select(sectionId).classed("hidden", true);
        } else {
            d3.select(sectionId).classed("hidden", false);
        }
    });
}

// Function to create or update candidate cards with promises grouped by subtopic
function createOrUpdateCandidateCard(containerId, candidate, promisesByTopic, topicClass) {
    const container = d3.select(containerId);

    // Create or select a single card for the candidate
    let candidateCard = container.select(`.candidate-card[data-candidate="${candidate.name}"]`);

    if (candidateCard.empty()) {
        candidateCard = container.append("div")
            .attr("class", `candidate-card ${topicClass}`)
            .attr("data-candidate", candidate.name);

        candidateCard.append("img")
            .attr("src", candidate.image)
            .attr("alt", candidate.name);

        candidateCard.append("div")
            .attr("class", "party-symbol")
            .append("img")
            .attr("src", candidate.partySymbol)
            .attr("alt", `${candidate.name} party symbol`);

        candidateCard.append("h3")
            .text(candidate.name);

        candidateCard.append("div")
            .attr("class", "promises-container");
    }

    // Add or update promises grouped by subtopic
    Object.keys(promisesByTopic).forEach(subtopic => {
        const subtopicPromises = promisesByTopic[subtopic];

        // Add each promise separately, even if they have the same subtopic
        subtopicPromises.forEach(promise => {
            const promiseContainer = candidateCard.select(".promises-container")
                .append("div")
                .attr("class", `promise-container ${topicClass}`)
                .style("background-color", getColorBySubtopic(subtopic)) // Set background color based on the subtopic
                .style("margin-bottom", "10px")
                .style("padding", "10px")
                .style("border-radius", "8px");

            promiseContainer.append("div")
                .attr("class", `promise ${topicClass}`)
                .html(`<p class="promise-title">${promise.title}</p><p class="promise-page">Page: ${promise.page}</p><p>${promise.description}</p>`);

            // Add the "Reference" button under each promise if there's a valid link
            if (promise.link && promise.link.trim() !== '') {
                promiseContainer.append("button")
                    .attr("class", "reference-button")
                    .text("Reference")
                    .on("click", () => {
                        window.open(promise.link, '_blank');
                    });
            }
        });
    });
}

// Function to assign colors to topics dynamically
function assignColorsToTopics(topics) {
    topics.forEach(topic => {
        if (!topicColors[topic]) {
            topicColors[topic] = generateRandomColor();
        }
    });
}

// Function to assign colors to subtopics dynamically
function assignColorsToSubtopics() {
    // Loop through each candidate and each topic to assign subtopic colors
    candidates.forEach(candidate => {
        Object.keys(candidate.promises).forEach(topic => {
            Object.keys(candidate.promises[topic]).forEach(subtopic => {
                if (!subtopicColors[subtopic] && subtopic !== '') {
                    subtopicColors[subtopic] = generateRandomColor();
                }
            });
        });
    });
}

// Function to get color by subtopic
function getColorBySubtopic(subtopic) {
    return subtopicColors[subtopic] || "#ffffff"; // Default to white if the subtopic doesn't have a specific color
}

let hueShift = 0; // Initialize hue shift

// Function to generate a unique lighter color using HSL
function generateRandomColor() {
    const saturation = 60; // Fixed saturation level for vibrancy
    const lightness = 80;  // Fixed lightness level for lighter colors

    hueShift += 137.5; // Golden angle approximation to distribute hues evenly
    const hue = hueShift % 360; // Ensure hue is within 0-360 degrees

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function toggleCheckboxes(id) {
    const checkboxes = document.getElementById(id);
    checkboxes.style.display = checkboxes.style.display === "block" ? "none" : "block";
}

// Load the Excel file from the Google Sheets URL
loadExcelFromGoogleSheet('https://docs.google.com/spreadsheets/d/1_q6IaRErhJnPM_pTwiI7pGvOTJ4PJJRMTaz4zr-rmio/export?format=xlsx'); // Replace with the actual Google Sheets URL in export format
