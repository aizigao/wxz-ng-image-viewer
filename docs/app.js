var app = angular.module('app', ['wxz-ng-img-viewer']);

app.controller('MainCtrl', function ($scope) {
  //url
  $scope.imgSrc = 'http://www.w3school.com.cn/i/eg_tulip.jpg'

  // set by scope
  $scope.imgs = [
    {
      name: '001',
      url: './images/001.jpg',
    },
    {
      name: '002',
      url: './images/002.jpg',
    }, {
      name: '003',
      url: './images/003.jpg'
    }
  ]
  $scope.select = function (img) {
    $scope.imgSrc = img.url
  }
});
