const { EventEmitter, } = require('events');

const MAX_LISTENER_COUNT = 100;

/**
 * A global communication mechanism.
 */
class Relay {
    /**
     * Create an event bus over which all the module of the application will
     * communicate
     */
    constructor() {
        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(MAX_LISTENER_COUNT);
    }

    /**
     * notifies the listeners of passed events
     *
     * @public
     *
     * @param {String} event - The event to trigger.
     * @param {Array} args - the data parameters to be sent.
     * @returns {Relay} self for chaining purpose
     */
    emit(event, ...args) {
        this.emitter.emit(event, ...args);

        return this;
    }

    /**
     * add listener to one of the listener type
     *
     * @public
     *
     * @param {String} event - The event to listenTo
     * @param {Function} listener - function to handle the event
     *
     * @returns {Relay} self for chaining purpose
     */
    on(event, listener) {
        this.emitter.on(event, listener);

        return this;
    }

    /**
     * remove listener from one of the listener type
     *
     * @public
     *
     * @param {String} event -  The event to stop listening from
     * @param {Function} listener - function which was listening to it
     *
     * @returns {Relay} self for chaining purpose
     */
    removeListener(event, listener) {
        this.emitter.removeListener(event, listener);

        return this;
    }

    /**
     * add listener which will be called only once
     *
     * @public
     *
     * @param {String} event - The event to listenTo
     * @param {Function} listener - function to handle the event
     *
     * @returns {Relay} self for chaining purpose
     */
    once(event, listener) {
        this.emitter.once(event, listener);

        return this;
    }

    /**
     * return event listener count.
     *
     * @param {String} event - eventName to get its listener count
     *
     * @returns {Number} count of listeners
     *
     * @memberof Relay
     */
    listenerCount(event) {
        return this.emitter.listenerCount(event);
    }

    /**
     * mark for garbage collection
     *
     * @public
     *
     * @returns {undefined}
     */
    destroy() {
        this.emitter.removeAllListeners();

        this.emitter = null;
    }
}

module.exports = Relay;
