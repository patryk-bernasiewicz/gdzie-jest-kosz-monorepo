export const styleHtml = /* html */ `
  <style>
    html, body, #map {
      margin: 0;
      padding: 0;
      height: 100vh;
      width: 100vw;
      -webkit-user-select: none;
      user-select: none;
    }

    .context-menu-marker {
      background-color: rgba(255, 0, 0, 0.5);
      border-radius: 50%;
      width: 15px;
      height: 15px;
      position: fixed;
      z-index: 1000;
    }

    .user-marker {
    }

    .bin-marker {
    }

    .closest-bin-marker {
      filter: hue-rotate(120deg) drop-shadow(0 0 8px rgba(0, 255, 0, 0.5));
    }
  </style>
`;
