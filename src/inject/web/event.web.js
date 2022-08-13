// event.web
// =========

export function createEventTarget() {
    return document.createTextNode(null)
}

export function dispatchEvent(eventTarget, eventName) {
    eventTarget.dispatchEvent(new Event(eventName))
}