export const handleMapLoadHtml = /* js */ `
  // -- handle map onload event
  map.on('load', function(event) {
    loggerInstance.log('Map loaded', event);
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'maploaded',
    }));
  });
`;
