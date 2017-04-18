# wxzNgImageViewer — AngularJS directive of image viewer
![](http://ol3odnf2k.bkt.clouddn.com/github/wxz/wxz-ng-image-viewer.jpg) 
## Features

* set view scale max,min and step
* Angular 1.2+ without jQuery and other dependencies
* 


## Demo

local Demo in current path
```shell
npm i && gulp
```
then open http://localhost:3000/docs/

## Installation

You can download files through Bower:

```
bower install wxz-ng-image-viewer
```

or use npm:
```
npm install wxz-ng-image-viewer --save
```


## usage
need to include `wxz-ng-images-viewer-tpls.min.js` && `wxz-ng-images-viewer.min.css`

```javascript
  angular.module('myModule', ['wxzNgImageViewer']);
```

```html
   <wxz-ng-image-viewer
          img-src = "imgSrc"
          max='9'
          min='0.1'
          repeat = '2'
  ></wxz-ng-image-viewer>
```

## Attributes
  * img-src -- img path
  * max -- defalut:5, the max scale Value
  * min -- default:0.1, the min scale Value
  * repeat -- default:1, repeat times of img
  * step -- defalut:0.1, scale step