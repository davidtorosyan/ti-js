// event.web
// =========

export function createEvent(type, options) {
    return new Event(type, options)
}

export function createEventTarget() {
    return document.createTextNode(null)
}
