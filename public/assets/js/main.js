function extractGameCodeFromUrl() {
    // Get the game code from the url path.
    return window.location.pathname.split('/').pop();
}

function extractQueryParametersFromUrl() {
    // Extract query parameters from url.
    var queryParams = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
        queryParams[key] = value;
    });
    return queryParams;
}

function serializeFormInputs(arr) {
    // Serialize form input data that can be used for a request.
    var data = {};
    $.each(arr, (i, field) => {
        data[field.name] = field.value;
    });
    return data;
}

function logError(error, consoleMsg) {
    // TODO: Need to handle errors in a better way.
    console.log(consoleMsg);
    console.log(error);
}