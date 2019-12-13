
const createBus = () => {
    let handlers = [];

    return {
        handle: (event, handlerFunc) => {
            handlers[event] = handlers[event] || [];
            handlers[event].push({
                handlerFunc
            });
        },
        send: (event, param) => {
            if (handlers[event])
                handlers[event].forEach(h => h.handlerFunc(param));
            else
                throw new Error('No handler for this event', event);
        }
    };
};

const bus = createBus();
bus.handle('someEvent', (param) => {
    console.log('someEvent called with param:', param);
});

try {
    bus.send('someEvent', 'Hello World!');
} catch (error) {
    console.log('ERROR: ' + error.message);
}
