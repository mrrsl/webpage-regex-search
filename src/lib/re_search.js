import {
    Message,
    MessageType
} from './message_protocol.js'

import {
    DefaultHighlightOptions,
    HighlightReplacement
} from './highlight_replacement.js';

const TAGNAME_EXCLUDE = {
    "SCRIPT": true,
    "STYLE": true,
}

const DefaultCurrentMatchColor = {
    color: "Blue",
    backgroundColor: "Yellow"
}

if (window.hasRun) return;
window.hasRun = true;

/**
 * Retrieve an array containing all {@link Text} within the given element including its children.
 * 
 * @param {Node} parentNode
 */
function AggregateTextNodes(parentNode) {
    // Final filtered Text list
    let list = [];
    // Non-Text nodes that require further searching
    let subqueue = [];
    subqueue.push(parentNode);

    while (subqueue.length > 0) {
        let parent = subqueue.shift();
        // push subnodes into the queue
        for (let child of parent.childNodes) {
            // Exclude script elements from the final node list
            if (node.nodeType == Node.TEXT_NODE  && !TAGNAME_EXCLUDE[node.parentElement.tagName]) {
                list.push(node);
            }
            else {
                subqueue.push(child);
            }
        }
    }
    return list;
}
/**
 * Returns a simple object with the same property names as a default object. If a given object shares a property name,
 * use the given object's property value instead. Note this function does not expected nested objects in either parameter.
 * 
 * @param {object} defaultOptions An options object. The returned object will have indentical property names to this object.
 * @param {object} givenOptions An options object. Any property name shared with defaultOptions will use this object's value in the returned object.
 * 
 * @returns {object} Guarunteed valid set of configuration options.
 */
function SafeConfigParse(defaultOptions, givenOptions) {

    if (!givenOptions)
        return structuredClone(defaultOptions);

    let finalSettings = {};

    for (let setting of Object.keys(defaultOptions)) {
        if (givenOptions.hasOwnProperty(setting)) {
            finalSettings[setting] = givenOptions[setting];
        } else {
            finalSettings[setting] = defaultOptions[setting];
        }
    }
    return finalSettings;
}

/**
 * This class should be the container for state information.
 */
export class Searcher {

    constructor(root = document.body, colorOptions = DefaultHighlightOptions, matchedColorOptions) {

        /** The first node to start searching from. */
        this.RootNode = root;

        /** List of all Text nodes present in the DOM body. */
        this.TextNodes = AggregateTextNodes(root);

        /** List of all {@link HighlightReplacement} created by the last search call. */
        this.ReplacedText = [];

        /** List of individual <a> elements that contain matched text.
         * @type Element[]
         */
        this.TrueMatchList = [];
        this.Colors = SafeConfigParse(DefaultHighlightOptions, colorOptions);
        this.CurrentMatchColors = SafeConfigParse(DefaultCurrentMatchColor, matchedColorOptions);
        this.CurrentMatch = null;
        
    }
    UpdateRoot(newRoot) {
        this.RootNode = newRoot;
    }
    /**
     * Call this if text on the DOM has changed.
     */
    Update() {
        this.Revert();
        /**@type Text[] */
        this.TextNodes = AggregateTextNodes(this.RootNode);
    }
    /**
     * Call to restore the original document.
     */
    Revert() {
        // Make sure we clear every field that might contain a reference to a DOM element
        for (let swapped of this.ReplacedText) {
            swapped.Unswap();
        }
        this.ReplacedText = [];
        this.TrueMatchList = [];
        this.CurrentMatch = null;
    }
    /**
     * Carry out a search of all strings within {@link TextNodes} and highlight matched text in the DOM.
     * @param {string} searchstr 
     */
    Search(searchstr, multiFlag = true, caseFlag = false) {
        
        if (this.ReplacedText.length > 1)
            this.Update();
        if (searchstr.length === 0)
            return;

        let flags = "g";

        if (multiFlag)
            flags += "m";
        if (caseFlag)
            flags += "i"

        let searchExpression = new RegExp(searchstr, flags);

        for (let tnode of this.TextNodes) {
            setTimeout(() => {
                let matches = [...tnode.data.matchAll(searchExpression)];
                // Observed some that some text nodes have a null parentElement/parentNode
                if (matches.length > 0 && tnode.parentElement) {

                    let ranges = matches.map(
                        (result) => [result.index, result.index + result[0].length]
                    );

                    let swappedElement = new HighlightReplacement(ranges, tnode);
                    this.ReplacedText.push(swappedElement);
                    this.TrueMatchList = this.TrueMatchList.concat(swappedElement.matches);

                    swappedElement.Swap();
                }
            }, 0);
            
        }
    }

