'use strict';

(function() {
    app.data.mayorMobile = new Everlive({
            offlineStorage: true,
            appId: 'j9r2bccktwpkc2sz',
            scheme: 'https',
            authentication: {
                persist: true
            }
        })
}());