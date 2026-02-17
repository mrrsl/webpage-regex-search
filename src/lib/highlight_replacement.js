/** Options interface for styling highlighted text. */
export const DefaultHighlightOptions = {
    color: "white",
    backgroundColor: "green",
}

/** Class name for <a> elements containing matched text. */
const NON_MATCH_CLASS = "re-search_non_matching";
/** Class name for <a> elmenets containing matched text. */
const MATCH_CLASS = "re-search_matching";

/** 
 * Utility function to make an inline element containing only our text.
 * @param {string} text The text to appear in the created element.
 * @returns An <a> element with the given text, set to display as an inline block.
 */
function CreateTextElement(text) {
    
    let e = document.createElement('span');
    let t = document.createTextNode(text);
    e.appendChild(t);
    return e;
}

/**
 * Helper function for {@link HighlightReplacement}. Creates an element holding slices of a given string, divided according to a sorted,
 * two-dimensional array of index ranges.
 * 
 * @param {string} str 
 * @param {Array} segmentRanges Two-dimensional array of the form [[x, y],...]. Follows the same indexing of {@link String.prototype.substring}.
 * @param {string} textColor Color string compatible with {@link CSSStyleDeclaration}.
 * @param {string} backgroundColor Color string compatible with {@link CSSStyleDeclaration}.
 * 
 * @returns Returns an element that may contain multiple text segments contained in their own <a> elements.
 */
function SeparateString(str, segmentRanges, textColor = "", backgroundColor = "") {

    let stringPointer = 0;
    let container = document.createElement('span');
    let rightBound = segmentRanges[segmentRanges.length - 1][1];

    for (let pair of segmentRanges) {

        let enc = CreateTextElement(str.substring(pair[0], pair[1]));
        enc.style.color = textColor;
        enc.style.backgroundColor = backgroundColor;
        enc.className = MATCH_CLASS;

        if (pair[0] > stringPointer) {
            let nonmatch = CreateTextElement(str.substring(stringPointer, pair[0]));
            nonmatch.className = NON_MATCH_CLASS;
            container.appendChild(nonmatch);
        }
        stringPointer = pair[1];
        container.appendChild(enc);
    }
    if (rightBound < str.length) {
        container.appendChild(CreateTextElement(str.substring(rightBound, str.length)));
    }
    return container;
}

/**
 * For every Text node that has a match, we'll need to separate the matches into their own element so that we can apply highlightning.
 * This needs to be a reversible process so our replacement will be kept as one entity and carry a reference to the Text it just replaced.
 */
export class HighlightReplacement {
    /**
     * creates a text node replacement that adds highlight styling to matched text.
     * 
     * @param {Array<Array<Number>>} matchRanges Beginnning and end ranges for highlighted text sections.
     * @param {HTMLElement} textnode 
     * @param {*} colorOptions 
     */
    constructor(matchRanges = [[0, 0]], textnode = null, colorOptions = DefaultHighlightOptions) {

        let text = (textnode)? textnode.data: "";

        /**@type HTMLSpanElement */
        this.wrapper = SeparateString(text, matchRanges, colorOptions.color, colorOptions.backgroundColor);

        /**@type Node */
        this.swap = textnode;

        this.matches = [];
        for (let atag of this.wrapper.children) {
            if (atag.className == MATCH_CLASS){
                this.matches.push(atag);
            }
        }
    }

    /** Swaps the wrapper element with the Text node it originally replaced. This also reassigns all fields to null to avoid potential memory leaks. */
    Unswap() {

        this.wrapper.replaceWith(this.swap);
        this.wrapper = null;
        this.swap = null;
    }

    /** Swaps the Text node with the wrapper it is meant to replace. */
    Swap() {

        if (this.swap)
            this.swap.parentElement.replaceChild(this.wrapper, this.swap);
    }
    
    /** Changes the highlight color scheme. */
    ChangeColor(colorObj = DefaultHighlightOptions) {

        for (let el of this.wrapper.children) {
            if (el.className == MATCH_CLASS) {
                el.style.color = colorObj.color;
                el.style.backgroundColor = colorObj.backgroundColor
            }
        }
    }
}