    /**
     * Change highlight options.
     * @param {Object} options 
     */
    ChangeHighlightColor(options = DefaultHighlightOptions) {

        this.Colors = SafeConfigParse(DefaultHighlightOptions, options);

        for (let matchedElement of this.ReplacedText) {
            matchedElement.ChangeColor(this.Colors);
        }
    }

    /**
     * Function to scroll the matched element into view.
     * @param {number} index 
     * @returns {void} 
     */
    JumpTo(index) {
        if (this.ReplacedText.length == 0) return;
        else {
            this.TrueMatchList[index].scrollIntoView();
        }
    }

    /**
     * 
     * @returns Number of regex matches.
     */
    GetNumMatches() {
        return this.TrueMatchList.length;
    }

    /**
     * 
     * @param {number} index The index of the desired match.
     * @returns Returns null if index is invalid, otherwise returns a string.
     */
    GetMatchInfo(index) {
        if (index >= this.TrueMatchList.length || index < 0)
            return null;

        this.SetCurrentMatch(index);
        return this.TrueMatchList[index].textContent;
    }

    /**
     * Sets a matched string as the "focused match", giving it a distinct highlight color.
     * @param {number} index 
     * @returns {void}
     */
    SetCurrentMatch(index) {
        if (index >= this.TrueMatchList.length || index < 0)
            return;

        this.CurrentMatch = this.TrueMatchList[index];
        this.CurrentMatch.style.color = this.CurrentMatchColors.color;
        this.CurrentMatch.style.backgroundColor = this.CurrentMatchColors.backgroundColor;
    }

    /**
     * Clears the distinct highlight for a focused match.
     * @param {number} index 
     * @returns {void}
     */
    ClearCurrentMatch(index) {
        if (index >= this.TrueMatchList.length || index < 0 || this.CurrentMatch == null)
            return;

        this.CurrentMatch.style.color = this.Colors.color;
        this.CurrentMatch.style.backgroundColor = this.Colors.backgroundColor;
        this.CurrentMatch = null;
    }
}

let searchInstance = new Searcher(document.body);

/**
 * Event handler to handle search requests from our browser action.
 * @param message 
 */
function SearchEventHandler(message) {
    if (!message)
        return;

    switch(message.command) {

        case MessageType.SEARCH:

            searchInstance.Revert();
            searchInstance.Search(message.params[0]);

            let sentNumMessage = new Message(MessageType.SENT_NUM, null);
            let sentMaxMessage = new Message(MessageType.SENT_MAX, [0]);

            if (searchInstance.GetNumMatches() != 0) {
                sentNumMessage.params = [0, searchInstance.GetMatchInfo(0)];
                sentMaxMessage.params[0] = searchInstance.GetNumMatches();
                browser.runtime.sendMessage(sentNumMessage);
                browser.runtime.sendMessage(sentMaxMessage);
            }
            break;

        case MessageType.CHANGE_COLOR:

            searchInstance.ChangeHighlightColor(SafeConfigParse(DefaultHighlightOptions, message.params[0]));
            break;

        case MessageType.CLEAR:

            searchInstance.Revert();
            break;

        case MessageType.JUMP_TO:

            searchInstance.JumpTo(message.params[0]);
            break;

        case MessageType.GET_NUM:

            let match = searchInstance.GetMatchInfo(message.params[0]);

            if (match) {
                browser.runtime.sendMessage(new Message(MessageType.SENT_NUM, [message.params[0], match]));
                searchInstance.SetCurrentMatch(message.params[0]);
            }
            break;

        case MessageType.CLEAR_CURRENT:

            searchInstance.ClearCurrentMatch();
            break;

        default:
            break;
    }
}
browser.runtime.onMessage.addListener(SearchEventHandler);