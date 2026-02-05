let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#image input");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="api key";

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    },
    lastImage: null // Store the last image
};

async function generateResponse(aiChatBox, isImageQuery) {
    let text = aiChatBox.querySelector(".ai-chat-area");

    let requestBody = {
        "contents": [
            {
                "parts": [
                    { text: user.message }
                ]
            }
        ]
    };

    

    // If the user is referring to a previously uploaded image, include it in the request
    if (isImageQuery && user.lastImage) {
        requestBody.contents[0].parts.push({
            inline_data: user.lastImage
        });
    }

    let requestOptions = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    };

    try {
        let response = await fetch(Api_Url, requestOptions);
        let data = await response.json();
        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        text.innerHTML = apiResponse;
    } catch (error) {
        console.log(error);
        text.innerHTML = "Sorry, something went wrong!";
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        image.src = `img.svg`;
        image.classList.remove("choose");
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handleChatResponse(userMessage) {
    let isImageQuery = userMessage.toLowerCase().includes("what") || userMessage.toLowerCase().includes("describe") || userMessage.toLowerCase().includes("identify");

    user.message = userMessage;
    let html = `<img src="user.png" alt="" id="userImage" width="8%">
    <div class="user-chat-area">
        ${user.message}
        ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
    </div>`;

    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);

    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let html = `<img src="ai.png" alt="" id="aiImage" width="10%">
        <div class="ai-chat-area">
        <img src="loading.webp" alt="" class="load" width="50px">
        </div>`;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox, isImageQuery);
    }, 600);
}

prompt.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        handleChatResponse(prompt.value);
    }
});

submitbtn.addEventListener("click", () => {
    handleChatResponse(prompt.value);
});

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };

        // Save the image for future queries
        user.lastImage = { ...user.file };

        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");
    };

    reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
    imagebtn.querySelector("input").click();
});
