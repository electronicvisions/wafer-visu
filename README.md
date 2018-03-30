# wafer-visu

A working example of the BrainScaleS wafer visualization tool. The recommended browser for this tool is Google Chrome/ Chromium. The files need to be hosted on a web server. This can be done with python:
```
# python 2
python -m SimpleHTTPServer

# python 3
python3 -m http.server
```

The visualization is started by opening main.html in the build folder.

[random_network.xml](build/random_network.xml) in the build folder is an example ```marocco::results``` hardware configuration file. To demonstrate the routing visualization, 100 routes between random source and target HICANNs have been created.

A complete documentation of the code as HTML document can be found in the [doc](doc) folder.
