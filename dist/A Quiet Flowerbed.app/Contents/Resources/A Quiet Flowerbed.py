import webview

# Open website
window = webview.create_window('A Quiet Flowerbed', 'index.html')
webview.start(debug=True)