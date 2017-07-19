/* file for some debug code snippets */

module.exports = (function() {
    return {

        logRequest: function(req) {
            if (process.env.NODE_ENV !== 'production') {
                console.log('---------');
                console.log(req.method + " at " + req.baseUrl + req.path);
                console.log('with query parameters');
                console.log(req.query);
                console.log('and body');
                console.log(req.body);
                if (req.session !== undefined) {
                    console.log('and session');
                    console.log(req.session);
                } else {
                    console.log('no session');
                }
                console.log('---------');
            }
        }

    };
})();
