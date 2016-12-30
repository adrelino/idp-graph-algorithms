# Visualization of advanced graph algorithms
push-relabel algorithm  
to solve the maximum flow problem  
label-setting algorithm  
to solve the shortest path problem with resource constraints  

An interdisciplinary project by Adrian Haarbach

## Development
Open index.html in Firefox or Safari, or run Google Chrome from the command line with the flag
`
--allow-file-access-from-files
`

Alternatively, install Node.js and run
`
npm init && npm install && grunt serve
`
which will start a local webserver and open index.html in the default browser.

All needed library files except for MathJax are already included. 
Since the MathJax library consists of a lot of individual files, we did not want to include it into the repository. Instead we implemented a fallback mechanism, meaning that if you do not copy a MathJax installation into the library folder, we fallback to a Content Delivery Network (CDN) to load the required files needed to render LaTeX math equations.

If you want to be able to see the rendered LaTeX equations even when not having an internet connection, download and install mathjax into the directory:
`
implementation/library/js/mathjax/
`

## Installation
Copy index.html and the implementation folder into the document root of your webserver.

