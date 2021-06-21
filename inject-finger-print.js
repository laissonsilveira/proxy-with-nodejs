/*eslint require-yield: off*/
const { loadFingerPrint } = require('./finger-print-builder');

module.exports = directory => {
    const fingerPrint = loadFingerPrint('default', directory);
    return {
        summary: 'FingerPrint Scripts Injection ',
        *beforeSendResponse(requestDetail, responseDetail) {
            const newResponse = responseDetail.response;
            if (newResponse?.statusCode === 200 && newResponse?.header['Content-Type']?.includes('text/html') && newResponse?.body) {
                const { body } = newResponse;
                const fingerPrintScript = `<script>${fingerPrint}</script>`;

                const bodyStr = body?.toString();
                if (bodyStr?.includes('<head>'))
                    newResponse.body = Buffer.from(bodyStr.replace('<head>', `<head>${fingerPrintScript}`));
                else
                    __LOGGER_FINGERPRINT.silly(`[inject-finger-print] Could not find <head> tag to inject scripts in URL response: '${requestDetail?.url}'`);
            }
            return new Promise((resolve) => {
                resolve({ response: newResponse });
            });
        }
    };
};