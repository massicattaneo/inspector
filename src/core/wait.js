const wait = {
    time: time => {
        return new Promise(resolve => {
            setTimeout(resolve, time);
        });
    }
};

module.exports = { wait };
