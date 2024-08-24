// let candidates = [];
// let topics = [];
// let topicColors = {};  // Object to store colors for each topic

// function loadExcelFromPath(filePath) {
//     fetch(filePath)
//         .then(response => response.arrayBuffer())
//         .then(data => {
//             const workbook = XLSX.read(data, { type: 'array' });
//             const sheetName = workbook.SheetNames[0];
//             const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//             // Process the Excel data
//             processExcelData(jsonData);
//         })
//         .catch(error => console.error('Error loading Excel file:', error));
// }

// // Function to process Excel data and update candidates and topics
// function processExcelData(data) {
//     candidates = [];
//     topics = new Set();  // Use a set to handle unique topics automatically

//     data.forEach(row => {
//         const candidateName = row.name;
//         const image = row.image;
//         const partySymbol = row.partySymbol;
//         const title = row.title;
//         const description = row.description;
//         const page = row.page;
//         const link = row.link;
//         const topic = row.topic;

//         topics.add(topic); // Add topic to the set (duplicates are automatically handled)

//         let candidate = candidates.find(c => c.name === candidateName);
//         if (!candidate) {
//             candidate = {
//                 name: candidateName,
//                 image: image,
//                 partySymbol: partySymbol,
//                 promises: {}
//             };
//             candidates.push(candidate);
//         }
        
//         // If the topic already exists, push the promise into the existing array
//         if (!candidate.promises[topic]) {
//             candidate.promises[topic] = [];
//         }
//         candidate.promises[topic].push({ title, description, page, link, topic });
//     });

//     topics = Array.from(topics);

//     // Create sections for each topic
//     createSectionsForTopics(topics);

//     // Update the UI with new candidates and topics
//     populateCandidateCheckboxes(candidates);
//     populateTopicCheckboxes(topics);
//     updateDisplay();
// }

// // Function to create sections for each topic
// function createSectionsForTopics(topics) {
//     const contentContainer = d3.select("#content");
//     contentContainer.html(''); // Clear existing content

//     topics.forEach(topic => {
//         const topicSection = contentContainer.append("div")
//             .attr("id", `${topic.toLowerCase().replace(/\s+/g, '-')}-section`)
//             .attr("class", "topic-section");

//         topicSection.append("div")
//             .attr("class", "section-title-container")
//             .append("h2")
//             .attr("class", "section-title")
//             .text(topic);

//         topicSection.append("div")
//             .attr("class", "candidate-card-container")
//             .attr("id", `${topic.toLowerCase().replace(/\s+/g, '-')}`);
//     });
// }

// function populateCandidateCheckboxes(candidates) {
//     const candidateCheckboxesContainer = d3.select("#candidate-checkboxes");
//     candidateCheckboxesContainer.html(''); // Clear existing content

//     // "All" option
//     const allLabel = candidateCheckboxesContainer.append("label");
//     allLabel.append("input")
//         .attr("type", "checkbox")
//         .attr("value", "all")
//         .on("change", function() {
//             const isChecked = this.checked;
//             candidateCheckboxesContainer.selectAll("input").property("checked", isChecked);
//             updateDisplay();
//         });
//     allLabel.append("span").text("All");
//     allLabel.append("br");

//     candidates.forEach(candidate => {
//         const checkboxLabel = candidateCheckboxesContainer.append("label");
//         checkboxLabel.append("input")
//             .attr("type", "checkbox")
//             .attr("value", candidate.name)
//             .on("change", updateDisplay);
//         checkboxLabel.append("span").text(candidate.name);
//         checkboxLabel.append("br");
//     });
// }

// function populateTopicCheckboxes(topics) {
//     const topicCheckboxesContainer = d3.select("#topic-checkboxes");
//     topicCheckboxesContainer.html(''); // Clear existing content

//     // "All" option
//     const allLabel = topicCheckboxesContainer.append("label");
//     allLabel.append("input")
//         .attr("type", "checkbox")
//         .attr("value", "all")
//         .on("change", function() {
//             const isChecked = this.checked;
//             topicCheckboxesContainer.selectAll("input").property("checked", isChecked);
//             updateDisplay();
//         });
//     allLabel.append("span").text("All");
//     allLabel.append("br");

//     topics.forEach(topic => {
//         const checkboxLabel = topicCheckboxesContainer.append("label");
//         checkboxLabel.append("input")
//             .attr("type", "checkbox")
//             .attr("value", topic)
//             .on("change", updateDisplay);
//         checkboxLabel.append("span").text(topic);
//         checkboxLabel.append("br");
//     });
// }

// function updateDisplay() {
//     const selectedCandidates = [];
//     d3.selectAll("#candidate-checkboxes input:checked").each(function() {
//         if (this.value !== "all") {
//             selectedCandidates.push(this.value);
//         }
//     });

//     const selectedTopics = [];
//     d3.selectAll("#topic-checkboxes input:checked").each(function() {
//         if (this.value !== "all") {
//             selectedTopics.push(this.value);
//         }
//     });

//     let filteredCandidates = candidates;

//     if (selectedCandidates.length > 0) {
//         filteredCandidates = filteredCandidates.filter(candidate => selectedCandidates.includes(candidate.name));
//     }

//     topics.forEach(topic => {
//         const sectionId = `#${topic.toLowerCase().replace(/\s+/g, '-')}`;
//         d3.select(sectionId).selectAll(".candidate-card").remove(); // Clear existing cards
//     });

