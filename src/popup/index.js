import {
    MessageType,
    Message
} from "../lib/message_protocol.js";

const searchInput = document.getElementById("search-input");

/**
 * Input listener for the search bar.
 * 
 * @param {KeyboardEvent} event
 */
async function searchInputListener(event) {
    
    if (event.key === "Enter")
    {
        const currentTab = await browser.tabs.query({currentWindow: true, active: true})
        const payload = new Message(MessageType.SEARCH, [this.value]);
        browser.tabs.sendMessage(currentTab[0].id, payload);
        // Response will be here
    }
}

searchInput.addEventListener('keydown', searchInputListener);