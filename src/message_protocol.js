
export const MessageType = {
    /** Execute a search. */
    "SEARCH": 1,
    /** Have the content script tel lthe browser to jump to an element. */
    "JUMP_TO": 2,
    /** Clear the current search result. */
    "CLEAR": 3,
    /** Change the colors of the match highlight. */
    "CHANGE_COLOR": 4,
    /** Get a match according to the given index parameter. */
    "GET_NUM": 5,
    /** Signals the popup in response to a {@link GET_NUM} message. Also sets the match as a focused element. */
    "SENT_NUM": 6,
    /** Get the total number of matches found. */
    "GET_MAX": 7,
    /** Signals the popup in response to a {@link GET_MAX} message. */
    "SENT_MAX": 8,
    /** Clears the match currently set as focused. */
    "CLEAR_CURRENT": 9
};

/**
 * Invert key-value of MessageType so we have a two-way association
 */
export const MessageTypeInverse = InvertEnumKeyValue(MessageType);

function InvertEnumKeyValue(obj) {

    let o = {};
    
    for (let key of Object.keys(obj)) {
        o[obj[key]] = key;
    }
    return o;
}

export class Message {
    constructor(msgtype, params) {

        if (!MessageTypeInverse.hasOwnProperty(msgtype))
            throw new Error('Invalid message type');

        this.command = msgtype;
        this.params = params;
    }
    /**
     * For debugging purposes.
     * @returns Name of the code corresponding to {@link MessageType}.
     */
    GetTypeString() {
        return MessageTypeInverse[this.command];
    }
}