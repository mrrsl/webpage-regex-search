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
function searchInputListener(event) {
    
    if (event.key === "Enter")
    {
        debugger;
        const payload = new Message(MessageType.SEARCH, event.currentTarget.value);
        browser.tabs.sendMessage(payload);
        // Response will be here
    }
}

searchInput.addEventListener('keypress', searchInputListener);