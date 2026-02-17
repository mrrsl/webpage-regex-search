import {
    Searcher
} from "../lib/re_search.js";

const searchInput = document.getElementById("search-input");
const searcherInstance = new Searcher();

/**
 * Input listener for the search bar.
 * 
 * @param {KeyboardEvent} event
 */
function searchInputListener(event) {
    
    if (event.key === "enter")
    {
        searcherInstance.Search(this.value, true, true);
    }
}

searchInput.addEventListener(searchInputListener);