//     filteredCandidates.forEach(candidate => {
//         Object.keys(candidate.promises).forEach(topic => {
//             if (selectedTopics.length === 0 || selectedTopics.includes(topic)) {
//                 createOrUpdateCandidateCard(`#${topic.toLowerCase().replace(/\s+/g, '-')}`, candidate, candidate.promises[topic], topic.toLowerCase().replace(/\s+/g, '-'));
//             }
//         });
//     });

//     topics.forEach(topic => {
//         const sectionId = `#${topic.toLowerCase().replace(/\s+/g, '-')}-section`;
//         if (d3.select(`#${topic.toLowerCase().replace(/\s+/g, '-')}`).selectAll(".candidate-card").empty()) {
//             d3.select(sectionId).classed("hidden", true);
//         } else {
//             d3.select(sectionId).classed("hidden", false);
//         }
//     });
// }

// function createOrUpdateCandidateCard(containerId, candidate, promises, promiseClass) {
//     const container = d3.select(containerId);

//     // Loop through promises and create or update candidate cards with a default white background color
//     promises.forEach(promise => {
//         let candidateCard = container.select(`.candidate-card[data-candidate="${candidate.name}-${promise.topic}"]`);

//         // If not, create a new card
//         if (candidateCard.empty()) {
//             candidateCard = container.append("div")
//                 .attr("class", `candidate-card ${promiseClass}`)
//                 .attr("data-candidate", `${candidate.name}-${promise.topic}`)
//                 .style("background-color", "#ffffff"); // Set background color to white

//             candidateCard.append("img")
//                 .attr("src", candidate.image)
//                 .attr("alt", candidate.name);

//             candidateCard.append("div")
//                 .attr("class", "party-symbol")
//                 .append("img")
//                 .attr("src", candidate.partySymbol)
//                 .attr("alt", `${candidate.name} party symbol`);

//             candidateCard.append("h3")
//                 .text(candidate.name);

//             candidateCard.append("div")
//                 .attr("class", "promises-container");
//         }

//         // Add the new promises to the existing card
//         const promisesContainer = candidateCard.select(".promises-container");

//         const promiseElement = promisesContainer.append("div")
//             .attr("class", `promise ${promiseClass}`)
//             .html(`<p class="promise-title">${promise.title}</p><p class="promise-page">Page: ${promise.page}</p><p>${promise.description}</p>`);

//         // Add the "Reference" button under each promise if there's a valid link
//         if (promise.link && promise.link.trim() !== '') {
//             promiseElement.append("button")
//                 .attr("class", "reference-button")
//                 .text("Reference")
//                 .on("click", () => {
//                     window.open(promise.link, '_blank');
//                 });
//         }
//     });
// }

// function toggleCheckboxes(id) {
//     const checkboxes = document.getElementById(id);
//     checkboxes.style.display = checkboxes.style.display === "block" ? "none" : "block";
// }

// // Load the Excel file from the specified path
// loadExcelFromPath('candidates_data.xlsx'); // Replace with the actual path to your Excel file


let candidates = [];
let topics = [];
let topicColors = {};  // Object to store colors for each topic

function loadExcelFromGoogleSheet(sheetUrl) {
    fetch(sheetUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.arrayBuffer();
    })
    .then(data => {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log('Fetched Data:', jsonData);  // Debugging: log fetched data

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
        
        // If the topic already exists, push the promise into the existing array
        if (!candidate.promises[topic]) {
            candidate.promises[topic] = [];
        }
        candidate.promises[topic].push({ title, description, page, link, topic });
    });

    topics = Array.from(topics);

    console.log('Processed Candidates:', candidates);  // Debugging: log candidates array
    console.log('Processed Topics:', topics);  // Debugging: log topics array

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

function createOrUpdateCandidateCard(containerId, candidate, promises, promiseClass) {
    const container = d3.select(containerId);

    // Loop through promises and create or update candidate cards with a default white background color
    promises.forEach(promise => {
        let candidateCard = container.select(`.candidate-card[data-candidate="${candidate.name}-${promise.topic}"]`);

        // If not, create a new card
        if (candidateCard.empty()) {
            candidateCard = container.append("div")
                .attr("class", `candidate-card ${promiseClass}`)
                .attr("data-candidate", `${candidate.name}-${promise.topic}`)
                .style("background-color", "#ffffff"); // Set background color to white

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

        // Add the new promises to the existing card
        const promisesContainer = candidateCard.select(".promises-container");

        const promiseElement = promisesContainer.append("div")
            .attr("class", `promise ${promiseClass}`)
            .html(`<p class="promise-title">${promise.title}</p><p class="promise-page">Page: ${promise.page}</p><p>${promise.description}</p>`);

        // Add the "Reference" button under each promise if there's a valid link
        if (promise.link && promise.link.trim() !== '') {
            promiseElement.append("button")
                .attr("class", "reference-button")
                .text("Reference")
                .on("click", () => {
                    window.open(promise.link, '_blank');
                });
        }
    });
}

function toggleCheckboxes(id) {
    const checkboxes = document.getElementById(id);
    checkboxes.style.display = checkboxes.style.display === "block" ? "none" : "block";
}

// Load the Excel file from the Google Sheets URL
loadExcelFromGoogleSheet('https://docs.google.com/spreadsheets/d/1_q6IaRErhJnPM_pTwiI7pGvOTJ4PJJRMTaz4zr-rmio/export?format=xlsx'); // Replace with the actual Google Sheets URL in export format
