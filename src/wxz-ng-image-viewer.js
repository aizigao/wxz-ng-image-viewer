/**
 * Created by wenhui.gao on 2016/8/18/018.
 * canvas + css3 的图片查看器
 */


'use strict';
angular.module('wxz-ng-img-viewer', [])
  /**
   * 图片查看的服务
   */
  .provider('wxzNgImageViewer', [function () {
    this.$get = [function () {
      var mainContainer,
        canvas,
        scaleValueELe,
        context,
        isshow = false, isMouseDown = false,
        sta = { x: "", y: "" }, end = { x: '', y: '' },//鼠标位置记录
        DEFAULT_OPTIONS = {
          repeat: 1,
          max: 5,
          min: 0.1,
          step: 0.1
        },
        cRect = { x: 0, y: 0, scale: 1 } // 变换用的数据
      /*---------------公有方法------------------*/

      /**
       * 设置transform matrix3d 方法
       * @param domEle 要执行matrix3d有dom对象
       */
      function transform(domEle) {
        domEle.style.msTransform = "matrix(" + cRect.scale + ", 0, 0," + cRect.scale + "," + cRect.x + "," + cRect.y + ")";
        domEle.style.msTransform = "matrix3d(" + cRect.scale + ", 0, 0, 0, 0," + cRect.scale + ", 0, 0, 0, 0, 1, 0," + cRect.x + "," + cRect.y + ", 0, 1)"
        domEle.style.webkitTransform = "matrix3d(" + cRect.scale + ", 0, 0, 0, 0," + cRect.scale + ", 0, 0, 0, 0, 1, 0," + cRect.x + "," + cRect.y + ", 0, 1)"
        domEle.style.transform = "matrix3d(" + cRect.scale + ", 0, 0, 0, 0," + cRect.scale + ", 0, 0, 0, 0, 1, 0," + cRect.x + "," + cRect.y + ", 0, 1)"
      }

      /**
       * 计算图片区域的参数
       * @param maxWidth  最大宽度
       * @param maxHeight 最大高度
       * @param width     图片的宽
       * @param height    图片的高
       * @returns {{top: number, left: number, width: number, height: number}} 返回图片的相对坐标和大小
       */
      function fclacImgZoomParam(maxWidth, maxHeight, width, height) {
        var param = {
          top: 0,
          left: 0,
          width: width,
          height: height
        },
          rateWidth, rateHeight;

        if (width > maxWidth || height > maxHeight) {
          rateWidth = width / maxWidth;
          rateHeight = height / maxHeight;

          if (rateWidth > rateHeight) {
            param.width = maxWidth;
            param.height = Math.round(height / rateWidth);
          } else {
            param.width = Math.round(width / rateHeight);
            param.height = maxHeight;
          }
        }

        param.left = Math.round((maxWidth - param.width) / 2);
        param.top = Math.round((maxHeight - param.height) / 2);
        return param;
      }

      /**
       * 调整canvas位置
       * @param repeatNum 图片重复次数
       */
      function adjustViewSize(repeatNum) {

        var mainRect = mainContainer.getBoundingClientRect(), //为支持响应式 应重新获取大小
          MAXWIDTH = mainRect.width,
          MAXHEIGHT = mainRect.height,
          rel_W, rel_H,
          rect = fclacImgZoomParam(MAXWIDTH, MAXHEIGHT, canvas.width, canvas.height); //调整canvas的显示大小

        //初始化位置
        canvas.style.left = (MAXWIDTH - repeatNum * rect.width) / 2 + "px";
        canvas.style.top = (MAXHEIGHT - repeatNum * rect.height) / 2 + "px";

        //初始化大小
        canvas.style.width = repeatNum * rect.width + "px";
        canvas.style.height = repeatNum * rect.height + "px";


        //重置位置与缩放
        cRect = { x: 0, y: 0, scale: 1 }

        //设置缩放大小
        cRect.scale = parseFloat(1 / repeatNum);


        rel_W = repeatNum * rect.width * cRect.scale;
        rel_H = repeatNum * rect.height * cRect.scale;

        //重置大小

        transform(canvas);
      }

      /**
       * 获取鼠标的相对坐标
       * @param canvas canvas dom对象
       * @param evt 鼠标事件
       * @returns {{x: number, y: number}} 返回相对坐标
       */
      function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        if (evt.touches) {
          return {
            x: (evt.changedTouches[0].clientX - (rect.left)) * (canvas.width / rect.width),
            y: (evt.changedTouches[0].clientY - (rect.top)) * (canvas.height / rect.height)
          }
        }
        return {
          x: (evt.clientX - (rect.left)) * (canvas.width / rect.width),
          y: (evt.clientY - (rect.top)) * (canvas.height / rect.height)
        }
      }

      /******************************************
       * #控制移动的方法
       *******************************************/

      /**
       * 移动方法  -- 鼠标按下和移动时的共用方法
       * @param e 鼠标事件
       */
      function imgMove(e) {
        if (e.touches) {
          end.x = e.changedTouches[0].clientX;
          end.y = e.changedTouches[0].clientY;
        } else {
          end.x = e.clientX;
          end.y = e.clientY;
        }

        var w = end.x - sta.x
        var h = end.y - sta.y
        //通过改变 pos=absolute 的canvas的left top 实现移动
        cRect.x += w
        cRect.y += h
        transform(canvas)
      }

      /**
       * 移动方法 -- 鼠标按下时
       * @param e 鼠标事件
       */
      function changePosMousedown(e) {
        e.preventDefault();
        if (e.touches) {
          sta.x = e.changedTouches[0].clientX;
          sta.y = e.changedTouches[0].clientY;
        } else {
          sta.x = e.clientX;
          sta.y = e.clientY;
        }
        isMouseDown = true
      }

      /**
       * 移动方法 --鼠标移动
       * @param e 鼠标事件
       */
      function changePosMousemove(e) {
        if (!isMouseDown) return
        imgMove(e)
        sta.x = end.x
        sta.y = end.y
      }

      /**
       * 移动方法 --鼠标抬起
       * @param e 鼠标事件
       */
      function changePosMouseup(e) {
        imgMove(e)
        isMouseDown = false
      }


      /**********end控制移动的方法*********/


      /*******************************************
       * #中键放大的方法
       *******************************************/
      /**
       * 中键放大的方法
       * @param e 滑轮事件
       * @param max 最大放大值
       * @param min 最小缩小值
       * @param step 每次放大多大
       * @param repeat 图片重复次数
       */
      function scrollFunc(e, max, min, step, repeat) {
        var direction = 0;
        var scaleVal;
        e.preventDefault();
        if (e.wheelDelta) {
          direction = e.wheelDelta > 0 ? "up" : "down";
        } else if (e.detail) {
          direction = e.detail > 0 ? "down" : "up";
        }

        //计算放大倍数
        scaleVal = (
          direction === "up" ? parseFloat(cRect.scale + step) :
            direction === "down" ? parseFloat(cRect.scale - step) : null
        );

        //调速倍数在指定的范围内
        cRect.scale = (
          scaleVal > max ? max :
            scaleVal < min ? min :
              scaleVal
        );
        transform(canvas);
        showScaleVal(repeat, cRect.scale)
      }

      //显示当前大小
      function showScaleVal(repeat, scaleVal) {
        scaleValueELe.innerHTML = "大小: " + Math.round(repeat * scaleVal * 100) + " %"
      }
      /************end  中键放大的方法 **************/

      /*--------------- end 公有方法------------------*/

      //页面大小变化时调整canvas的位置
      // window.onresize = function() {
      //     if (!!isshow) {
      //         adjustViewSize()
      //     }
      // }


      /*-----------定义构造函数---------------*/
      /**
       * 定义构造函数
       * @param options 传入的参数对象
       * @constructor
       */
      var ImgView = function (options) {
        if (typeof options === "undefined") {
          this.options = DEFAULT_OPTIONS;
        } else {
          this.options = options;
        }
      };
      /**
       * 构造函数的方法
       * @type {{constructor: ImgView, setImg: ImgView.setImg, bind: ImgView.bind}}
       */
      ImgView.prototype = {
        constructor: ImgView,
        /**
         * 设置显示图片
         * @param img 图片的url
         */
        setImg: function (img) {
          var self = this,
            options = self.options,
            repeatNum = self.options.repeat || DEFAULT_OPTIONS.repeat,
            MAXSIZE = 8000, tmpsize = 0,
            w = img.width,
            h = img.height,
            i, j;
          //初始化dom元素及全局变量
          mainContainer = options.cont;
          canvas = mainContainer.querySelector(".wxz-img-view-canvas");
          context = canvas.getContext('2d');
          scaleValueELe = mainContainer.querySelector(".wxz-scale-value");
          isshow = true;

          canvas.width = w * repeatNum;
          canvas.height = h * repeatNum;
          if (canvas.width > MAXSIZE) {
            tmpsize = canvas.width;
            canvas.width = MAXSIZE;
            canvas.height = Math.round(canvas.height * (MAXSIZE / tmpsize));
            w = Math.round(canvas.width / repeatNum);
            h = Math.round(canvas.height / repeatNum);
          }
          if (canvas.height > MAXSIZE) {
            tmpsize = canvas.height;
            canvas.height = MAXSIZE;
            canvas.width = Math.round(canvas.height * (MAXSIZE / tmpsize));
            w = Math.round(canvas.width / repeatNum);
            h = Math.round(canvas.height / repeatNum);
          }
          for (i = 0; i < repeatNum; i++) {
            for (j = 0; j < repeatNum; j++) {
              context.drawImage(img, j * w, i * h, w, h);
            }
          }

          //除去上次的tool的操作坐标
          sta = { x: "", y: "" }, end = { x: '', y: '' };

          //显示当前的大小
          angular.element(scaleValueELe).removeClass('out')
          angular.element(scaleValueELe).addClass('in')

          adjustViewSize(repeatNum) //调整显示大小
          self.bind() // 绑定其它方法
        },
        /**
         * 绑定事件
         */
        bind: function () {
          var self = this,
            repeatNum = +self.options.repeat || DEFAULT_OPTIONS.repeat,


            max = (+self.options.max || +DEFAULT_OPTIONS.max) / repeatNum,
            min = (+self.options.min || +DEFAULT_OPTIONS.min) / repeatNum,
            step = (+self.options.step || +DEFAULT_OPTIONS.step) / repeatNum;


          /*-----------------  移动图像方法   ---------------------*/
          mainContainer.addEventListener('mousedown', changePosMousedown)
          mainContainer.addEventListener('mousemove', changePosMousemove)
          mainContainer.addEventListener('mouseup', changePosMouseup)

          //移动端
          // mainContainer.addEventListener('touchstart', changePosMousedown)
          // mainContainer.addEventListener('touchend', changePosMouseup)
          //
          /*-----------------end 移动图像方法---------------------*/


          /*------------------放大与缩小 ---------------------*/
          //中键
          mainContainer.addEventListener('DOMMouseScroll', function (e) {
            scrollFunc(e, max, min, step, repeatNum)
          }); //firefox
          mainContainer.addEventListener('mousewheel', function (e) {
            scrollFunc(e, max, min, step, repeatNum)
          }) // 其它
          showScaleVal(repeatNum, cRect.scale)
          /*----------------- end 放大缩小 --------------------*/
        }
      };

      return {
        /**
         * 生成新的实例
         * @param options 传入参数
         * @returns {ImgView} 新的实例
         */
        init: function (options) {
          return new ImgView(options)
        }
      };
      //end $get
    }];
  }])
  /**
   * 指令
   * @param img-src  图像的src
   * @param repeat   图像重复次数
   * @param max      最大值
   * @param min      最小值 (大于0的数)
   */
  .directive('wxzNgImageViewer', ['wxzNgImageViewer', function (wxzNgImageViewer) {
    return {
      templateUrl: '../src/template.html',
      restrict: 'EA',
      transclude: true,
      replace: true,
      scope: { },
      link: function (scope, element, attrs) {
        /**
         * 默认的参数
         * @type {{repeat: null, max: null, min: null, cont: *}}
         */
        var defaultOptions = {
          repeat: null,
          max: null,
          min: null,
          cont: element[0]
        }
        if (!angular.isUndefined(attrs.max)) {
          defaultOptions.max = +attrs.max
        }
        if (!angular.isUndefined(attrs.min)) {
          defaultOptions.min = +attrs.min
        }
        if (!angular.isUndefined(attrs.defalutValue)) {
          defaultOptions.defalutValue = +attrs.defalutValue
        }

        if (!angular.isUndefined(attrs.repeat)) {
          defaultOptions.repeat = +attrs.repeat
        }

        var imgview = wxzNgImageViewer.init(defaultOptions)
        scope.$parent.$watch(attrs.imgSrc, function (newVal, oldVal) {
          if (angular.isUndefined(newVal)) {
            return
          }
          var _newImg = new Image();
          _newImg.src = newVal;
          _newImg.onload = function () {
            imgview.setImg(_newImg);
          }

        })
        //end link
      }
    }
  }]);

